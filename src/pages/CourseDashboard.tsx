
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  Calendar, 
  Clock, 
  Users, 
  Phone,
  MapPin,
  LogOut,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { format } from "date-fns";

interface CourseManager {
  manager_id: string;
  course_id: string;
  name: string;
  email: string;
  course_name: string;
}

interface Reservation {
  id: string;
  user_id: string;
  course_name: string;
  course_location: string | null;
  date: string;
  time: string;
  players: number;
  status: string;
  course_notes: string | null;
  created_at: string;
  confirmed_at: string | null;
  confirmed_by: string | null;
}

const CourseDashboard = () => {
  const [manager, setManager] = useState<CourseManager | null>(null);
  const [updatingReservation, setUpdatingReservation] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const managerData = localStorage.getItem('courseManager');
    if (!managerData) {
      navigate('/course-manager-auth');
      return;
    }
    setManager(JSON.parse(managerData));
  }, [navigate]);

  const { data: reservations, isLoading, refetch } = useQuery({
    queryKey: ['courseReservations', manager?.course_id],
    queryFn: async () => {
      if (!manager?.course_id) return [];
      
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('course_id', manager.course_id)
        .order('date', { ascending: true })
        .order('time', { ascending: true });
      
      if (error) {
        console.error("Reservations fetch error:", error);
        throw error;
      }
      return data || [];
    },
    enabled: !!manager?.course_id
  });

  const updateReservationStatus = async (reservationId: string, status: 'confirmed' | 'cancelled') => {
    if (!manager) return;
    
    setUpdatingReservation(reservationId);
    
    try {
      const updateData: any = {
        status,
        confirmed_by: manager.manager_id,
        confirmed_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('reservations')
        .update(updateData)
        .eq('id', reservationId);

      if (error) throw error;

      toast({
        title: "Reservation Updated",
        description: `Reservation has been ${status}`,
      });

      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || `Failed to ${status} reservation`,
      });
    } finally {
      setUpdatingReservation(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('courseManager');
    navigate('/course-manager-auth');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const todayReservations = reservations?.filter(res => 
    res.date === format(new Date(), 'yyyy-MM-dd')
  ) || [];

  const upcomingReservations = reservations?.filter(res => 
    new Date(res.date) > new Date() && res.status !== 'cancelled'
  ) || [];

  if (!manager) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{manager.course_name}</h1>
          <p className="text-muted-foreground">Course Manager Dashboard</p>
          <p className="text-sm text-muted-foreground">Welcome back, {manager.name}</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Reservations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayReservations.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Reservations</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingReservations.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reservations?.filter(res => res.status === 'pending').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reservations List */}
      <Card>
        <CardHeader>
          <CardTitle>All Reservations</CardTitle>
          <CardDescription>
            Manage and track all reservations for your course
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : reservations && reservations.length > 0 ? (
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <div key={reservation.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(new Date(reservation.date), 'EEEE, MMMM d, yyyy')}
                        </span>
                        <Clock className="h-4 w-4 text-muted-foreground ml-4" />
                        <span>{reservation.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{reservation.players} player(s)</span>
                      </div>
                      {reservation.course_location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {reservation.course_location}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(reservation.status)}
                    </div>
                  </div>
                  
                  {reservation.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                        disabled={updatingReservation === reservation.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {updatingReservation === reservation.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                        disabled={updatingReservation === reservation.id}
                      >
                        {updatingReservation === reservation.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        Cancel
                      </Button>
                    </div>
                  )}
                  
                  {reservation.course_notes && (
                    <div className="mt-3 p-2 bg-muted rounded text-sm">
                      <strong>Notes:</strong> {reservation.course_notes}
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground mt-2">
                    Booked on {format(new Date(reservation.created_at), 'MMM d, yyyy')}
                    {reservation.confirmed_at && (
                      <span> • Confirmed on {format(new Date(reservation.confirmed_at), 'MMM d, yyyy')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No reservations found for your course yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseDashboard;
