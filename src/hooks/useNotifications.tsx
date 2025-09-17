import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender_profile?: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

export const useNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // First get all notifications
      const { data: notificationsData, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!notificationsData || notificationsData.length === 0) return [];

      // Extract sender IDs from notification data (if provided)
      const senderIds = Array.from(new Set(
        notificationsData
          .map(n => (n.data as any)?.sender_id)
          .filter(Boolean)
      ));

      // Extract match IDs to resolve sender profiles when sender_id is missing
      const matchIds = Array.from(new Set(
        notificationsData
          .map(n => (n.data as any)?.match_id)
          .filter(Boolean)
      ));

      // Fetch sender profiles
      let senderProfiles: any[] = [];
      if (senderIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url')
          .in('id', senderIds);
        senderProfiles = profilesData || [];
      }

      // Fetch related matches with joined profiles (for fallback sender resolution)
      let matchesMap: Record<string, any> = {};
      if (matchIds.length > 0) {
        const { data: matchesData } = await supabase
          .from('matches')
          .select(`
            id,
            creator_id,
            opponent_id,
            creator:profiles!matches_creator_id_fkey ( id, full_name, username, avatar_url ),
            opponent:profiles!matches_opponent_id_fkey ( id, full_name, username, avatar_url )
          `)
          .in('id', matchIds);
        (matchesData || []).forEach((m: any) => { matchesMap[m.id] = m; });
      }

      // Merge notifications with resolved sender profiles
      const enrichedNotifications = notificationsData.map(notification => {
        const data = notification.data as any;
        const senderId = data?.sender_id;
        let sender_profile = senderProfiles.find(p => p.id === senderId) || null;

        if (!sender_profile && data?.match_id && matchesMap[data.match_id]) {
          const m = matchesMap[data.match_id];
          if (notification.type === 'match_challenge') {
            sender_profile = m.creator || null; // challenge sent by creator
          } else if (notification.type === 'match_accepted' || notification.type === 'match_declined') {
            sender_profile = m.opponent || null; // response sent by opponent
          }
        }

        return { ...notification, sender_profile };
      });

      return enrichedNotifications as Notification[];
    },
    enabled: !!user?.id,
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    },
  });

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
};