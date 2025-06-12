
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Trophy, 
  Camera, 
  Star, 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatOpeningHours } from "@/utils/formatOpeningHours";
import { isCurrentlyOpen } from "@/utils/openingHours";

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

const CourseDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("reservations");

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      if (!id) throw new Error('Course ID is required');
      
      const { data, error } = await supabase
        .from('golf_courses')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: reservations = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ['course-reservations', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('course_id', id)
        .order('date', { ascending: true })
        .order('time', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
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
      queryClient.invalidateQueries({ queryKey: ['course-reservations', id] });
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

  if (courseLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading course dashboard...</div>
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

  const pendingReservations = reservations.filter(r => r.status === 'pending');
  const confirmedReservations = reservations.filter(r => r.status === 'confirmed');
  const cancelledReservations = reservations.filter(r => r.status === 'cancelled');

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

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{pendingReservations.length}</div>
                    <div className="text-sm text-blue-600">Pending</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{confirmedReservations.length}</div>
                    <div className="text-sm text-green-600">Confirmed</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{cancelledReservations.length}</div>
                    <div className="text-sm text-red-600">Cancelled</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">{reservations.length}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          <div className="mt-6">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="reservations">Reservations</TabsTrigger>
                <TabsTrigger value="info">Course Info</TabsTrigger>
              </TabsList>

              <TabsContent value="reservations" className="space-y-6">
                <div className="space-y-4">
                  {reservationsLoading ? (
                    <div className="text-center py-8">
                      <div className="text-lg">Loading reservations...</div>
                    </div>
                  ) : reservations.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground mb-2">No reservations yet</h3>
                        <p className="text-sm text-muted-foreground">
                          Reservations will appear here when customers book tee times.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    reservations.map((reservation) => (
                      <Card key={reservation.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(reservation.status)}
                              <div>
                                <CardTitle className="text-lg">
                                  {reservation.player_name || 'Unknown Player'}
                                </CardTitle>
                                <CardDescription>
                                  License: {reservation.license || 'N/A'}
                                </CardDescription>
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
                              <div className="text-sm text-muted-foreground">{reservation.players}</div>
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
                                onClick={() => handleReservationAction(reservation.id, 'confirmed')}
                                disabled={updateReservationMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReservationAction(reservation.id, 'cancelled')}
                                disabled={updateReservationMutation.isPending}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="info" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        {course.description || "A beautiful golf course with challenging holes and stunning views."}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Course Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {course.address && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm">{course.address}</span>
                        </div>
                      )}
                      {course.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm">{course.phone}</span>
                        </div>
                      )}
                      {course.website && (
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                          <a 
                            href={course.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                      {formattedHours && (
                        <div className="flex items-start">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                          <div className="text-sm">
                            <div className="font-medium mb-1">Opening Hours:</div>
                            <div className="space-y-0.5">
                              {formattedHours.map((day, index) => (
                                <div key={index} className="flex justify-between">
                                  <span>{day.day}:</span>
                                  <span className="text-muted-foreground">{day.hours}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
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
