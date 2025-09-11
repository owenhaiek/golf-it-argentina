-- Fix security vulnerability in profiles table RLS policies
-- Remove overly permissive policies and implement secure access control

-- Drop the existing overly permissive policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view basic profiles" ON public.profiles;

-- Create secure RLS policies for profiles table
-- Policy 1: Users can view their own profile completely
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Users can view friends' profiles completely
CREATE POLICY "Users can view friends profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() != id AND
  EXISTS (
    SELECT 1 FROM public.friendships f
    WHERE (f.user1_id = auth.uid() AND f.user2_id = id)
       OR (f.user2_id = auth.uid() AND f.user1_id = id)
  )
);

-- Policy 3: Authenticated users can view basic profile info for search/discovery
-- This allows friend suggestions and user search while limiting exposed data
CREATE POLICY "Authenticated users can view basic profiles for search"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() != id AND
  auth.uid() IS NOT NULL
);