-- 1. Enable pg_net for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- 2. Create web push subscriptions table (separate from push_tokens which is for native)
CREATE TABLE IF NOT EXISTS public.web_push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, endpoint)
);

ALTER TABLE public.web_push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own web push subscriptions"
ON public.web_push_subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own web push subscriptions"
ON public.web_push_subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own web push subscriptions"
ON public.web_push_subscriptions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users delete own web push subscriptions"
ON public.web_push_subscriptions FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_web_push_subscriptions_updated_at
BEFORE UPDATE ON public.web_push_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_web_push_subscriptions_user_id ON public.web_push_subscriptions(user_id);

-- 3. Helper function that invokes the edge function via pg_net
CREATE OR REPLACE FUNCTION public.send_web_push(
  target_user_id UUID,
  notif_title TEXT,
  notif_body TEXT,
  notif_data JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  function_url TEXT := 'https://zlmotrppstqjnovpfgbd.supabase.co/functions/v1/send-web-push';
  service_key TEXT := current_setting('app.settings.service_role_key', true);
BEGIN
  PERFORM net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE(service_key, '')
    ),
    body := jsonb_build_object(
      'user_id', target_user_id,
      'title', notif_title,
      'body', notif_body,
      'data', notif_data
    )
  );
EXCEPTION WHEN OTHERS THEN
  -- Don't block the original insert if push fails
  RAISE WARNING 'send_web_push failed: %', SQLERRM;
END;
$$;

-- 4. Trigger: friend request -> push to receiver
CREATE OR REPLACE FUNCTION public.notify_friend_request_push()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_name TEXT;
BEGIN
  SELECT COALESCE(full_name, username, 'Alguien')
  INTO sender_name
  FROM public.profiles WHERE id = NEW.sender_id;

  PERFORM public.send_web_push(
    NEW.receiver_id,
    'Nueva solicitud de amistad',
    sender_name || ' te envió una solicitud de amistad',
    jsonb_build_object('type', 'friend_request', 'sender_id', NEW.sender_id, 'url', '/notifications')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_friend_request_push ON public.friend_requests;
CREATE TRIGGER trg_friend_request_push
AFTER INSERT ON public.friend_requests
FOR EACH ROW EXECUTE FUNCTION public.notify_friend_request_push();

-- 5. Trigger: match created -> push to opponent
CREATE OR REPLACE FUNCTION public.notify_match_challenge_push()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  creator_name TEXT;
  course_name TEXT;
BEGIN
  SELECT COALESCE(full_name, username, 'Alguien')
  INTO creator_name
  FROM public.profiles WHERE id = NEW.creator_id;

  SELECT name INTO course_name
  FROM public.golf_courses WHERE id = NEW.course_id;

  PERFORM public.send_web_push(
    NEW.opponent_id,
    '⛳ Nuevo desafío',
    creator_name || ' te desafió en ' || COALESCE(course_name, 'un partido'),
    jsonb_build_object('type', 'match_challenge', 'match_id', NEW.id, 'url', '/profile')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_match_challenge_push ON public.matches;
CREATE TRIGGER trg_match_challenge_push
AFTER INSERT ON public.matches
FOR EACH ROW EXECUTE FUNCTION public.notify_match_challenge_push();

-- 6. Trigger: tournament participant added -> push to invited user (if not creator)
CREATE OR REPLACE FUNCTION public.notify_tournament_invite_push()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  creator_id UUID;
  creator_name TEXT;
  tournament_name TEXT;
BEGIN
  SELECT t.creator_id, t.name INTO creator_id, tournament_name
  FROM public.tournaments t WHERE t.id = NEW.tournament_id;

  -- Skip if the participant is the creator themselves
  IF NEW.user_id = creator_id THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(full_name, username, 'Alguien')
  INTO creator_name
  FROM public.profiles WHERE id = creator_id;

  PERFORM public.send_web_push(
    NEW.user_id,
    '🏆 Invitación a torneo',
    creator_name || ' te invitó a "' || COALESCE(tournament_name, 'un torneo') || '"',
    jsonb_build_object('type', 'tournament_invite', 'tournament_id', NEW.tournament_id, 'url', '/profile')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tournament_invite_push ON public.tournament_participants;
CREATE TRIGGER trg_tournament_invite_push
AFTER INSERT ON public.tournament_participants
FOR EACH ROW EXECUTE FUNCTION public.notify_tournament_invite_push();