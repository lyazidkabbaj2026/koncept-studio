-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('carnet', 'personal_training', 'abonnement')),
  credits INTEGER NOT NULL,
  price_dhs INTEGER NOT NULL,
  validity_months INTEGER NOT NULL,
  validity_days INTEGER, -- For plans with specific day validity (like forfait weekly resets)
  weekly_limit INTEGER, -- For abonnement plans (sessions per week)
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE RESTRICT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  credits_remaining INTEGER NOT NULL,
  credits_used INTEGER DEFAULT 0,
  weekly_credits_used INTEGER DEFAULT 0, -- For abonnement tracking
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  last_weekly_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- For abonnement weekly resets
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription requests table (for pending user requests)
CREATE TABLE public.subscription_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE RESTRICT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'resolved', 'cancelled')),
  notes TEXT, -- Admin notes about the request
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  contacted_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_requests ENABLE ROW LEVEL SECURITY;

-- Policies for subscription_plans
-- Everyone can view active plans (for plan selection)
CREATE POLICY "Anyone can view active subscription plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

-- Admins can manage all plans
CREATE POLICY "Admins can manage subscription plans" ON public.subscription_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for user_subscriptions
-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions" ON public.user_subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can manage all subscriptions
CREATE POLICY "Admins can manage subscriptions" ON public.user_subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for subscription_requests
-- Users can view their own requests
CREATE POLICY "Users can view own subscription requests" ON public.subscription_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own requests
CREATE POLICY "Users can create subscription requests" ON public.subscription_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view and manage all requests
CREATE POLICY "Admins can manage subscription requests" ON public.subscription_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Update triggers for updated_at columns
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscription_requests_updated_at
  BEFORE UPDATE ON public.subscription_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, type, credits, price_dhs, validity_months, validity_days, weekly_limit, description) VALUES
-- Carnet plans
('Pack découverte', 'carnet', 3, 600, 1, NULL, NULL, '3 cours, valide 1 mois'),
('Carnet 10', 'carnet', 10, 1700, 2, NULL, NULL, '10 cours, valide 2 mois'),
('Carnet 20', 'carnet', 20, 2800, 3, NULL, NULL, '20 cours, valide 3 mois'),
('Carnet 30', 'carnet', 30, 3600, 4, NULL, NULL, '30 cours, valide 4 mois'),

-- Personal training plans
('10 séances de personal training', 'personal_training', 10, 2500, 2, NULL, NULL, '10 séances, valide 2 mois'),
('20 séances de personal training', 'personal_training', 20, 4500, 3, NULL, NULL, '20 séances, valide 3 mois'),
('30 séances de personal training', 'personal_training', 30, 6500, 5, NULL, NULL, '30 séances, valide 5 mois'),

-- Abonnement plans (unlimited credits with weekly limits)
('Forfait A', 'abonnement', 999999, 6000, 12, 7, 4, '4 séances par semaine - Annuel'),
('Forfait A (Mensuel)', 'abonnement', 999999, 500, 1, 7, 4, '4 séances par semaine - Mensuel'),
('Forfait B', 'abonnement', 999999, 8400, 12, 7, 6, '6 séances par semaine - Annuel'),
('Forfait B (Mensuel)', 'abonnement', 999999, 700, 1, 7, 6, '6 séances par semaine - Mensuel'),
('Forfait C', 'abonnement', 999999, 12000, 12, 7, 10, '10 séances par semaine - Annuel'),
('Forfait C (Mensuel)', 'abonnement', 999999, 1000, 1, 7, 10, '10 séances par semaine - Mensuel');

-- Function to reset weekly credits for abonnement subscriptions
CREATE OR REPLACE FUNCTION reset_weekly_credits()
RETURNS void AS $$
BEGIN
  UPDATE public.user_subscriptions
  SET 
    weekly_credits_used = 0,
    last_weekly_reset = NOW()
  WHERE 
    status = 'active'
    AND last_weekly_reset < (NOW() - INTERVAL '7 days')
    AND plan_id IN (
      SELECT id FROM public.subscription_plans 
      WHERE type = 'abonnement'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and update expired subscriptions
CREATE OR REPLACE FUNCTION check_expired_subscriptions()
RETURNS void AS $$
BEGIN
  UPDATE public.user_subscriptions
  SET status = 'expired'
  WHERE status = 'active' AND end_date < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;