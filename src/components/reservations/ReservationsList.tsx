
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO, isAfter } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { Calendar, Clock, MapPin, Users, Loader2, X, CalendarX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Define reservation type
interface Reservation {
  id: string;
  user_id: string;
  course_id: string;
  course_name: string;
  course_location: string | null;
  date: string;
  time: string;
  players: number;
  created_at: string;
}

const ReservationsList = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>("upcoming");
  const queryClient = useQueryClient();
  const dateLocale = language === "es" ? es : enUS;
  
  const formatDate = (dateStr: string) => {
    try {
      const parsedDate = parseISO(dateStr);
      return format(parsedDate, "PPP", { locale: dateLocale });
    } catch (e) {
      console.error("Date formatting error:", e);
      return dateStr;
    }
  };
  
  // Fetch reservations
  const { data: reservations, isLoading } = useQuery({
    queryKey: ["reservations", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .eq("user_id", user.id);
      
      if (error) throw new Error(error.message);
      return data as Reservation[];
    },
    enabled: !!user
  });
  
  // Cancel reservation mutation
  const cancelReservation = useMutation({
    mutationFn: async (reservationId: string) => {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("reservations")
        .delete()
        .eq("id", reservationId)
        .eq("user_id", user.id);
      
      if (error) throw error;
      return reservationId;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["reservations", user?.id] });
      
      // Show success message
      toast({
        title: language === "en" ? "Reservation Cancelled" : "Reserva Cancelada",
        description: language === "en"
          ? "Your reservation has been successfully cancelled."
          : "Tu reserva ha sido cancelada exitosamente.",
      });
    },
    onError: (error) => {
      console.error("Error cancelling reservation:", error);
      toast({
        title: language === "en" ? "Error" : "Error",
        description: language === "en"
          ? "There was an error cancelling your reservation. Please try again."
          : "Hubo un error al cancelar tu reserva. Por favor intenta nuevamente.",
        variant: "destructive"
      });
    }
  });

  const handleCancelReservation = (id: string) => {
    if (window.confirm(language === "en" 
      ? "Are you sure you want to cancel this reservation?" 
      : "¿Estás seguro que quieres cancelar esta reserva?")) {
      cancelReservation.mutate(id);
    }
  };
  
  // Filter reservations into upcoming and past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingReservations = reservations?.filter(res => {
    const reservationDate = new Date(`${res.date}T${res.time}`);
    return isAfter(reservationDate, today) || reservationDate.toDateString() === today.toDateString();
  }) || [];
  
  const pastReservations = reservations?.filter(res => {
    const reservationDate = new Date(`${res.date}T${res.time}`);
    return !isAfter(reservationDate, today) && reservationDate.toDateString() !== today.toDateString();
  }) || [];
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="upcoming">{t("reservations", "upcoming")}</TabsTrigger>
        <TabsTrigger value="past">{t("reservations", "past")}</TabsTrigger>
      </TabsList>
      
      <TabsContent value="upcoming" className="space-y-4">
        {upcomingReservations.length > 0 ? (
          upcomingReservations.map((reservation) => (
            <Card key={reservation.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold">{reservation.course_name}</h3>
                    <Badge variant="outline" className="ml-2 bg-primary/10">
                      {reservation.time}
                    </Badge>
                  </div>
                  
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>{formatDate(reservation.date)}</span>
                    </div>
                    
                    {reservation.course_location && (
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4" />
                        <span>{reservation.course_location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      <span>
                        {reservation.players} {reservation.players === 1 
                          ? language === "en" ? "player" : "jugador" 
                          : language === "en" ? "players" : "jugadores"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="w-full flex items-center"
                      onClick={() => handleCancelReservation(reservation.id)}
                      disabled={cancelReservation.isPending}
                    >
                      {cancelReservation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <X className="mr-2 h-4 w-4" />
                      )}
                      {t("reservations", "cancelReservation")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarX className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              {t("reservations", "noReservations")}
            </p>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="past" className="space-y-4">
        {pastReservations.length > 0 ? (
          pastReservations.map((reservation) => (
            <Card key={reservation.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">{reservation.course_name}</h3>
                  <Badge variant="outline" className="ml-2 bg-muted">
                    {reservation.time}
                  </Badge>
                </div>
                
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>{formatDate(reservation.date)}</span>
                  </div>
                  
                  {reservation.course_location && (
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4" />
                      <span>{reservation.course_location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    <span>
                      {reservation.players} {reservation.players === 1 
                        ? language === "en" ? "player" : "jugador" 
                        : language === "en" ? "players" : "jugadores"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarX className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              {t("reservations", "noReservations")}
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default ReservationsList;
