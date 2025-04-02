
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, MapPin } from "lucide-react";
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

// Example reservation type
interface Reservation {
  id: string;
  courseId: string;
  courseName: string;
  courseLocation: string;
  date: Date;
  time: string;
  players: number;
}

// Sample data - in a real app this would come from a database
const sampleUpcomingReservations: Reservation[] = [
  {
    id: "res1",
    courseId: "course1",
    courseName: "Pine Valley Golf Club",
    courseLocation: "Pine Valley, NJ",
    date: new Date(Date.now() + 86400000 * 2), // 2 days from now
    time: "08:30",
    players: 2
  },
  {
    id: "res2",
    courseId: "course2",
    courseName: "Augusta National Golf Club",
    courseLocation: "Augusta, GA",
    date: new Date(Date.now() + 86400000 * 7), // 7 days from now
    time: "10:00",
    players: 4
  }
];

const samplePastReservations: Reservation[] = [
  {
    id: "res3",
    courseId: "course3",
    courseName: "Pebble Beach Golf Links",
    courseLocation: "Pebble Beach, CA",
    date: new Date(Date.now() - 86400000 * 7), // 7 days ago
    time: "09:15",
    players: 3
  }
];

const ReservationsList = () => {
  const { language, t } = useLanguage();
  const [upcomingReservations, setUpcomingReservations] = useState<Reservation[]>(sampleUpcomingReservations);
  const [pastReservations, setPastReservations] = useState<Reservation[]>(samplePastReservations);

  // Function to handle reservation cancellation
  const cancelReservation = (reservationId: string) => {
    // In a real app, this would make an API call to cancel the reservation
    setUpcomingReservations(current => 
      current.filter(reservation => reservation.id !== reservationId)
    );
  };

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
              onCancel={cancelReservation}
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
}

const ReservationCard = ({ reservation, isPast, onCancel }: ReservationCardProps) => {
  const { language, t } = useLanguage();
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{reservation.courseName}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <MapPin size={14} />
          {reservation.courseLocation}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{t("reservations", "date")}</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-sm">{format(reservation.date, "MMM d, yyyy")}</span>
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
              <Button variant="outline" className="w-full text-sm">{t("reservations", "cancelReservation")}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white">
              <AlertDialogHeader>
                <AlertDialogTitle>{t("reservations", "cancelReservation")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {language === "en" 
                    ? `Are you sure you want to cancel your reservation at ${reservation.courseName} on ${format(reservation.date, "MMM d, yyyy")} at ${reservation.time}?` 
                    : `¿Estás seguro de que quieres cancelar tu reserva en ${reservation.courseName} el ${format(reservation.date, "MMM d, yyyy")} a las ${reservation.time}?`}
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
