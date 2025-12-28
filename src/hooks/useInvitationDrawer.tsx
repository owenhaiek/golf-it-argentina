import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const useInvitationDrawer = () => {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPendingInvitations = async () => {
    if (!user?.id) {
      setPendingCount(0);
      setIsLoading(false);
      return;
    }

    try {
      const { count, error } = await supabase
        .from('match_participants')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      setPendingCount(count || 0);
    } catch (error) {
      console.error('Error fetching pending invitations:', error);
      setPendingCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingInvitations();

    if (!user?.id) return;

    // Listen for changes in match_participants
    const channel = supabase
      .channel('invitation-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_participants',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchPendingInvitations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    pendingCount,
    hasPendingInvitations: pendingCount > 0,
    isLoading,
    refetch: fetchPendingInvitations
  };
};