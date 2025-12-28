import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, MapPin, Trophy, Swords, Check, XIcon, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PendingInvitation {
  id: string;
  type: 'match' | 'tournament';
  name: string;
  date: string;
  location: string;
  creator: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  participants?: Array<{
    id: string;
    name: string;
    avatar_url?: string;
  }>;
  stakes?: string;
}

export const InvitationDrawer = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch pending invitations
  const fetchInvitations = async () => {
    if (!user?.id) return;

    try {
      // Fetch pending match participants for this user
      const { data: matchParticipants, error: matchError } = await supabase
        .from('match_participants')
        .select(`
          id,
          match_id,
          status,
          matches (
            id,
            name,
            match_date,
            stakes,
            creator_id,
            golf_courses (name, city)
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if (matchError) {
        console.error('Error fetching match invitations:', matchError);
        return;
      }

      if (!matchParticipants || matchParticipants.length === 0) {
        setInvitations([]);
        return;
      }

      // Get creator profiles
      const creatorIds = matchParticipants.map(mp => (mp.matches as any)?.creator_id).filter(Boolean);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .in('id', creatorIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Get all participants for each match
      const matchIds = matchParticipants.map(mp => mp.match_id);
      const { data: allParticipants } = await supabase
        .from('match_participants')
        .select('match_id, user_id, status')
        .in('match_id', matchIds);

      const participantUserIds = allParticipants?.map(p => p.user_id) || [];
      const { data: participantProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .in('id', participantUserIds);

      const participantProfilesMap = new Map(participantProfiles?.map(p => [p.id, p]) || []);

      const formattedInvitations: PendingInvitation[] = matchParticipants
        .filter(mp => mp.matches)
        .map(mp => {
          const match = mp.matches as any;
          const creatorProfile = profilesMap.get(match.creator_id);
          const matchParticipantsList = allParticipants?.filter(p => p.match_id === mp.match_id) || [];
          
          return {
            id: mp.id,
            type: 'match' as const,
            name: match.name,
            date: match.match_date,
            location: match.golf_courses?.name || 'Campo de Golf',
            creator: {
              id: match.creator_id,
              name: creatorProfile?.full_name || creatorProfile?.username || 'Jugador',
              avatar_url: creatorProfile?.avatar_url
            },
            participants: matchParticipantsList.map(p => {
              const profile = participantProfilesMap.get(p.user_id);
              return {
                id: p.user_id,
                name: profile?.full_name || profile?.username || 'Jugador',
                avatar_url: profile?.avatar_url
              };
            }),
            stakes: match.stakes
          };
        });

      setInvitations(formattedInvitations);
      if (formattedInvitations.length > 0) {
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  useEffect(() => {
    fetchInvitations();

    // Set up real-time subscription for new invitations
    if (!user?.id) return;

    const channel = supabase
      .channel('invitation-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'match_participants',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New invitation received:', payload);
          fetchInvitations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const handleAccept = async (invitation: PendingInvitation) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('match_participants')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);

      if (error) throw error;

      toast({
        title: "¡Desafío Aceptado!",
        description: `Te has unido al partido "${invitation.name}"`,
      });

      // Remove this invitation
      const newInvitations = invitations.filter(inv => inv.id !== invitation.id);
      setInvitations(newInvitations);
      
      if (newInvitations.length === 0) {
        setIsVisible(false);
      } else if (currentIndex >= newInvitations.length) {
        setCurrentIndex(newInvitations.length - 1);
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error",
        description: "No se pudo aceptar la invitación",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (invitation: PendingInvitation) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('match_participants')
        .update({ status: 'rejected' })
        .eq('id', invitation.id);

      if (error) throw error;

      toast({
        title: "Invitación Rechazada",
        description: "Has rechazado el desafío",
      });

      // Remove this invitation
      const newInvitations = invitations.filter(inv => inv.id !== invitation.id);
      setInvitations(newInvitations);
      
      if (newInvitations.length === 0) {
        setIsVisible(false);
      } else if (currentIndex >= newInvitations.length) {
        setCurrentIndex(newInvitations.length - 1);
      }
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      toast({
        title: "Error",
        description: "No se pudo rechazar la invitación",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || invitations.length === 0) {
    return null;
  }

  const currentInvitation = invitations[currentIndex];
  if (!currentInvitation) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-3 mb-3"
          >
            <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="relative p-4 pb-3 border-b border-border/30">
                <div className="absolute right-3 top-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="h-8 w-8 rounded-full bg-muted/50 hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                    <Swords className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">¡Nuevo Desafío!</h3>
                    <p className="text-sm text-muted-foreground">
                      {currentInvitation.creator.name} te ha desafiado
                    </p>
                  </div>
                </div>
                
                {invitations.length > 1 && (
                  <div className="flex gap-1 justify-center mt-3">
                    {invitations.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-1.5 rounded-full transition-all ${
                          idx === currentIndex 
                            ? 'w-6 bg-primary' 
                            : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Match Name */}
                <div className="text-center">
                  <h4 className="text-xl font-bold text-foreground">{currentInvitation.name}</h4>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/30 rounded-xl p-3 border border-border/30">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Fecha</span>
                    </div>
                    <p className="font-semibold text-sm text-foreground">
                      {format(new Date(currentInvitation.date), "d 'de' MMMM", { locale: es })}
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-3 border border-border/30">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>Campo</span>
                    </div>
                    <p className="font-semibold text-sm text-foreground truncate">
                      {currentInvitation.location}
                    </p>
                  </div>
                </div>

                {/* Participants */}
                <div className="bg-muted/30 rounded-xl p-3 border border-border/30">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-3">
                    <Users className="h-3.5 w-3.5" />
                    <span>Participantes</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-1 flex-wrap">
                    {/* Creator */}
                    <div className="flex flex-col items-center px-2">
                      <Avatar className="h-10 w-10 ring-2 ring-emerald-500/50">
                        <AvatarImage src={currentInvitation.creator.avatar_url} />
                        <AvatarFallback className="bg-emerald-500/20 text-emerald-400 font-bold text-sm">
                          {currentInvitation.creator.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[10px] text-foreground mt-1 truncate max-w-[50px]">
                        {currentInvitation.creator.name.split(' ')[0]}
                      </span>
                      <Badge variant="outline" className="text-[8px] h-3.5 px-1 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                        Creador
                      </Badge>
                    </div>

                    {/* VS and other participants */}
                    {currentInvitation.participants?.map((participant, idx) => (
                      <div key={participant.id} className="flex items-center">
                        <span className="text-[10px] font-bold text-muted-foreground px-1">vs</span>
                        <div className="flex flex-col items-center px-2">
                          <Avatar className={`h-10 w-10 ring-2 ${participant.id === user?.id ? 'ring-primary/50' : 'ring-red-500/30'}`}>
                            <AvatarImage src={participant.avatar_url} />
                            <AvatarFallback className={`font-bold text-sm ${participant.id === user?.id ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-400'}`}>
                              {participant.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[10px] text-foreground mt-1 truncate max-w-[50px]">
                            {participant.id === user?.id ? 'Tú' : participant.name.split(' ')[0]}
                          </span>
                          {participant.id === user?.id && (
                            <Badge variant="outline" className="text-[8px] h-3.5 px-1 bg-primary/10 text-primary border-primary/30">
                              Invitado
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stakes */}
                {currentInvitation.stakes && (
                  <div className="flex items-center gap-2 bg-amber-500/10 rounded-xl px-4 py-3 border border-amber-500/20">
                    <Trophy className="h-4 w-4 text-amber-400" />
                    <span className="text-sm font-medium text-amber-400">
                      {currentInvitation.stakes}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 pt-2 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleReject(currentInvitation)}
                  disabled={isLoading}
                  className="flex-1 h-12 rounded-xl border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  <XIcon className="h-4 w-4 mr-2" />
                  Rechazar
                </Button>
                <Button
                  onClick={() => handleAccept(currentInvitation)}
                  disabled={isLoading}
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg shadow-emerald-500/20"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Aceptar
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};