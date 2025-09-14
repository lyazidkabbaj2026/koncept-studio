-- Drop existing policies for classes
DROP POLICY IF EXISTS "Admins can manage classes" ON public.classes;
DROP POLICY IF EXISTS "Users can view classes" ON public.classes;

-- Create new policies that avoid recursion by using the admin check function
CREATE POLICY "Admins can manage classes" ON public.classes
  FOR ALL USING (
    check_user_admin(auth.uid())
  );

-- Regular users can only view classes
CREATE POLICY "Users can view classes" ON public.classes
  FOR SELECT USING (true);