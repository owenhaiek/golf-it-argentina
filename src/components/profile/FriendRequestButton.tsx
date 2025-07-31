import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Clock, UserX } from "lucide-react";
import { useFriendsData } from "@/hooks/useFriendsData";
import { useAuth } from "@/contexts/AuthContext";

interface FriendRequestButtonProps {
  userId: string;
  size?: "sm" | "default" | "lg";
}

export const FriendRequestButton = ({ userId, size = "sm" }: FriendRequestButtonProps) => {
  const { user } = useAuth();
  const { sendFriendRequest, sendingFriendRequest, checkFriendshipStatus } = useFriendsData();
  const [status, setStatus] = useState<'none' | 'sent' | 'received' | 'friends' | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      if (!user?.id || user.id === userId) return;
      const friendshipStatus = await checkFriendshipStatus(userId);
      setStatus(friendshipStatus);
    };

    checkStatus();
  }, [userId, user?.id, checkFriendshipStatus]);

  // Don't show button for own profile
  if (!user?.id || user.id === userId) {
    return null;
  }

  const handleSendRequest = () => {
    sendFriendRequest(userId);
    setStatus('sent'); // Optimistically update UI
  };

  const getButtonContent = () => {
    switch (status) {
      case 'friends':
        return {
          icon: <UserCheck className="h-4 w-4" />,
          text: 'Friends',
          variant: 'secondary' as const,
          disabled: true
        };
      case 'sent':
        return {
          icon: <Clock className="h-4 w-4" />,
          text: 'Sent',
          variant: 'outline' as const,
          disabled: true
        };
      case 'received':
        return {
          icon: <UserX className="h-4 w-4" />,
          text: 'Pending',
          variant: 'outline' as const,
          disabled: true
        };
      default:
        return {
          icon: <UserPlus className="h-4 w-4" />,
          text: 'Add Friend',
          variant: 'default' as const,
          disabled: sendingFriendRequest
        };
    }
  };

  const buttonContent = getButtonContent();

  return (
    <Button
      size={size}
      variant={buttonContent.variant}
      onClick={handleSendRequest}
      disabled={buttonContent.disabled}
      className="flex items-center gap-2"
    >
      {buttonContent.icon}
      {size !== "sm" && buttonContent.text}
    </Button>
  );
};