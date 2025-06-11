import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, MapPin, Loader2, Trash2, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

// Reservation type that matches our Supabase schema
interface Reservation {
  id: string;
  course_id: string;
  course_name: string;
  course_location: string;
  date: string;
  time: string;
  players: number;
  user_id: string;
  created_at: string;
}

const ReservationsList = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch reservations from Supabase
  const { data: reservations, isLoading } = useQuery({
    queryKey: ["reservations", user?.id],
    queryFn: async () => {
      if (!user) return { upcoming: [], past: [] };
      
      const { data: allReservations, error } = await supabase
        .from("reservations")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true });
        
      if (error) {
        console.error("Error fetching reservations:", error);
        throw error;
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Split into upcoming and past
      const upcoming: Reservation[] = [];
      const past: Reservation[] = [];
      
      allReservations?.forEach(res => {
        const resDate = new Date(res.date);
        resDate.setHours(0, 0, 0, 0);
        
        if (resDate >= today) {
          upcoming.push(res as Reservation);
        } else {
          past.push(res as Reservation);
        }
      });
      
      return { upcoming, past };
    },
    enabled: !!user,
  });
  
  // Cancel reservation mutation
  const cancelMutation = useMutation({
    mutationFn: async (reservationId: string) => {
      const { error } = await supabase
        .from("reservations")
        .delete()
        .eq("id", reservationId);
        
      if (error) throw error;
      return reservationId;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["reservations", user?.id] });
      
      toast({
        title: language === "en" ? "Reservation Cancelled" : "Reserva Cancelada",
        description: language === "en" 
          ? "Your reservation has been successfully cancelled." 
          : "Tu reserva ha sido cancelada con éxito.",
      });
    },
    onError: (error) => {
      console.error("Error cancelling reservation:", error);
      toast({
        title: language === "en" ? "Error" : "Error",
        description: language === "en" 
          ? "There was an error cancelling your reservation. Please try again." 
          : "Hubo un error al cancelar tu reserva. Por favor intenta de nuevo.",
        variant: "destructive"
      });
    }
  });
  
  // Handle reservation cancellation
  const handleCancelReservation = (reservationId: string) => {
    cancelMutation.mutate(reservationId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const upcomingReservations = reservations?.upcoming || [];
  const pastReservations = reservations?.past || [];

  return (
    <Tabs defaultValue="upcoming" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="upcoming">{t("reservations", "upcoming")}</TabsTrigger>
        <TabsTrigger value="past">{t("reservations", "past")}</TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming" className="space-y-4 mt-2">
        {upcomingReservations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t("reservations", "noReservations")}</p>
          </div>
        ) : (
          upcomingReservations.map((reservation) => (
            <ReservationCard 
              key={reservation.id}
              reservation={reservation}
              isPast={false}
              onCancel={handleCancelReservation}
              isCancelling={cancelMutation.isPending && cancelMutation.variables === reservation.id}
            />
          ))
        )}
      </TabsContent>

      <TabsContent value="past" className="space-y-4 mt-2">
        {pastReservations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t("reservations", "noReservations")}</p>
          </div>
        ) : (
          pastReservations.map((reservation) => (
            <ReservationCard 
              key={reservation.id}
              reservation={reservation}
              isPast={true}
              onCancel={undefined}
              isCancelling={false}
            />
          ))
        )}
      </TabsContent>
    </Tabs>
  );
};

interface ReservationCardProps {
  reservation: Reservation;
  isPast: boolean;
  onCancel?: (id: string) => void;
  isCancelling: boolean;
}

const ReservationCard = ({ reservation, isPast, onCancel, isCancelling }: ReservationCardProps) => {
  const { language, t } = useLanguage();
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{reservation.course_name}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <MapPin size={14} />
          {reservation.course_location}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{t("reservations", "date")}</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-sm">{format(new Date(reservation.date), "MMM d, yyyy")}</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{t("reservations", "time")}</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-sm">{reservation.time}</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{t("common", "players")}</span>
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span className="text-sm">{reservation.players}</span>
            </div>
          </div>
        </div>
      </CardContent>
      {!isPast && onCancel && (
        <CardFooter className="pt-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full text-sm"
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    {language === "en" ? "Cancelling..." : "Cancelando..."}
                  </>
                ) : (
                  t("reservations", "cancelReservation")
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white">
              <AlertDialogHeader>
                <AlertDialogTitle>{t("reservations", "cancelReservation")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {language === "en" 
                    ? `Are you sure you want to cancel your reservation at ${reservation.course_name} on ${format(new Date(reservation.date), "MMM d, yyyy")} at ${reservation.time}?` 
                    : `¿Estás seguro de que quieres cancelar tu reserva en ${reservation.course_name} el ${format(new Date(reservation.date), "MMM d, yyyy")} a las ${reservation.time}?`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("common", "cancel")}</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onCancel(reservation.id)}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {t("reservations", "cancelReservation")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      )}
    </Card>
  );
};

export default ReservationsList;
