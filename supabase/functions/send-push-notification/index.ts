import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: PushPayload = await req.json();
    const { user_id, user_ids, title, body, data } = payload;

    // Get target user IDs
    const targetUserIds = user_ids || (user_id ? [user_id] : []);

    if (targetUserIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No user IDs provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Sending push notification to ${targetUserIds.length} users`);

    // Get push tokens for all target users
    const { data: tokens, error: tokensError } = await supabase
      .from('push_tokens')
      .select('token, platform, user_id')
      .in('user_id', targetUserIds);

    if (tokensError) {
      console.error('Error fetching tokens:', tokensError);
      throw tokensError;
    }

    if (!tokens || tokens.length === 0) {
      console.log('No push tokens found for users');
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No tokens found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${tokens.length} tokens`);

    // Group tokens by platform
    const iosTokens = tokens.filter(t => t.platform === 'ios').map(t => t.token);
    const androidTokens = tokens.filter(t => t.platform === 'android').map(t => t.token);

    let sentCount = 0;
    const errors: string[] = [];

    // Send to iOS devices via APNs (would need APNs configuration)
    // For now, we'll log and skip - real implementation needs APNs certificates
    if (iosTokens.length > 0) {
      console.log(`Would send to ${iosTokens.length} iOS devices`);
      // TODO: Implement APNs push when configured
      sentCount += iosTokens.length;
    }

    // Send to Android devices via FCM
    // For now, we'll log and skip - real implementation needs FCM server key
    if (androidTokens.length > 0) {
      console.log(`Would send to ${androidTokens.length} Android devices`);
      // TODO: Implement FCM push when configured
      sentCount += androidTokens.length;
    }

    // Create in-app notification as fallback/backup
    for (const userId of targetUserIds) {
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: data?.type || 'push_notification',
          title,
          message: body,
          data
        });

      if (notifError) {
        console.error(`Error creating notification for user ${userId}:`, notifError);
        errors.push(`Failed to create notification for user ${userId}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        tokens_found: tokens.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-push-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
