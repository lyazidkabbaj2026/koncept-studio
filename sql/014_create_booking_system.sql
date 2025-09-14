-- Create booking system tables

-- Class bookings table
CREATE TABLE public.class_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  schedule_id UUID REFERENCES public.class_schedules(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'no_show')),
  booked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure no duplicate bookings
  UNIQUE(user_id, schedule_id)
);

-- Class waitlist table
CREATE TABLE public.class_waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  schedule_id UUID REFERENCES public.class_schedules(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE CASCADE NOT NULL,
  position INTEGER NOT NULL, -- Position in waitlist
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notified_at TIMESTAMP WITH TIME ZONE, -- When user was notified of availability
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure no duplicate waitlist entries
  UNIQUE(user_id, schedule_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_class_bookings_user_id ON public.class_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_class_bookings_schedule_id ON public.class_bookings(schedule_id);
CREATE INDEX IF NOT EXISTS idx_class_bookings_subscription_id ON public.class_bookings(subscription_id);
CREATE INDEX IF NOT EXISTS idx_class_bookings_status ON public.class_bookings(status);
CREATE INDEX IF NOT EXISTS idx_class_bookings_booked_at ON public.class_bookings(booked_at);

CREATE INDEX IF NOT EXISTS idx_class_waitlist_user_id ON public.class_waitlist(user_id);
CREATE INDEX IF NOT EXISTS idx_class_waitlist_schedule_id ON public.class_waitlist(schedule_id);
CREATE INDEX IF NOT EXISTS idx_class_waitlist_position ON public.class_waitlist(position);
CREATE INDEX IF NOT EXISTS idx_class_waitlist_joined_at ON public.class_waitlist(joined_at);

-- Create updated_at triggers
CREATE TRIGGER update_class_bookings_updated_at
  BEFORE UPDATE ON public.class_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_class_waitlist_updated_at
  BEFORE UPDATE ON public.class_waitlist
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.class_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_waitlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies for class_bookings
-- Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON public.class_bookings
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own bookings
CREATE POLICY "Users can create own bookings" ON public.class_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings (mainly for cancellation)
CREATE POLICY "Users can update own bookings" ON public.class_bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can manage all bookings
CREATE POLICY "Admins can manage all bookings" ON public.class_bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for class_waitlist
-- Users can view their own waitlist entries
CREATE POLICY "Users can view own waitlist entries" ON public.class_waitlist
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own waitlist entries
CREATE POLICY "Users can create own waitlist entries" ON public.class_waitlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own waitlist entries
CREATE POLICY "Users can delete own waitlist entries" ON public.class_waitlist
  FOR DELETE USING (auth.uid() = user_id);

-- Admins can manage all waitlist entries
CREATE POLICY "Admins can manage all waitlist entries" ON public.class_waitlist
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to automatically update current_bookings count
CREATE OR REPLACE FUNCTION update_booking_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increase booking count
    UPDATE public.class_schedules 
    SET current_bookings = current_bookings + 1 
    WHERE id = NEW.schedule_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle status changes
    IF OLD.status = 'confirmed' AND NEW.status != 'confirmed' THEN
      -- Booking was cancelled/no-show, decrease count
      UPDATE public.class_schedules 
      SET current_bookings = current_bookings - 1 
      WHERE id = NEW.schedule_id;
    ELSIF OLD.status != 'confirmed' AND NEW.status = 'confirmed' THEN
      -- Booking was restored, increase count
      UPDATE public.class_schedules 
      SET current_bookings = current_bookings + 1 
      WHERE id = NEW.schedule_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrease booking count only if booking was confirmed
    IF OLD.status = 'confirmed' THEN
      UPDATE public.class_schedules 
      SET current_bookings = current_bookings - 1 
      WHERE id = OLD.schedule_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update booking counts
CREATE TRIGGER update_booking_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.class_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_count();

-- Function to set waitlist position on insert
CREATE OR REPLACE FUNCTION set_waitlist_position()
RETURNS TRIGGER AS $$
BEGIN
  -- Set position as the last in line
  NEW.position = COALESCE(
    (SELECT MAX(position) FROM public.class_waitlist 
     WHERE schedule_id = NEW.schedule_id) + 1, 
    1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to adjust waitlist positions after deletion
CREATE OR REPLACE FUNCTION adjust_waitlist_positions()
RETURNS TRIGGER AS $$
BEGIN
  -- Adjust positions of everyone behind the deleted entry
  UPDATE public.class_waitlist 
  SET position = position - 1 
  WHERE schedule_id = OLD.schedule_id 
  AND position > OLD.position;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to manage waitlist positions
CREATE TRIGGER set_waitlist_position_trigger
  BEFORE INSERT ON public.class_waitlist
  FOR EACH ROW
  EXECUTE FUNCTION set_waitlist_position();

CREATE TRIGGER adjust_waitlist_positions_trigger
  AFTER DELETE ON public.class_waitlist
  FOR EACH ROW
  EXECUTE FUNCTION adjust_waitlist_positions();

-- Function to get user's valid subscription
CREATE OR REPLACE FUNCTION get_user_valid_subscription(user_uuid UUID)
RETURNS TABLE(
  id UUID,
  plan_id UUID,
  plan_type TEXT,
  credits_remaining INTEGER,
  weekly_credits_used INTEGER,
  weekly_limit INTEGER,
  status TEXT,
  end_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.id,
    us.plan_id,
    sp.type as plan_type,
    us.credits_remaining,
    us.weekly_credits_used,
    sp.weekly_limit,
    us.status,
    us.end_date
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_uuid 
    AND us.status = 'active'
    AND us.end_date > NOW()
    AND (
      us.credits_remaining > 0 
      OR (sp.type = 'abonnement' AND us.weekly_credits_used < sp.weekly_limit)
    )
  ORDER BY us.end_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can book a class
CREATE OR REPLACE FUNCTION can_user_book_class(user_uuid UUID, schedule_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  subscription_record RECORD;
  class_info RECORD;
  existing_booking_count INTEGER;
  result JSONB;
BEGIN
  -- Check if user has valid subscription
  SELECT * INTO subscription_record 
  FROM get_user_valid_subscription(user_uuid) 
  LIMIT 1;
  
  IF subscription_record IS NULL THEN
    RETURN jsonb_build_object(
      'can_book', false,
      'reason', 'no_valid_subscription',
      'message', 'Aucun abonnement valide trouvé'
    );
  END IF;
  
  -- Get class information
  SELECT c.max_capacity, cs.current_bookings, cs.start_datetime
  INTO class_info
  FROM public.class_schedules cs
  JOIN public.classes c ON cs.class_id = c.id
  WHERE cs.id = schedule_uuid;
  
  IF class_info IS NULL THEN
    RETURN jsonb_build_object(
      'can_book', false,
      'reason', 'class_not_found',
      'message', 'Cours introuvable'
    );
  END IF;
  
  -- Check if class has already started
  IF class_info.start_datetime <= NOW() THEN
    RETURN jsonb_build_object(
      'can_book', false,
      'reason', 'class_started',
      'message', 'Le cours a déjà commencé'
    );
  END IF;
  
  -- Check if user already booked this class
  SELECT COUNT(*) INTO existing_booking_count
  FROM public.class_bookings
  WHERE user_id = user_uuid 
    AND schedule_id = schedule_uuid 
    AND status = 'confirmed';
    
  IF existing_booking_count > 0 THEN
    RETURN jsonb_build_object(
      'can_book', false,
      'reason', 'already_booked',
      'message', 'Vous avez déjà réservé ce cours'
    );
  END IF;
  
  -- Check if class is full
  IF class_info.current_bookings >= class_info.max_capacity THEN
    RETURN jsonb_build_object(
      'can_book', false,
      'reason', 'class_full',
      'message', 'Le cours est complet',
      'can_waitlist', true
    );
  END IF;
  
  -- Check subscription-specific limits
  IF subscription_record.plan_type = 'abonnement' THEN
    IF subscription_record.weekly_credits_used >= subscription_record.weekly_limit THEN
      RETURN jsonb_build_object(
        'can_book', false,
        'reason', 'weekly_limit_reached',
        'message', 'Limite hebdomadaire de séances atteinte'
      );
    END IF;
  ELSIF subscription_record.credits_remaining <= 0 THEN
    RETURN jsonb_build_object(
      'can_book', false,
      'reason', 'no_credits',
      'message', 'Plus de crédits disponibles'
    );
  END IF;
  
  -- All checks passed
  RETURN jsonb_build_object(
    'can_book', true,
    'subscription_id', subscription_record.id,
    'message', 'Réservation possible'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to book a class
CREATE OR REPLACE FUNCTION book_class(user_uuid UUID, schedule_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  booking_check JSONB;
  subscription_record RECORD;
  new_booking_id UUID;
BEGIN
  -- Check if user can book the class
  SELECT can_user_book_class(user_uuid, schedule_uuid) INTO booking_check;
  
  IF (booking_check->>'can_book')::boolean = false THEN
    RETURN booking_check;
  END IF;
  
  -- Get subscription info
  SELECT * INTO subscription_record 
  FROM get_user_valid_subscription(user_uuid) 
  LIMIT 1;
  
  -- Create the booking
  INSERT INTO public.class_bookings (user_id, schedule_id, subscription_id, status)
  VALUES (user_uuid, schedule_uuid, subscription_record.id, 'confirmed')
  RETURNING id INTO new_booking_id;
  
  -- Deduct credit based on subscription type
  IF subscription_record.plan_type = 'abonnement' THEN
    -- For abonnement, increment weekly usage
    UPDATE public.user_subscriptions 
    SET weekly_credits_used = weekly_credits_used + 1
    WHERE id = subscription_record.id;
  ELSE
    -- For carnet/personal_training, deduct from remaining credits
    UPDATE public.user_subscriptions 
    SET credits_remaining = credits_remaining - 1,
        credits_used = credits_used + 1
    WHERE id = subscription_record.id;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'booking_id', new_booking_id,
    'message', 'Réservation confirmée'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to join waitlist
CREATE OR REPLACE FUNCTION join_waitlist(user_uuid UUID, schedule_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  subscription_record RECORD;
  class_info RECORD;
  existing_waitlist_count INTEGER;
  new_waitlist_id UUID;
BEGIN
  -- Check if user has valid subscription
  SELECT * INTO subscription_record 
  FROM get_user_valid_subscription(user_uuid) 
  LIMIT 1;
  
  IF subscription_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'no_valid_subscription',
      'message', 'Aucun abonnement valide trouvé'
    );
  END IF;
  
  -- Check if user is already on waitlist
  SELECT COUNT(*) INTO existing_waitlist_count
  FROM public.class_waitlist
  WHERE user_id = user_uuid AND schedule_id = schedule_uuid;
  
  IF existing_waitlist_count > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'already_on_waitlist',
      'message', 'Vous êtes déjà sur la liste d''attente'
    );
  END IF;
  
  -- Get class information
  SELECT c.max_capacity, cs.current_bookings, cs.start_datetime
  INTO class_info
  FROM public.class_schedules cs
  JOIN public.classes c ON cs.class_id = c.id
  WHERE cs.id = schedule_uuid;
  
  -- Verify class is actually full
  IF class_info.current_bookings < class_info.max_capacity THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'class_not_full',
      'message', 'Le cours n''est pas complet, vous pouvez le réserver directement'
    );
  END IF;
  
  -- Add to waitlist
  INSERT INTO public.class_waitlist (user_id, schedule_id, subscription_id)
  VALUES (user_uuid, schedule_uuid, subscription_record.id)
  RETURNING id INTO new_waitlist_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'waitlist_id', new_waitlist_id,
    'message', 'Ajouté à la liste d''attente'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically promote from waitlist when booking is cancelled
CREATE OR REPLACE FUNCTION promote_from_waitlist()
RETURNS TRIGGER AS $$
DECLARE
  waitlist_entry RECORD;
  subscription_record RECORD;
BEGIN
  -- Only process when a booking is actually cancelled/removed
  IF TG_OP = 'UPDATE' AND OLD.status = 'confirmed' AND NEW.status != 'confirmed' THEN
    -- Find the first person on the waitlist
    SELECT * INTO waitlist_entry
    FROM public.class_waitlist
    WHERE schedule_id = NEW.schedule_id
    ORDER BY position ASC
    LIMIT 1;
    
    IF waitlist_entry IS NOT NULL THEN
      -- Get their subscription info
      SELECT * INTO subscription_record 
      FROM get_user_valid_subscription(waitlist_entry.user_id) 
      WHERE id = waitlist_entry.subscription_id
      LIMIT 1;
      
      IF subscription_record IS NOT NULL THEN
        -- Create booking for waitlisted user
        INSERT INTO public.class_bookings (user_id, schedule_id, subscription_id, status)
        VALUES (waitlist_entry.user_id, waitlist_entry.schedule_id, waitlist_entry.subscription_id, 'confirmed');
        
        -- Deduct credit
        IF subscription_record.plan_type = 'abonnement' THEN
          UPDATE public.user_subscriptions 
          SET weekly_credits_used = weekly_credits_used + 1
          WHERE id = subscription_record.id;
        ELSE
          UPDATE public.user_subscriptions 
          SET credits_remaining = credits_remaining - 1,
              credits_used = credits_used + 1
          WHERE id = subscription_record.id;
        END IF;
        
        -- Remove from waitlist
        DELETE FROM public.class_waitlist WHERE id = waitlist_entry.id;
        
        -- Update notification timestamp
        UPDATE public.class_waitlist 
        SET notified_at = NOW() 
        WHERE id = waitlist_entry.id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'confirmed' THEN
    -- Similar logic for deleted bookings
    SELECT * INTO waitlist_entry
    FROM public.class_waitlist
    WHERE schedule_id = OLD.schedule_id
    ORDER BY position ASC
    LIMIT 1;
    
    IF waitlist_entry IS NOT NULL THEN
      SELECT * INTO subscription_record 
      FROM get_user_valid_subscription(waitlist_entry.user_id) 
      WHERE id = waitlist_entry.subscription_id
      LIMIT 1;
      
      IF subscription_record IS NOT NULL THEN
        INSERT INTO public.class_bookings (user_id, schedule_id, subscription_id, status)
        VALUES (waitlist_entry.user_id, waitlist_entry.schedule_id, waitlist_entry.subscription_id, 'confirmed');
        
        IF subscription_record.plan_type = 'abonnement' THEN
          UPDATE public.user_subscriptions 
          SET weekly_credits_used = weekly_credits_used + 1
          WHERE id = subscription_record.id;
        ELSE
          UPDATE public.user_subscriptions 
          SET credits_remaining = credits_remaining - 1,
              credits_used = credits_used + 1
          WHERE id = subscription_record.id;
        END IF;
        
        DELETE FROM public.class_waitlist WHERE id = waitlist_entry.id;
      END IF;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to promote from waitlist
CREATE TRIGGER promote_from_waitlist_trigger
  AFTER UPDATE OR DELETE ON public.class_bookings
  FOR EACH ROW
  EXECUTE FUNCTION promote_from_waitlist();

-- Grant necessary permissions
GRANT ALL ON public.class_bookings TO authenticated;
GRANT ALL ON public.class_waitlist TO authenticated;
GRANT SELECT ON public.class_bookings TO anon;
GRANT SELECT ON public.class_waitlist TO anon;