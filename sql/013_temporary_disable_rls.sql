-- Temporary solution: Disable RLS to get the system working
-- WARNING: This removes security restrictions. Use only for development.
-- Re-enable RLS with proper policies later for production.

-- Disable RLS on all tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_requests DISABLE ROW LEVEL SECURITY;

-- Make sure your user is set as admin
-- Replace 'your-email@example.com' with your actual email
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- You can also check all users with:
-- SELECT id, email, role FROM public.profiles;