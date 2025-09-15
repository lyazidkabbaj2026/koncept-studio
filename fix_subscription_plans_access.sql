-- Fix subscription plans access for signup form
-- Issue: Only admins can access subscription plans, but unauthenticated users need to see them during signup

-- Drop the existing admin-only policy
DROP POLICY IF EXISTS "Admins can manage subscription plans" ON public.subscription_plans;

-- Create separate policies for read and write access
-- 1. Allow everyone (including unauthenticated users) to read subscription plans
CREATE POLICY "Anyone can view subscription plans" ON public.subscription_plans
  FOR SELECT USING (true);

-- 2. Only admins can modify subscription plans
CREATE POLICY "Admins can manage subscription plans" ON public.subscription_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Ensure RLS is enabled
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;