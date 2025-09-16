-- Create function to automatically create notifications for match challenges
CREATE OR REPLACE FUNCTION public.create_match_challenge_notification()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (
    NEW.opponent_id,
    'match_challenge',
    'New Match Challenge',
    'You have been challenged to a match!',
    jsonb_build_object('match_id', NEW.id, 'creator_id', NEW.creator_id)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for match challenges
CREATE TRIGGER create_match_challenge_notification_trigger
  AFTER INSERT ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.create_match_challenge_notification();