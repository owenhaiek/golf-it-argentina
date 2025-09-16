-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.create_friend_request_notification()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (
    NEW.receiver_id,
    'friend_request',
    'New Friend Request',
    'You have a new friend request',
    jsonb_build_object('friend_request_id', NEW.id, 'sender_id', NEW.sender_id)
  );
  RETURN NEW;
END;
$$;