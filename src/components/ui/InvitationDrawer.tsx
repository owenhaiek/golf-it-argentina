import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, MapPin, Trophy, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useTournamentsAndMatches } from "@/hooks/useTournamentsAndMatches";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";
import { parseLocalDate } from "@/utils/argentinaTimezone";

export const InvitationDrawer = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);
  const [hasCheckedInvitations, setHasCheckedInvitations] = useState(false);
  
  const { 
    pendingMatches, 
    matchesLoading, 
    acceptMatch, 
    declineMatch, 
    isAcceptingMatch, 
    isDecliningMatch 
  } = useTournamentsAndMatches();

  // Check for pending invitations when data loads
  useEffect(() => {
    if (!matchesLoading && !hasCheckedInvitations && user?.id) {
      const userPendingMatches = pendingMatches.filter(match => 
        match.opponent_id === user.id
      );
      
      if (userPendingMatches.length > 0) {
        // Small delay for smooth entry animation
        setTimeout(() => setIsVisible(true), 1000);
      }
      setHasCheckedInvitations(true);
    }
  }, [pendingMatches, matchesLoading, hasCheckedInvitations, user?.id]);

  const handleAccept = async (matchId: string) => {
    await acceptMatch(matchId);
    setIsVisible(false);
  };

  const handleDecline = async (matchId: string) => {
    await declineMatch(matchId);
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const userPendingMatches = pendingMatches.filter(match => 
    match.opponent_id === user?.id
  );

  if (!isVisible || userPendingMatches.length === 0) return null;

  const invitation = userPendingMatches[0]; // Show first invitation

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={`fixed left-0 right-0 bg-background rounded-t-[20px] shadow-2xl bottom-[76px] md:bottom-0`}
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
          <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mt-3 mb-6" />

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute top-4 right-4 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="px-6 pb-8">
            {/* Title */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Swords className="h-8 w-8 text-primary" />
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {t("matches", "matchChallenge") || "Match Challenge!"}
              </h2>
              <p className="text-muted-foreground">
                {t("matches", "youveBeenChallenged") || "You've been challenged to a match"}
              </p>
            </div>

            {/* Match details card */}
            <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage src={invitation.creator?.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {invitation.creator?.full_name?.charAt(0) ||
                       invitation.creator?.username?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                   <div className="flex-1">
                     <h3 className="font-semibold text-foreground">
                       {invitation.creator?.full_name || 
                        invitation.creator?.username || t("matches", "anonymousPlayer") || "Anonymous Player"}
                     </h3>
                     <p className="text-sm text-muted-foreground">{t("matches", "challengedYou") || "challenged you"}</p>
                   </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    {invitation.match_type.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Trophy className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="font-medium text-foreground">{invitation.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {format(parseLocalDate(invitation.match_date), 'MMMM d, yyyy')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {invitation.golf_courses?.name}
                      {invitation.golf_courses?.city && (
                        <span className="text-muted-foreground/70">
                          , {invitation.golf_courses.city}
                        </span>
                      )}
                    </span>
                  </div>

                   {invitation.stakes && (
                     <div className="flex items-center gap-3 text-sm">
                       <span className="text-xs font-medium text-primary">{(t("matches", "stakes") || "STAKES").toUpperCase()}:</span>
                       <span className="text-muted-foreground">{invitation.stakes}</span>
                     </div>
                   )}
                </div>
              </CardContent>
            </Card>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => handleDecline(invitation.id)}
                disabled={isDecliningMatch || isAcceptingMatch}
                className="flex-1 h-12 border-destructive/20 text-destructive hover:bg-destructive/10"
              >
                {isDecliningMatch ? (t("matches", "declining") || "Declining...") : (t("matches", "decline") || "Decline")}
              </Button>
              
              <Button
                onClick={() => handleAccept(invitation.id)}
                disabled={isAcceptingMatch || isDecliningMatch}
                className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {isAcceptingMatch ? (t("matches", "accepting") || "Accepting...") : (t("matches", "acceptChallenge") || "Accept Challenge")}
              </Button>
            </div>

            {/* Additional matches indicator */}
            {userPendingMatches.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center mt-4"
              >
                <Badge variant="secondary" className="bg-muted/50">
                  +{userPendingMatches.length - 1} {t("matches", "moreInvitations") || "more invitation"}
                  {userPendingMatches.length > 2 ? 's' : ''}
                </Badge>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};