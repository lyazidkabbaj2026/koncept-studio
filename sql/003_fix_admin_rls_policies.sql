-- Fix the circular dependency in admin RLS policies
-- Drop existing admin policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create a simpler admin policy that doesn't have circular dependency
-- This policy allows admins to view all profiles by checking the role directly
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

-- Alternative approach: Create a more specific policy for admin self-access
-- This ensures admins can always read their own profile
CREATE POLICY "Admin users can view own profile" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id AND 
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );