import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);

    console.log(`Checking for events between now and ${in24Hours.toISOString()}`);

    // Get matches happening in the next 24 hours that haven't been notified
    const { data: upcomingMatches, error: matchError } = await supabase
      .from('matches')
      .select(`
        id,
        name,
        match_date,
        creator_id,
        opponent_id,
        status,
        golf_courses!inner(name)
      `)
      .in('status', ['pending', 'accepted'])
      .gte('match_date', now.toISOString().split('T')[0])
      .lte('match_date', in24Hours.toISOString().split('T')[0]);

    if (matchError) {
      console.error('Error fetching matches:', matchError);
      throw matchError;
    }

    console.log(`Found ${upcomingMatches?.length || 0} upcoming matches`);

    // Get tournaments starting in the next 24 hours
    const { data: upcomingTournaments, error: tournamentError } = await supabase
      .from('tournaments')
      .select(`
        id,
        name,
        start_date,
        creator_id,
        status,
        golf_courses!inner(name),
        tournament_participants(user_id)
      `)
      .eq('status', 'upcoming')
      .gte('start_date', now.toISOString().split('T')[0])
      .lte('start_date', in24Hours.toISOString().split('T')[0]);

    if (tournamentError) {
      console.error('Error fetching tournaments:', tournamentError);
      throw tournamentError;
    }

    console.log(`Found ${upcomingTournaments?.length || 0} upcoming tournaments`);

    let notificationsSent = 0;

    // Send match reminders
    for (const match of upcomingMatches || []) {
      const userIds = [match.creator_id, match.opponent_id].filter(Boolean);
      const courseName = (match as any).golf_courses?.name || 'el campo';

      // Check if we already sent a reminder for this match today
      const { data: existingNotif } = await supabase
        .from('notifications')
        .select('id')
        .eq('type', 'match_reminder')
        .contains('data', { match_id: match.id })
        .gte('created_at', now.toISOString().split('T')[0]);

      if (existingNotif && existingNotif.length > 0) {
        console.log(`Already sent reminder for match ${match.id}`);
        continue;
      }

      for (const userId of userIds) {
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            type: 'match_reminder',
            title: '⛳ Partido próximo',
            message: `Tu partido "${match.name}" en ${courseName} es mañana. ¡Prepárate!`,
            data: {
              match_id: match.id,
              match_name: match.name,
              match_date: match.match_date,
              type: 'match_reminder'
            }
          });

        if (!notifError) {
          notificationsSent++;
        } else {
          console.error(`Error creating match notification:`, notifError);
        }
      }
    }

    // Send tournament reminders
    for (const tournament of upcomingTournaments || []) {
      const participants = (tournament as any).tournament_participants || [];
      const userIds = [
        tournament.creator_id,
        ...participants.map((p: any) => p.user_id)
      ].filter((id, index, self) => id && self.indexOf(id) === index);

      const courseName = (tournament as any).golf_courses?.name || 'el campo';

      // Check if we already sent a reminder for this tournament today
      const { data: existingNotif } = await supabase
        .from('notifications')
        .select('id')
        .eq('type', 'tournament_reminder')
        .contains('data', { tournament_id: tournament.id })
        .gte('created_at', now.toISOString().split('T')[0]);

      if (existingNotif && existingNotif.length > 0) {
        console.log(`Already sent reminder for tournament ${tournament.id}`);
        continue;
      }

      for (const userId of userIds) {
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            type: 'tournament_reminder',
            title: '🏆 Torneo próximo',
            message: `El torneo "${tournament.name}" en ${courseName} comienza mañana. ¡Buena suerte!`,
            data: {
              tournament_id: tournament.id,
              tournament_name: tournament.name,
              start_date: tournament.start_date,
              type: 'tournament_reminder'
            }
          });

        if (!notifError) {
          notificationsSent++;
        } else {
          console.error(`Error creating tournament notification:`, notifError);
        }
      }
    }

    console.log(`Sent ${notificationsSent} reminder notifications`);

    return new Response(
      JSON.stringify({
        success: true,
        matches_checked: upcomingMatches?.length || 0,
        tournaments_checked: upcomingTournaments?.length || 0,
        notifications_sent: notificationsSent
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in check-event-reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
