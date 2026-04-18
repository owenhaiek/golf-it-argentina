import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'https://esm.sh/web-push@3.6.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushPayload {
  user_id?: string;
  user_ids?: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;
    const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;
    const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@golfitargentina.com';

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      throw new Error('VAPID keys not configured');
    }

    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const payload: PushPayload = await req.json();
    const { user_id, user_ids, title, body, data } = payload;

    const targets = user_ids || (user_id ? [user_id] : []);
    if (targets.length === 0) {
      return new Response(JSON.stringify({ error: 'No user IDs' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: subs, error } = await supabase
      .from('web_push_subscriptions')
      .select('id, endpoint, p256dh, auth, user_id')
      .in('user_id', targets);

    if (error) throw error;
    if (!subs || subs.length === 0) {
      console.log('No web push subscriptions for users', targets);
      return new Response(JSON.stringify({ success: true, sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const notifPayload = JSON.stringify({ title, body, data: data || {} });
    let sent = 0;
    const expired: string[] = [];

    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            notifPayload
          );
          sent++;
        } catch (err: any) {
          console.error('Push send error:', err?.statusCode, err?.body);
          if (err?.statusCode === 410 || err?.statusCode === 404) {
            expired.push(s.id);
          }
        }
      })
    );

    if (expired.length > 0) {
      await supabase.from('web_push_subscriptions').delete().in('id', expired);
    }

    return new Response(
      JSON.stringify({ success: true, sent, total: subs.length, expired: expired.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('send-web-push error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
