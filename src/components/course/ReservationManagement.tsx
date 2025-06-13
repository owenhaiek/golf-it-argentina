
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Calendar,
  Users,
  Phone,
  Mail,
  AlertCircle
} from 'lucide-react';

interface Reservation {
  id: string;
  date: string;
  time: string;
  players: number;
  player_name: string;
  license: string;
  status: string;
  created_at: string;
  additional_players?: any;
  course_notes?: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface ReservationManagementProps {
  reservations: Reservation[];
  onUpdateReservation: (reservationId: string, status: string) => void;
  isUpdating: boolean;
}

export const ReservationManagement = ({ 
  reservations, 
  onUpdateReservation, 
  isUpdating 
}: ReservationManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const filterReservations = (reservations: Reservation[]) => {
    return reservations.filter(reservation => {
      const matchesSearch = 
        reservation.player_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.license.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
      
      const matchesDate = (() => {
        if (dateFilter === 'all') return true;
        
        const reservationDate = new Date(reservation.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        switch (dateFilter) {
          case 'today':
            const todayStr = today.toISOString().split('T')[0];
            return reservation.date === todayStr;
          case 'upcoming':
            return reservationDate >= today;
          case 'past':
            return reservationDate < today;
          default:
            return true;
        }
      })();
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingReservations = filterReservations(reservations.filter(r => r.status === 'pending'));
  const confirmedReservations = filterReservations(reservations.filter(r => r.status === 'confirmed'));
  const cancelledReservations = filterReservations(reservations.filter(r => r.status === 'cancelled'));
  const allFiltered = filterReservations(reservations);

  const ReservationCard = ({ reservation }: { reservation: Reservation }) => (
    <Card key={reservation.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon(reservation.status)}
            <div>
              <CardTitle className="text-lg">
                {reservation.player_name || 'Unknown Player'}
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                License: {reservation.license || 'N/A'}
              </div>
            </div>
          </div>
          {getStatusBadge(reservation.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-sm font-medium text-foreground">Date & Time</div>
            <div className="text-sm text-muted-foreground">
              {new Date(reservation.date).toLocaleDateString()} at {reservation.time}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">Players</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" />
              {reservation.players}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">Created</div>
            <div className="text-sm text-muted-foreground">
              {new Date(reservation.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        {reservation.additional_players && (
          <div className="mb-4">
            <div className="text-sm font-medium text-foreground mb-2">Additional Players</div>
            <div className="text-sm text-muted-foreground">
              {typeof reservation.additional_players === 'string' 
                ? reservation.additional_players 
                : JSON.stringify(reservation.additional_players)}
            </div>
          </div>
        )}

        {reservation.course_notes && (
          <div className="mb-4">
            <div className="text-sm font-medium text-foreground mb-2">Course Notes</div>
            <div className="text-sm text-muted-foreground">{reservation.course_notes}</div>
          </div>
        )}

        {reservation.status === 'pending' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onUpdateReservation(reservation.id, 'confirmed')}
              disabled={isUpdating}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Confirm
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onUpdateReservation(reservation.id, 'cancelled')}
              disabled={isUpdating}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by player name or license..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reservations Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({allFiltered.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingReservations.length})</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed ({confirmedReservations.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledReservations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {allFiltered.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No reservations found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filter criteria.
                </p>
              </CardContent>
            </Card>
          ) : (
            allFiltered.map(reservation => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingReservations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No pending reservations</h3>
                <p className="text-sm text-muted-foreground">
                  All reservations have been processed.
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingReservations.map(reservation => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))
          )}
        </TabsContent>

        <TabsContent value="confirmed" className="space-y-4">
          {confirmedReservations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No confirmed reservations</h3>
                <p className="text-sm text-muted-foreground">
                  Confirmed reservations will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            confirmedReservations.map(reservation => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelledReservations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No cancelled reservations</h3>
                <p className="text-sm text-muted-foreground">
                  Cancelled reservations will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            cancelledReservations.map(reservation => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
