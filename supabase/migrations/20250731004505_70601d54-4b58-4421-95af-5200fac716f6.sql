-- Create friend_requests table
CREATE TABLE public.friend_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(sender_id, receiver_id)
);

-- Create friendships table
CREATE TABLE public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id < user2_id) -- Ensure consistent ordering to prevent duplicates
);

-- Enable RLS on friend_requests
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for friend_requests
CREATE POLICY "Users can view their own friend requests" 
ON public.friend_requests 
FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create friend requests" 
ON public.friend_requests 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id AND sender_id != receiver_id);

CREATE POLICY "Users can update their received friend requests" 
ON public.friend_requests 
FOR UPDATE 
USING (auth.uid() = receiver_id);

CREATE POLICY "Users can delete their own friend requests" 
ON public.friend_requests 
FOR DELETE 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Enable RLS on friendships
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- RLS policies for friendships
CREATE POLICY "Users can view their friendships" 
ON public.friendships 
FOR SELECT 
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create friendships through accepted requests" 
ON public.friendships 
FOR INSERT 
WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can delete their friendships" 
ON public.friendships 
FOR DELETE 
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Function to handle friend request acceptance
CREATE OR REPLACE FUNCTION public.accept_friend_request(request_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Function to reject friend request
CREATE OR REPLACE FUNCTION public.reject_friend_request(request_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Function to remove friendship
CREATE OR REPLACE FUNCTION public.remove_friendship(friend_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create indexes for better performance
CREATE INDEX idx_friend_requests_receiver_status ON public.friend_requests(receiver_id, status);
CREATE INDEX idx_friend_requests_sender ON public.friend_requests(sender_id);
CREATE INDEX idx_friendships_user1 ON public.friendships(user1_id);
CREATE INDEX idx_friendships_user2 ON public.friendships(user2_id);

-- Create trigger for updated_at on friend_requests
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_friend_requests_updated_at
BEFORE UPDATE ON public.friend_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();