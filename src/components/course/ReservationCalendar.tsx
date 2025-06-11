import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Reservation {
  id: string;
  date: string;
  time: string;
  players: number;
  player_name: string;
  license: string;
  status: string;
  course_name: string;
  course_location?: string;
}

interface ReservationCalendarProps {
  reservations: Reservation[];
}

const ReservationCalendar = ({ reservations }: ReservationCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const groupedReservations = reservations.reduce((acc: { [key: string]: Reservation[] }, reservation) => {
    const date = format(new Date(reservation.date), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(reservation);
    return acc;
  }, {});

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="flex flex-col sm:flex-row items-center justify-between p-0 mb-4">
        <CardTitle className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </CardTitle>
        <div className="flex items-center">
          <Button variant="outline" className="mr-2" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-7 gap-1">
          {/* Render day names */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
            <div key={dayName} className="text-center text-xs text-muted-foreground font-medium">
              {dayName}
            </div>
          ))}
          {/* Render calendar days */}
          {days.map((day) => {
            const dayString = format(day, 'yyyy-MM-dd');
            const hasReservations = groupedReservations[dayString] && groupedReservations[dayString].length > 0;
            const reservationsForDay = groupedReservations[dayString] || [];
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "p-1 relative text-center border rounded-md",
                  isSameMonth(day, currentMonth) ? "text-foreground" : "text-muted-foreground",
                  isToday(day) ? "font-semibold" : "",
                  hasReservations ? "bg-accent hover:bg-accent-hover" : "bg-transparent",
                  "transition-colors duration-200"
                )}
              >
                <time dateTime={format(day, "yyyy-MM-dd")} className="block text-sm">
                  {format(day, "d")}
                </time>
                {hasReservations && (
                  <div className="absolute bottom-1 left-0 w-full flex flex-col items-center">
                    {reservationsForDay.slice(0, 2).map((reservation, index) => (
                      <Badge
                        key={reservation.id}
                        variant="secondary"
                        className="text-[0.6rem] px-1 py-0.5 mt-0.5 rounded-md"
                      >
                        {reservation.time}
                      </Badge>
                    ))}
                    {reservationsForDay.length > 2 && (
                      <span className="text-[0.6rem] text-muted-foreground mt-0.5">
                        +{reservationsForDay.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReservationCalendar;
