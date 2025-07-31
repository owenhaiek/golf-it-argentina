-- Fix security definer functions to have proper search path
CREATE OR REPLACE FUNCTION public.accept_friend_request(request_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_record RECORD;
  user1 UUID;
  user2 UUID;
BEGIN
  -- Get the friend request
  SELECT * INTO request_record
  FROM public.friend_requests
  WHERE id = request_id 
    AND receiver_id = auth.uid() 
    AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Determine user ordering for friendship table
  IF request_record.sender_id < request_record.receiver_id THEN
    user1 := request_record.sender_id;
    user2 := request_record.receiver_id;
  ELSE
    user1 := request_record.receiver_id;
    user2 := request_record.sender_id;
  END IF;
  
  -- Create friendship
  INSERT INTO public.friendships (user1_id, user2_id)
  VALUES (user1, user2)
  ON CONFLICT (user1_id, user2_id) DO NOTHING;
  
  -- Update request status
  UPDATE public.friend_requests
  SET status = 'accepted', updated_at = now()
  WHERE id = request_id;
  
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_friend_request(request_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.friend_requests
  SET status = 'rejected', updated_at = now()
  WHERE id = request_id 
    AND receiver_id = auth.uid() 
    AND status = 'pending';
  
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_friendship(friend_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user1 UUID;
  user2 UUID;
BEGIN
  -- Determine user ordering
  IF auth.uid() < friend_user_id THEN
    user1 := auth.uid();
    user2 := friend_user_id;
  ELSE
    user1 := friend_user_id;
    user2 := auth.uid();
  END IF;
  
  -- Remove friendship
  DELETE FROM public.friendships
  WHERE user1_id = user1 AND user2_id = user2;
  
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;