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
  anon_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsbW90cnBwc3Rxam5vdnBmZ2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MTcwOTYsImV4cCI6MjA1NjE5MzA5Nn0.1TwfkCE7nChIbPQIXZEjjLFoHFbProrDJ8UXrnvdMac';
BEGIN
  PERFORM net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || anon_key,
      'apikey', anon_key
    ),
    body := jsonb_build_object(
      'user_id', target_user_id,
      'title', notif_title,
      'body', notif_body,
      'data', notif_data
    )
  );
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'send_web_push failed: %', SQLERRM;
END;
$$;