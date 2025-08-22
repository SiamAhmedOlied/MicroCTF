-- Drop existing RLS policies that depend on Supabase auth
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Drop existing RLS policies on submissions that depend on profiles
DROP POLICY IF EXISTS "Users can create submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.submissions;

-- Create new RLS policies that work without JWT validation
CREATE POLICY "Allow all profile operations"
ON public.profiles
FOR ALL
USING (true)
WITH CHECK (true);

-- Create new submission policies that work with Clerk
CREATE POLICY "Allow submission operations" 
ON public.submissions
FOR ALL
USING (true)
WITH CHECK (true);

-- Add a unique constraint on user_id for profiles to prevent duplicates
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);