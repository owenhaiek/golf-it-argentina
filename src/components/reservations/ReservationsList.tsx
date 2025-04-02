
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, MapPin, Clock, Users, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { Separator } from '@/components/ui/separator';

interface Reservation {
  id: string;
  user_id: string;
  course_id: string;
  course_name: string;
  course_location: string | null;
  date: string;
  time: string;
  players: number;
  created_at: string | null;
}

export function ReservationsList() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const fetchReservations = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true });
        
      if (error) throw error;
      
      setReservations(data as Reservation[]);
      
    } catch (error: any) {
      console.error("Error fetching reservations:", error);
      toast({
        title: t("common", "error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (id: string) => {
    try {
      const { error } = await supabase
        .from("reservations")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      setReservations(reservations.filter(res => res.id !== id));
      
      toast({
        title: t("reservations", "cancelSuccess"),
        description: t("reservations", "reservationCancelled"),
      });
    } catch (error: any) {
      console.error("Error cancelling reservation:", error);
      toast({
        title: t("common", "error"),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("reservations", "myReservations")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("reservations", "myReservations")}</CardTitle>
      </CardHeader>
      <CardContent>
        {reservations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t("reservations", "noReservations")}
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map(reservation => (
              <div key={reservation.id} className="border rounded-md p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium">{reservation.course_name}</h4>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        {t("reservations", "cancel")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("reservations", "cancelReservation")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("reservations", "cancelConfirmation")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("common", "cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => cancelReservation(reservation.id)}>
                          {t("common", "confirm")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                
                <Separator className="my-2" />
                
                <div className="space-y-2 text-sm">
                  {reservation.course_location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{reservation.course_location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(reservation.date)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{reservation.time}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{reservation.players} {reservation.players === 1 
                      ? t("reservations", "player") 
                      : t("reservations", "players")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
