
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Clock, Users } from 'lucide-react';

interface Reservation {
  id: string;
  date: string;
  time: string;
  players: number;
  player_name: string;
  status: string;
  profiles?: {
    full_name: string;
  };
}

interface ReservationCalendarProps {
  reservations: Reservation[];
  onReservationClick?: (reservation: Reservation) => void;
}

export const ReservationCalendar = ({ reservations, onReservationClick }: ReservationCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getReservationsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return reservations.filter(reservation => reservation.date === dateStr);
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Reservation Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[140px] text-center">{monthName}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before the first day of the month */}
          {Array.from({ length: firstDayOfMonth }, (_, i) => (
            <div key={`empty-${i}`} className="p-2 h-24"></div>
          ))}
          
          {/* Days of the month */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dayReservations = getReservationsForDate(day);
            const today = new Date();
            const isToday = 
              currentDate.getFullYear() === today.getFullYear() &&
              currentDate.getMonth() === today.getMonth() &&
              day === today.getDate();

            return (
              <div
                key={day}
                className={`p-2 h-24 border border-border rounded-md ${
                  isToday ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                } transition-colors`}
              >
                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
                  {day}
                </div>
                
                <div className="space-y-1 overflow-hidden">
                  {dayReservations.slice(0, 2).map(reservation => (
                    <div
                      key={reservation.id}
                      className={`text-xs px-1 py-0.5 rounded cursor-pointer hover:opacity-80 ${getStatusColor(reservation.status)}`}
                      onClick={() => onReservationClick?.(reservation)}
                      title={`${reservation.time} - ${reservation.player_name} (${reservation.players} players)`}
                    >
                      <div className="flex items-center gap-1 truncate">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span>{reservation.time}</span>
                      </div>
                    </div>
                  ))}
                  
                  {dayReservations.length > 2 && (
                    <div className="text-xs text-muted-foreground px-1">
                      +{dayReservations.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t">
          <span className="text-sm text-muted-foreground">Status:</span>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
            <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
            <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
