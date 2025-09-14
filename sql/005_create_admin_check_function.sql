-- Create a function to check if a user is admin that bypasses RLS
CREATE OR REPLACE FUNCTION check_user_admin(user_id UUID)
RETURNS boolean AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = user_id;
  
  RETURN COALESCE(user_role = 'admin', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;