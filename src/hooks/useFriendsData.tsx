import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
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
          id: friendId,
          full_name: friend?.full_name ?? '',
          username: friend?.username ?? '',
          avatar_url: friend?.avatar_url ?? '',
          friendship_created_at: friendship.created_at
        };
      });

      return friendsList;
    },
    enabled: !!user?.id,
  });

  // Send friend request mutation with optimistic updates and server checks
  const sendFriendRequestMutation = useMutation({
    mutationFn: async (receiverId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      if (receiverId === user.id) {
        throw new Error('You cannot send a friend request to yourself');
      }

      // First, check if they're already friends
      const { data: existingFriendship, error: friendshipErr } = await supabase
        .from('friendships')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${receiverId}),and(user1_id.eq.${receiverId},user2_id.eq.${user.id})`)
        .maybeSingle();

      if (friendshipErr) {
        console.warn('Error checking existing friendship:', friendshipErr);
      }

      if (existingFriendship) {
        return { alreadyFriends: true, receiverId };
      }

      // If the other user already sent me a pending request, accept it instead of creating a new one
      const { data: reversedPending, error: reversedErr } = await supabase
        .from('friend_requests')
        .select('id, sender_id, receiver_id, status')
        .eq('sender_id', receiverId)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (reversedErr) {
        console.warn('Error checking reversed pending request:', reversedErr);
      }

      if (reversedPending?.id) {
        const { error: acceptErr } = await supabase.rpc('accept_friend_request', {
          request_id: reversedPending.id,
        });
        if (acceptErr) throw acceptErr;
        return { acceptedExisting: true, receiverId };
      }

      // Check if I already sent a pending request to this user
      const { data: existingOutgoing, error: existingOutgoingErr } = await supabase
        .from('friend_requests')
        .select('id, status')
        .eq('sender_id', user.id)
        .eq('receiver_id', receiverId)
        .maybeSingle();

      if (existingOutgoingErr) {
        console.warn('Error checking existing outgoing request:', existingOutgoingErr);
      }

      if (existingOutgoing) {
        if (existingOutgoing.status === 'pending') {
          return { requestExists: true, receiverId };
        } else if (existingOutgoing.status === 'rejected') {
          // Delete the rejected request and create a new one
          const { error: deleteErr } = await supabase
            .from('friend_requests')
            .delete()
            .eq('id', existingOutgoing.id);

          if (deleteErr) {
            console.warn('Error deleting rejected request:', deleteErr);
            // Continue anyway, as the insert might work with upsert
          }
        }
      }

      // Create a new friend request with error handling for duplicates
      try {
        const { data, error } = await supabase
          .from('friend_requests')
          .insert({ sender_id: user.id, receiver_id: receiverId, status: 'pending' })
          .select()
          .maybeSingle();

        if (error) {
          // Handle duplicate request gracefully, including legacy 'accepted' rows without active friendship
          if (error.code === '23505' && error.message.includes('friend_requests_sender_id_receiver_id_key')) {
            const { data: existingRequest } = await supabase
              .from('friend_requests')
              .select('id, status, sender_id, receiver_id')
              .eq('sender_id', user.id)
              .eq('receiver_id', receiverId)
              .maybeSingle();

            if (existingRequest?.status === 'accepted') {
              // Double-check if a friendship actually exists
              const { data: friendship } = await supabase
                .from('friendships')
                .select('id')
                .or(`and(user1_id.eq.${user.id},user2_id.eq.${receiverId}),and(user1_id.eq.${receiverId},user2_id.eq.${user.id})`)
                .maybeSingle();

              if (friendship) {
                return { alreadyFriends: true, receiverId };
              }

              // Clean up stale accepted request and create a fresh pending one
              await supabase.from('friend_requests').delete().eq('id', existingRequest.id);

              const { data: newReq, error: newReqErr } = await supabase
                .from('friend_requests')
                .insert({ sender_id: user.id, receiver_id: receiverId, status: 'pending' })
                .select()
                .maybeSingle();

              if (newReqErr) throw newReqErr;
              return { data: newReq, receiverId };
            } else if (existingRequest?.status === 'pending') {
              return { requestExists: true, receiverId };
            }
          }
          throw error;
        }

        return { data, receiverId };
      } catch (error: any) {
        // Final fallback for any constraint violations
        if (error.code === '23505') {
          return { requestExists: true, receiverId };
        }
        throw error;
      }
    },
    onMutate: async (receiverId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['friendshipStatus', user?.id, receiverId] });

      // Snapshot previous value
      const previousStatus = queryClient.getQueryData(['friendshipStatus', user?.id, receiverId]);

      // Optimistically update to sent
      queryClient.setQueryData(['friendshipStatus', user?.id, receiverId], 'sent');

      return { previousStatus, receiverId };
    },
    onSuccess: (result) => {
      const alreadyAccepted = (result as any)?.acceptedExisting;
      const alreadyFriends = (result as any)?.alreadyFriends;
      const receiverId = (result as any)?.receiverId;
      const existed = (result as any)?.requestExists;
      
      if (alreadyFriends) {
        toast.success('You are already friends!');
      } else if (alreadyAccepted) {
        toast.success('Friend request accepted!');
      } else if (existed) {
        toast.success('Friend request already exists');
      } else {
        toast.success('Friend request sent!');
      }
      
      // Update friendship status cache
      if ((alreadyAccepted || alreadyFriends) && receiverId) {
        queryClient.setQueryData(['friendshipStatus', user?.id, receiverId], 'friends');
      }
      
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friends', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['friendshipStatus'] });
    },
    onError: (error: any, receiverId: string, context: any) => {
      // Rollback optimistic update
      if (context?.previousStatus !== undefined) {
        queryClient.setQueryData(['friendshipStatus', user?.id, receiverId], context.previousStatus);
      }
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
      return { data, friendId };
    },
    onMutate: async (friendId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['friendshipStatus', user?.id, friendId] });
      await queryClient.cancelQueries({ queryKey: ['friends', user?.id] });

      // Snapshot previous values
      const previousFriends = queryClient.getQueryData(['friends', user?.id]);
      const previousStatus = queryClient.getQueryData(['friendshipStatus', user?.id, friendId]);

      // Optimistically update friendship status to 'none'
      queryClient.setQueryData(['friendshipStatus', user?.id, friendId], 'none');

      // Optimistically remove friend from friends list
      queryClient.setQueryData(['friends', user?.id], (old: Friend[] | undefined) => {
        return old?.filter(friend => friend.id !== friendId) || [];
      });

      return { previousFriends, previousStatus, friendId };
    },
    onSuccess: (result) => {
      toast.success('Friend removed');
      
      // Invalidate all related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['friends', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['friendshipStatus'] });
      
      // Specifically clear the friendship status cache for this user pair
      queryClient.removeQueries({ queryKey: ['friendshipStatus', user?.id, result.friendId] });
    },
    onError: (error: any, friendId: string, context: any) => {
      // Rollback optimistic updates
      if (context?.previousFriends !== undefined) {
        queryClient.setQueryData(['friends', user?.id], context.previousFriends);
      }
      if (context?.previousStatus !== undefined) {
        queryClient.setQueryData(['friendshipStatus', user?.id, friendId], context.previousStatus);
      }
      
      toast.error(error.message || 'Failed to remove friend');
    },
  });

  // Friendship status query hook
  // Friendship status query hook
  const useFriendshipStatus = (targetUserId: string) => {
    return useQuery({
      queryKey: ['friendshipStatus', user?.id, targetUserId],
      queryFn: async (): Promise<'none' | 'sent' | 'received' | 'friends'> => {
        if (!user?.id || user.id === targetUserId) return 'none';

        // Use cached data first to avoid unnecessary API calls
        const currentFriends = (queryClient.getQueryData(['friends', user?.id]) as Friend[]) || [];
        const currentSentRequests = (queryClient.getQueryData(['friendRequests', 'sent', user?.id]) as FriendRequest[]) || [];
        const currentReceivedRequests = (queryClient.getQueryData(['friendRequests', 'received', user?.id]) as FriendRequest[]) || [];

        // Check friends first (fastest check)
        if (currentFriends.some(f => f.id === targetUserId)) {
          return 'friends';
        }

        // Check sent requests
        if (currentSentRequests.some(r => r.receiver_id === targetUserId && r.status === 'pending')) {
          return 'sent';
        }

        // Check received requests
        if (currentReceivedRequests.some(r => r.sender_id === targetUserId && r.status === 'pending')) {
          return 'received';
        }

        // Fallback to server check when cache has no answer
        const { data: pendingRequest, error: requestError } = await supabase
          .from('friend_requests')
          .select('id, sender_id, receiver_id, status, created_at')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${user.id})`)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (requestError) throw requestError;

        if (pendingRequest) {
          return pendingRequest.sender_id === user.id ? 'sent' : 'received';
        }

        const { data: friendship, error: friendshipError } = await supabase
          .from('friendships')
          .select('id, user1_id, user2_id, created_at')
          .or(`and(user1_id.eq.${user.id},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${user.id})`)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (friendshipError) throw friendshipError;
        return friendship ? 'friends' : 'none';
      },
      enabled: !!user?.id && !!targetUserId && user.id !== targetUserId,
      staleTime: 15000, // 15 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Check friendship status - memoized callback for backward compatibility
  const checkFriendshipStatus = useCallback(async (userId: string): Promise<'none' | 'sent' | 'received' | 'friends'> => {
    try {
      if (!user?.id) return 'none';

      // Check if there's a pending request between current user and target user
      const { data: pendingRequest, error: requestError } = await supabase
        .from('friend_requests')
        .select('id, sender_id, receiver_id, status, created_at')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (requestError) throw requestError;

      if (pendingRequest) {
        return pendingRequest.sender_id === user.id ? 'sent' : 'received';
      }

      // Check if they're already friends  
      const { data: friendship, error: friendshipError } = await supabase
        .from('friendships')
        .select('id, user1_id, user2_id, created_at')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${userId}),and(user1_id.eq.${userId},user2_id.eq.${user.id})`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (friendshipError) throw friendshipError;
      return friendship ? 'friends' : 'none';
    } catch (error) {
      console.error('Error in checkFriendshipStatus:', error);
      return 'none';
    }
  }, [user?.id]);

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
    sendFriendRequest: sendFriendRequestMutation.mutateAsync,
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
    useFriendshipStatus,
  };
};