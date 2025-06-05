import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar, 
  Clock, 
  Users, 
  Phone,
  MapPin,
  LogOut,
  CheckCircle,
  XCircle,
  Loader2,
  User,
  CalendarDays,
  List,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import ReservationCalendar from "@/components/course/ReservationCalendar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  player_name: string;
  license: string;
  additional_players: string | null;
}

const CourseDashboard = () => {
  const [manager, setManager] = useState<CourseManager | null>(null);
  const [updatingReservation, setUpdatingReservation] = useState<string | null>(null);
  const [deletingReservation, setDeletingReservation] = useState<string | null>(null);
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

  const deleteReservation = async (reservationId: string) => {
    if (!manager) return;
    
    setDeletingReservation(reservationId);
    
    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', reservationId);

      if (error) throw error;

      toast({
        title: "Reservation Deleted",
        description: "Reservation has been permanently deleted",
      });

      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete reservation",
      });
    } finally {
      setDeletingReservation(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('courseManager');
    navigate('/course-manager-auth');
  };

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
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Mobile-optimized header */}
      <div className="bg-white shadow-sm border-b px-4 py-4 flex-shrink-0">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-3xl font-bold truncate">{manager.course_name}</h1>
            <p className="text-sm text-muted-foreground">Course Manager</p>
            <p className="text-xs text-muted-foreground">Welcome, {manager.name}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="ml-2">
            <LogOut className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Logout</span>
          </Button>
        </div>
      </div>

      {/* Main content area with proper scrolling */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 pb-2 flex-shrink-0">
          {/* Mobile-optimized stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Card className="text-center">
              <CardContent className="p-3">
                <div className="text-lg md:text-2xl font-bold">{todayReservations.length}</div>
                <div className="text-xs text-muted-foreground">Today</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-3">
                <div className="text-lg md:text-2xl font-bold">{upcomingReservations.length}</div>
                <div className="text-xs text-muted-foreground">Upcoming</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-3">
                <div className="text-lg md:text-2xl font-bold">
                  {reservations?.filter(res => res.status === 'pending').length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs with proper height handling */}
        <div className="flex-1 flex flex-col overflow-hidden px-4 pb-4">
          <Tabs defaultValue="calendar" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-2 mb-4 flex-shrink-0">
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span className="hidden sm:inline">Calendar View</span>
                <span className="sm:hidden">Calendar</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List View</span>
                <span className="sm:hidden">List</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="flex-1 overflow-hidden">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="h-full">
                  <ReservationCalendar reservations={reservations || []} />
                </div>
              )}
            </TabsContent>

            <TabsContent value="list" className="flex-1 overflow-hidden">
              {/* Mobile-optimized reservations list */}
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-4 flex-shrink-0">
                  <CardTitle className="text-lg">All Reservations</CardTitle>
                  <CardDescription className="text-sm">
                    Manage reservations for your course
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : reservations && reservations.length > 0 ? (
                    <ScrollArea className="h-full">
                      <div className="divide-y">
                        {reservations.map((reservation) => {
                          const additionalPlayers = parseAdditionalPlayers(reservation.additional_players);
                          return (
                            <div key={reservation.id} className="p-4 space-y-3">
                              {/* Date and time row */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  <span className="font-medium">
                                    {format(new Date(reservation.date), 'MMM d, yyyy')}
                                  </span>
                                  <Clock className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
                                  <span>{reservation.time}</span>
                                </div>
                                {getStatusBadge(reservation.status)}
                              </div>

                              {/* Players and location */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  <span>{reservation.players} player(s)</span>
                                </div>
                                
                                {/* Main player */}
                                <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium text-sm">{reservation.player_name}</span>
                                    <span className="text-xs text-muted-foreground">(Main)</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground ml-6">
                                    License: {reservation.license}
                                  </div>
                                </div>

                                {/* Additional players */}
                                {additionalPlayers.length > 0 && (
                                  <div className="space-y-2">
                                    {additionalPlayers.map((player: any, index: number) => (
                                      <div key={index} className="bg-gray-50 rounded-lg p-3 space-y-1">
                                        <div className="flex items-center gap-2">
                                          <User className="h-4 w-4 text-muted-foreground" />
                                          <span className="font-medium text-sm">{player.name}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground ml-6">
                                          License: {player.license}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {reservation.course_location && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <span className="text-muted-foreground truncate">
                                      {reservation.course_location}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Action buttons */}
                              <div className="flex gap-2 pt-2">
                                {reservation.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                                      disabled={updatingReservation === reservation.id}
                                      className="bg-green-600 hover:bg-green-700 flex-1"
                                    >
                                      {updatingReservation === reservation.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <>
                                          <CheckCircle className="h-4 w-4 mr-1" />
                                          <span className="text-xs">Confirm</span>
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                                      disabled={updatingReservation === reservation.id}
                                      className="flex-1"
                                    >
                                      {updatingReservation === reservation.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <>
                                          <XCircle className="h-4 w-4 mr-1" />
                                          <span className="text-xs">Cancel</span>
                                        </>
                                      )}
                                    </Button>
                                  </>
                                )}
                                
                                {/* Delete button for all reservations */}
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={deletingReservation === reservation.id}
                                      className="border-red-200 text-red-600 hover:bg-red-50"
                                    >
                                      {deletingReservation === reservation.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-white">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Reservation</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to permanently delete this reservation? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => deleteReservation(reservation.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                              
                              {/* Notes */}
                              {reservation.course_notes && (
                                <div className="p-2 bg-blue-50 rounded text-sm">
                                  <strong>Notes:</strong> {reservation.course_notes}
                                </div>
                              )}
                              
                              {/* Booking info */}
                              <div className="text-xs text-muted-foreground pt-1 border-t">
                                Booked {format(new Date(reservation.created_at), 'MMM d, yyyy')}
                                {reservation.confirmed_at && (
                                  <span> • Confirmed {format(new Date(reservation.confirmed_at), 'MMM d')}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground px-4">
                      <div className="text-sm">No reservations found for your course yet.</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CourseDashboard;
