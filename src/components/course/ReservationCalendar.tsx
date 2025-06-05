
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay, parseISO } from "date-fns";
import { Calendar as CalendarIcon, Clock, Users, User } from "lucide-react";

interface Reservation {
  id: string;
  date: string;
  time: string;
  players: number;
  status: string;
  player_name: string;
  license: string;
  additional_players: string | null;
}

interface ReservationCalendarProps {
  reservations: Reservation[];
}

const ReservationCalendar = ({ reservations }: ReservationCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Get reservations for selected date
  const getReservationsForDate = (date: Date) => {
    return reservations.filter(reservation => 
      isSameDay(parseISO(reservation.date), date)
    );
  };

  // Get dates that have reservations
  const getDatesWithReservations = () => {
    return reservations.map(reservation => parseISO(reservation.date));
  };

  const selectedDateReservations = selectedDate ? getReservationsForDate(selectedDate) : [];
  const datesWithReservations = getDatesWithReservations();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 text-xs">Confirmed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 text-xs">Cancelled</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 text-xs">Completed</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Pending</Badge>;
    }
  };

  const parseAdditionalPlayers = (additionalPlayersJson: string | null) => {
    if (!additionalPlayersJson) return [];
    try {
      return JSON.parse(additionalPlayersJson);
    } catch {
      return [];
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Calendar */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Reservation Calendar
          </CardTitle>
          <CardDescription>
            Select a date to view reservations. Dates with reservations are highlighted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border bg-white pointer-events-auto"
              modifiers={{
                hasReservations: datesWithReservations,
              }}
              modifiersStyles={{
                hasReservations: {
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  fontWeight: 'bold',
                },
              }}
            />
          </div>
          
          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500"></div>
              <span>Has Reservations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border"></div>
              <span>No Reservations</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Reservations */}
      <Card className="flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-lg">
            {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a Date"}
          </CardTitle>
          <CardDescription>
            {selectedDateReservations.length} reservation{selectedDateReservations.length !== 1 ? 's' : ''} for this day
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 p-0">
          {selectedDateReservations.length > 0 ? (
            <div className="h-full overflow-auto p-4">
              <div className="space-y-4">
                {selectedDateReservations
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((reservation) => {
                    const additionalPlayers = parseAdditionalPlayers(reservation.additional_players);
                    return (
                      <div key={reservation.id} className="p-3 border rounded-lg bg-gray-50 space-y-2">
                        {/* Time and Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{reservation.time}</span>
                          </div>
                          {getStatusBadge(reservation.status)}
                        </div>

                        {/* Players */}
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{reservation.players} player(s)</span>
                        </div>

                        {/* Main Player */}
                        <div className="text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">{reservation.player_name}</span>
                            <span className="text-xs text-muted-foreground">(Main)</span>
                          </div>
                          <div className="text-xs text-muted-foreground ml-5">
                            License: {reservation.license}
                          </div>
                        </div>

                        {/* Additional Players */}
                        {additionalPlayers.length > 0 && (
                          <div className="space-y-1">
                            {additionalPlayers.map((player: any, index: number) => (
                              <div key={index} className="text-sm">
                                <div className="flex items-center gap-2">
                                  <User className="h-3 w-3 text-muted-foreground" />
                                  <span className="font-medium">{player.name}</span>
                                </div>
                                <div className="text-xs text-muted-foreground ml-5">
                                  License: {player.license}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No reservations for this date</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReservationCalendar;
