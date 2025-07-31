import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, UserCheck, Clock, UserX, Loader2 } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      if (!user?.id || user.id === userId) return;
      setIsLoading(true);
      try {
        const friendshipStatus = await checkFriendshipStatus(userId);
        setStatus(friendshipStatus);
      } finally {
        setIsLoading(false);
      }
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

  if (isLoading) {
    return (
      <Button size={size} variant="outline" disabled className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        {size !== "sm" && "Loading..."}
      </Button>
    );
  }

  const getButtonContent = () => {
    switch (status) {
      case 'friends':
        return {
          icon: <UserCheck className="h-4 w-4" />,
          text: 'Friends',
          variant: 'secondary' as const,
          disabled: true,
          className: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100'
        };
      case 'sent':
        return {
          icon: <Clock className="h-4 w-4 animate-pulse" />,
          text: 'Sent',
          variant: 'outline' as const,
          disabled: true,
          className: 'bg-amber-50 text-amber-600 border-amber-200'
        };
      case 'received':
        return {
          icon: <UserX className="h-4 w-4" />,
          text: 'Pending',
          variant: 'outline' as const,
          disabled: true,
          className: 'bg-blue-50 text-blue-600 border-blue-200'
        };
      default:
        return {
          icon: <UserPlus className="h-4 w-4" />,
          text: 'Add Friend',
          variant: 'default' as const,
          disabled: sendingFriendRequest,
          className: 'hover:scale-105 transition-transform duration-150'
        };
    }
  };

  const buttonContent = getButtonContent();

  return (
    <div className="relative">
      <Button
        size={size}
        variant={buttonContent.variant}
        onClick={handleSendRequest}
        disabled={buttonContent.disabled || sendingFriendRequest}
        className={`flex items-center gap-2 ${buttonContent.className}`}
      >
        {sendingFriendRequest ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          buttonContent.icon
        )}
        {size !== "sm" && (sendingFriendRequest ? "Sending..." : buttonContent.text)}
      </Button>
      
      {/* Success animation indicator */}
      {status === 'sent' && size !== "sm" && (
        <Badge 
          variant="secondary" 
          className="absolute -top-2 -right-2 bg-primary text-primary-foreground animate-pulse"
        >
          ✓
        </Badge>
      )}
    </div>
  );
};