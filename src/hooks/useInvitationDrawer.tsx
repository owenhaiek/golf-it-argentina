import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const useInvitationDrawer = () => {
  const { user } = useAuth();
  const [hasShownInvitation, setHasShownInvitation] = useState(false);

  // Since matches are now created as active (no pending state), 
  // there are no pending invitations to show
  const hasPendingInvitations = () => {
    return false;
  };

  const shouldShowInvitationDrawer = () => {
    return false;
  };

  const markInvitationShown = () => {
    setHasShownInvitation(true);
  };

  // Reset when user changes
  useEffect(() => {
    setHasShownInvitation(false);
  }, [user?.id]);

  return {
    shouldShowInvitationDrawer: false,
    markInvitationShown,
    hasPendingInvitations: false,
    isLoading: false
  };
};