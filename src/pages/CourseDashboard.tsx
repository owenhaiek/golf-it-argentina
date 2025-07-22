import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Globe, 
  Calendar, 
  Clock,
  TrendingUp,
  DollarSign,
  Users,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatOpeningHours, isCurrentlyOpen } from "@/utils/openingHours";
import { ReservationCalendar } from "@/components/course/ReservationCalendar";
import { ReservationManagement } from "@/components/course/ReservationManagement";

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
  user_id: string;
  course_id: string;
  course_name: string;
  course_location?: string;
  confirmed_at?: string;
  confirmed_by?: string;
  updated_at?: string;
}

const CourseDashboard = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      if (!courseId) throw new Error('Course ID is required');
      
      const { data, error } = await supabase
        .from('golf_courses')
        .select('*')
        .eq('id', courseId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });

  const { data: reservations = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ['course-reservations', courseId],
    queryFn: async () => {
      if (!courseId) return [];
      
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('course_id', courseId)
        .order('date', { ascending: true })
        .order('time', { ascending: true });
      
      if (error) throw error;
      return data as Reservation[] || [];
    },
    enabled: !!courseId,
  });

  const updateReservationMutation = useMutation({
    mutationFn: async ({ reservationId, status, notes }: { reservationId: string; status: string; notes?: string }) => {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };
      
      if (status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
        updateData.confirmed_by = user?.id;
      }
      
      if (notes !== undefined) {
        updateData.course_notes = notes;
      }

      const { data, error } = await supabase
        .from('reservations')
        .update(updateData)
        .eq('id', reservationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-reservations', courseId] });
      toast({
        title: "Success",
        description: "Reservation status updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating reservation:', error);
      toast({
        title: "Error",
        description: "Failed to update reservation status",
        variant: "destructive",
      });
    }
  });

  const handleReservationAction = (reservationId: string, action: string) => {
    updateReservationMutation.mutate({ reservationId, status: action });
  };

  const handleReservationClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setSelectedTab("reservations");
  };

  if (courseLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading course dashboard...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Course not found</div>
      </div>
    );
  }

  const currentTime = new Date();
  let openingHours;
  let isOpen = false;
  
  try {
    openingHours = course.opening_hours ? 
      (typeof course.opening_hours === 'string' ? 
        JSON.parse(course.opening_hours) : course.opening_hours) : null;
    isOpen = openingHours ? isCurrentlyOpen(openingHours) : false;
  } catch (error) {
    console.error('Error parsing opening hours:', error);
    openingHours = null;
  }

  const formattedHours = openingHours ? formatOpeningHours(openingHours) : null;

  const pendingReservations = reservations.filter(r => r.status === 'pending');
  const confirmedReservations = reservations.filter(r => r.status === 'confirmed');
  const cancelledReservations = reservations.filter(r => r.status === 'cancelled');

  // Calculate today's stats
  const today = new Date().toISOString().split('T')[0];
  const todayReservations = reservations.filter(r => r.date === today);
  const todayRevenue = todayReservations.filter(r => r.status === 'confirmed').length * 50; // Assume $50 per reservation

  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        {course.image_url && (
          <div className="h-48 relative overflow-hidden">
            <img
              src={course.image_url}
              alt={course.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-40" />
            <div className="absolute top-4 left-4 z-10">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(-1)}
                className="bg-white/90 hover:bg-white text-black"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        )}

        {!course.image_url && (
          <div className="h-32 bg-muted relative">
            <div className="absolute top-4 left-4 z-10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-6">
          <div className="relative -mt-20 z-10">
            <Card className="bg-background border-border shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl md:text-3xl text-foreground">{course.name}</CardTitle>
                    <CardDescription className="text-lg mt-2">
                      {course.city && course.state && (
                        <span className="flex items-center text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-1" />
                          {course.city}, {course.state}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={isOpen ? "default" : "secondary"}>
                      {isOpen ? "Open" : "Closed"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          <div className="mt-6">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="reservations">Reservations</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="flex items-center p-4">
                      <Clock className="h-8 w-8 text-yellow-500 mr-3" />
                      <div>
                        <p className="text-2xl font-bold text-foreground">{pendingReservations.length}</p>
                        <p className="text-sm text-muted-foreground">Pending</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="flex items-center p-4">
                      <Calendar className="h-8 w-8 text-green-500 mr-3" />
                      <div>
                        <p className="text-2xl font-bold text-foreground">{confirmedReservations.length}</p>
                        <p className="text-sm text-muted-foreground">Confirmed</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="flex items-center p-4">
                      <Users className="h-8 w-8 text-blue-500 mr-3" />
                      <div>
                        <p className="text-2xl font-bold text-foreground">{todayReservations.length}</p>
                        <p className="text-sm text-muted-foreground">Today</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="flex items-center p-4">
                      <DollarSign className="h-8 w-8 text-purple-500 mr-3" />
                      <div>
                        <p className="text-2xl font-bold text-foreground">${todayRevenue}</p>
                        <p className="text-sm text-muted-foreground">Today Revenue</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Reservation Calendar */}
                <ReservationCalendar 
                  reservations={reservations}
                  onReservationClick={handleReservationClick}
                />
              </TabsContent>

              <TabsContent value="reservations" className="space-y-6">
                <ReservationManagement
                  reservations={reservations}
                  onUpdateReservation={handleReservationAction}
                  isUpdating={updateReservationMutation.isPending}
                />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Monthly Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total Reservations</span>
                          <span className="font-medium">{reservations.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Confirmed</span>
                          <span className="font-medium text-green-600">{confirmedReservations.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Pending</span>
                          <span className="font-medium text-yellow-600">{pendingReservations.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Cancelled</span>
                          <span className="font-medium text-red-600">{cancelledReservations.length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Performance Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Confirmation Rate</span>
                          <span className="font-medium">
                            {reservations.length > 0 
                              ? Math.round((confirmedReservations.length / reservations.length) * 100)
                              : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Average Players</span>
                          <span className="font-medium">
                            {reservations.length > 0 
                              ? Math.round(reservations.reduce((acc, r) => acc + r.players, 0) / reservations.length)
                              : 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Monthly Revenue</span>
                          <span className="font-medium">${confirmedReservations.length * 50}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDashboard;
