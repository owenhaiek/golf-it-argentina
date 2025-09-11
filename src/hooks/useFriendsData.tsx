import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  sender?: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string;
  };
  receiver?: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string;
  };
}

interface Friend {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  friendship_created_at: string;
}

export const useFriendsData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch friend requests received
  const { data: receivedRequests, isLoading: receivedRequestsLoading } = useQuery({
    queryKey: ['friendRequests', 'received', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          id,
          sender_id,
          receiver_id,
          status,
          created_at
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch sender profiles separately
      if (!data || data.length === 0) return [];
      
      const senderIds = data.map(req => req.sender_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .in('id', senderIds);

      if (profilesError) throw profilesError;

      return data.map(req => ({
        ...req,
        sender: profiles?.find(p => p.id === req.sender_id)
      })) as FriendRequest[];
    },
    enabled: !!user?.id,
  });

  // Fetch friend requests sent
  const { data: sentRequests, isLoading: sentRequestsLoading } = useQuery({
    queryKey: ['friendRequests', 'sent', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          id,
          sender_id,
          receiver_id,
          status,
          created_at
        `)
        .eq('sender_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch receiver profiles separately
      if (!data || data.length === 0) return [];
      
      const receiverIds = data.map(req => req.receiver_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .in('id', receiverIds);

      if (profilesError) throw profilesError;

      return data.map(req => ({
        ...req,
        receiver: profiles?.find(p => p.id === req.receiver_id)
      })) as FriendRequest[];
    },
    enabled: !!user?.id,
  });

  // Fetch friends list
  const { data: friends, isLoading: friendsLoading } = useQuery({
    queryKey: ['friends', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          created_at,
          user1_id,
          user2_id
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) return [];

      // Get all friend user IDs
      const friendIds = data.map(friendship => 
        friendship.user1_id === user.id ? friendship.user2_id : friendship.user1_id
      );

      // Fetch friend profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .in('id', friendIds);

      if (profilesError) throw profilesError;

      // Transform the data to return the friend (not the current user)
      const friendsList: Friend[] = data.map(friendship => {
        const friendId = friendship.user1_id === user.id ? friendship.user2_id : friendship.user1_id;
        const friend = profiles?.find(p => p.id === friendId);
        return {
          ...friend,
          friendship_created_at: friendship.created_at
        };
      }).filter(friend => friend.id) as Friend[];

      return friendsList;
    },
    enabled: !!user?.id,
  });

  // Send friend request mutation
  const sendFriendRequestMutation = useMutation({
    mutationFn: async (receiverId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Friend request sent!');
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send friend request');
    },
  });

  // Accept friend request mutation
  const acceptFriendRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { data, error } = await supabase.rpc('accept_friend_request', {
        request_id: requestId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Friend request accepted!');
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to accept friend request');
    },
  });

  // Reject friend request mutation
  const rejectFriendRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { data, error } = await supabase.rpc('reject_friend_request', {
        request_id: requestId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Friend request rejected');
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reject friend request');
    },
  });

  // Remove friend mutation
  const removeFriendMutation = useMutation({
    mutationFn: async (friendId: string) => {
      const { data, error } = await supabase.rpc('remove_friendship', {
        friend_user_id: friendId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Friend removed');
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove friend');
    },
  });

  // Check friendship status
  const checkFriendshipStatus = async (userId: string): Promise<'none' | 'sent' | 'received' | 'friends'> => {
    try {
      console.log('Checking friendship status for user:', userId);
      
      if (!user?.id) {
        console.log('No authenticated user found');
        return 'none';
      }

      // Check if there's a pending request between current user and target user
      const { data: pendingRequest, error: requestError } = await supabase
        .from('friend_requests')
        .select('id, sender_id, receiver_id, status')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
        .eq('status', 'pending')
        .maybeSingle();

      if (requestError) {
        console.error('Error checking friend requests:', requestError);
        throw requestError;
      }

      if (pendingRequest) {
        const status = pendingRequest.sender_id === user.id ? 'sent' : 'received';
        console.log('Found pending request, status:', status);
        return status;
      }

      // Check if they're already friends
      const { data: friendship, error: friendshipError } = await supabase
        .from('friendships')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${userId}),and(user1_id.eq.${userId},user2_id.eq.${user.id})`)
        .maybeSingle();

      if (friendshipError) {
        console.error('Error checking friendships:', friendshipError);
        throw friendshipError;
      }

      const status = friendship ? 'friends' : 'none';
      console.log('Final friendship status:', status);
      return status;
    } catch (error) {
      console.error('Error in checkFriendshipStatus:', error);
      // Return 'none' as fallback to prevent infinite loading
      return 'none';
    }
  };

  return {
    // Data
    receivedRequests: receivedRequests || [],
    sentRequests: sentRequests || [],
    friends: friends || [],
    
    // Loading states
    receivedRequestsLoading,
    sentRequestsLoading,
    friendsLoading,
    
    // Mutations
    sendFriendRequest: sendFriendRequestMutation.mutate,
    acceptFriendRequest: acceptFriendRequestMutation.mutate,
    rejectFriendRequest: rejectFriendRequestMutation.mutate,
    removeFriend: removeFriendMutation.mutate,
    
    // Mutation states
    sendingFriendRequest: sendFriendRequestMutation.isPending,
    acceptingFriendRequest: acceptFriendRequestMutation.isPending,
    rejectingFriendRequest: rejectFriendRequestMutation.isPending,
    removingFriend: removeFriendMutation.isPending,
    
    // Utilities
    checkFriendshipStatus,
  };
};