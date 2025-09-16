import { useState, useEffect } from "react";
import { useTournamentsAndMatches } from "./useTournamentsAndMatches";
import { useAuth } from "@/contexts/AuthContext";

export const useInvitationDrawer = () => {
  const { user } = useAuth();
  const [hasShownInvitation, setHasShownInvitation] = useState(false);
  
  const { 
    pendingMatches, 
    matchesLoading,
    upcomingTournaments,
    tournamentsLoading
  } = useTournamentsAndMatches();

  // Check if user has pending invitations
  const hasPendingInvitations = () => {
    if (!user?.id) return false;
    
    const userPendingMatches = pendingMatches.filter(match => 
      match.opponent_id === user.id
    );
    
    // Could also check for tournament invitations here in the future
    // const userTournamentInvitations = upcomingTournaments.filter(...);
    
    return userPendingMatches.length > 0;
  };

  const shouldShowInvitationDrawer = () => {
    return (
      !matchesLoading && 
      !tournamentsLoading && 
      !hasShownInvitation && 
      hasPendingInvitations()
    );
  };

  const markInvitationShown = () => {
    setHasShownInvitation(true);
  };

  // Reset when user changes
  useEffect(() => {
    setHasShownInvitation(false);
  }, [user?.id]);

  return {
    shouldShowInvitationDrawer: shouldShowInvitationDrawer(),
    markInvitationShown,
    hasPendingInvitations: hasPendingInvitations(),
    isLoading: matchesLoading || tournamentsLoading
  };
};