-- Complete RLS fix - remove all problematic policies and recreate properly

-- First, let's disable RLS temporarily to clean up
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_requests DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;

-- Drop ALL existing policies on subscription tables
DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Admins can manage subscription plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can view own subscription requests" ON public.subscription_requests;
DROP POLICY IF EXISTS "Users can create subscription requests" ON public.subscription_requests;
DROP POLICY IF EXISTS "Admins can manage subscription requests" ON public.subscription_requests;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_requests ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- For admin access, we'll use a simpler approach
-- Create a temporary admin bypass (you can restrict this later)
CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
      OR email = 'your-admin-email@example.com' -- Replace with your actual admin email
    )
  );

-- Simple policies for subscription_plans (readable by everyone, manageable by service role)
CREATE POLICY "subscription_plans_read_all" ON public.subscription_plans
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "subscription_plans_admin_all" ON public.subscription_plans
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
      OR email = 'your-admin-email@example.com' -- Replace with your actual admin email
    )
  );

-- Simple policies for user_subscriptions
CREATE POLICY "user_subscriptions_own" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_subscriptions_admin_all" ON public.user_subscriptions
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
      OR email = 'your-admin-email@example.com' -- Replace with your actual admin email
    )
  );

-- Simple policies for subscription_requests
CREATE POLICY "subscription_requests_own" ON public.subscription_requests
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "subscription_requests_admin_all" ON public.subscription_requests
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
      OR email = 'your-admin-email@example.com' -- Replace with your actual admin email
    )
  );

-- Update your user to be admin (replace with your actual user ID)
-- First check your user ID with: SELECT id, email FROM auth.users;
-- Then run: UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';