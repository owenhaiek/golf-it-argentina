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
  Calendar, 
  Clock,
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  Target,
  Trophy,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatOpeningHours, isCurrentlyOpen } from "@/utils/openingHours";
import { ReservationCalendar } from "@/components/course/ReservationCalendar";
import { ReservationManagement } from "@/components/course/ReservationManagement";
import { motion, AnimatePresence } from "framer-motion";

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

interface Round {
  id: string;
  score: number;
  date: string;
  user_id: string;
  course_id: string;
  notes?: string;
  hole_scores?: number[];
  profiles?: {
    full_name?: string;
    username?: string;
  };
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

  // Fetch rounds for this course
  const { data: rounds = [] } = useQuery({
    queryKey: ['course-rounds-stats', courseId],
    queryFn: async () => {
      if (!courseId) return [];
      
      const { data, error } = await supabase
        .from('rounds')
        .select(`
          *,
          profiles:user_id (
            full_name,
            username
          )
        `)
        .eq('course_id', courseId)
        .order('score', { ascending: true });
      
      if (error) throw error;
      return data as Round[] || [];
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

  const updateCourseStatusMutation = useMutation({
    mutationFn: async (isOpen: boolean) => {
      if (!courseId) throw new Error('Course ID required');
      
      const { data, error } = await supabase
        .from('golf_courses')
        .update({ is_open: isOpen, updated_at: new Date().toISOString() })
        .eq('id', courseId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['golf-courses'] });
      toast({
        title: data.is_open ? "Campo Abierto" : "Campo Cerrado",
        description: `El estado del campo ha sido actualizado`,
      });
    },
    onError: (error) => {
      console.error('Error updating course status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del campo",
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

  const handleToggleCourseStatus = () => {
    const newStatus = !course?.is_open;
    updateCourseStatusMutation.mutate(newStatus);
  };

  if (courseLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-lg text-foreground">Campo no encontrado</div>
      </div>
    );
  }

  const courseIsOpen = course.is_open !== false;

  const pendingReservations = reservations.filter(r => r.status === 'pending');
  const confirmedReservations = reservations.filter(r => r.status === 'confirmed');
  const cancelledReservations = reservations.filter(r => r.status === 'cancelled');

  // Calculate today's stats
  const today = new Date().toISOString().split('T')[0];
  const todayReservations = reservations.filter(r => r.date === today);
  const todayRevenue = todayReservations.filter(r => r.status === 'confirmed').length * 50;

  // Calculate rounds stats
  const totalRounds = rounds.length;
  const uniqueUsers = new Set(rounds.map(r => r.user_id)).size;
  const bestRound = rounds.length > 0 ? rounds[0] : null;
  const coursePar = course.par || 72;
  const averageScore = totalRounds > 0 
    ? Math.round(rounds.reduce((acc, r) => acc + r.score, 0) / totalRounds) 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        {/* Header with image */}
        {course.image_url && (
          <div className="h-56 relative overflow-hidden">
            <img
              src={course.image_url}
              alt={course.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute top-4 left-4 z-10">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(-1)}
                className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
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
                className="rounded-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Course Header Card */}
          <div className="relative -mt-24 z-10 mb-6">
            <Card className="bg-card/95 backdrop-blur-sm border-border shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl md:text-3xl text-foreground font-bold">{course.name}</CardTitle>
                    <CardDescription className="text-base mt-2">
                      {course.city && course.state && (
                        <span className="flex items-center text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-1" />
                          {course.city}, {course.state}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  
                  {/* Large Status Toggle Button */}
                  <motion.button
                    onClick={handleToggleCourseStatus}
                    disabled={updateCourseStatusMutation.isPending}
                    className={`
                      relative w-full py-5 px-6 rounded-2xl font-bold text-xl
                      transition-all duration-300 ease-out
                      flex items-center justify-center gap-3
                      ${courseIsOpen 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50' 
                        : 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50'
                      }
                      ${updateCourseStatusMutation.isPending ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}
                    `}
                    whileTap={{ scale: 0.98 }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={courseIsOpen ? 'open' : 'closed'}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-3"
                      >
                        <div className={`w-4 h-4 rounded-full ${courseIsOpen ? 'bg-white animate-pulse' : 'bg-white/80'}`} />
                        <span>{courseIsOpen ? 'CAMPO ABIERTO' : 'CAMPO CERRADO'}</span>
                      </motion.div>
                    </AnimatePresence>
                    {updateCourseStatusMutation.isPending && (
                      <div className="absolute right-4 animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    )}
                  </motion.button>
                  <p className="text-center text-sm text-muted-foreground -mt-2">
                    Toca para cambiar el estado del campo
                  </p>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Tabs */}
          <div className="mt-6">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 h-12 rounded-xl bg-muted/50 p-1">
                <TabsTrigger 
                  value="overview" 
                  className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium"
                >
                  Resumen
                </TabsTrigger>
                <TabsTrigger 
                  value="reservations"
                  className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium"
                >
                  Reservas
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics"
                  className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium"
                >
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Quick Stats - Reservations */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="rounded-xl border-border/50">
                    <CardContent className="flex items-center p-4">
                      <div className="p-2 rounded-xl bg-yellow-500/10 mr-3">
                        <Clock className="h-6 w-6 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{pendingReservations.length}</p>
                        <p className="text-xs text-muted-foreground">Pendientes</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-xl border-border/50">
                    <CardContent className="flex items-center p-4">
                      <div className="p-2 rounded-xl bg-green-500/10 mr-3">
                        <Calendar className="h-6 w-6 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{confirmedReservations.length}</p>
                        <p className="text-xs text-muted-foreground">Confirmadas</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-xl border-border/50">
                    <CardContent className="flex items-center p-4">
                      <div className="p-2 rounded-xl bg-blue-500/10 mr-3">
                        <Users className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{todayReservations.length}</p>
                        <p className="text-xs text-muted-foreground">Hoy</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-xl border-border/50">
                    <CardContent className="flex items-center p-4">
                      <div className="p-2 rounded-xl bg-purple-500/10 mr-3">
                        <DollarSign className="h-6 w-6 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">${todayRevenue}</p>
                        <p className="text-xs text-muted-foreground">Ingresos Hoy</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Rounds Stats */}
                <Card className="rounded-xl border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Estadísticas de Rondas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 rounded-xl bg-muted/50">
                        <Target className="h-5 w-5 mx-auto text-primary mb-1" />
                        <p className="text-2xl font-bold text-foreground">{totalRounds}</p>
                        <p className="text-xs text-muted-foreground">Total Rondas</p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-muted/50">
                        <Users className="h-5 w-5 mx-auto text-primary mb-1" />
                        <p className="text-2xl font-bold text-foreground">{uniqueUsers}</p>
                        <p className="text-xs text-muted-foreground">Jugadores</p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-muted/50">
                        <Trophy className="h-5 w-5 mx-auto text-amber-500 mb-1" />
                        <p className="text-2xl font-bold text-foreground">
                          {bestRound ? bestRound.score : '-'}
                        </p>
                        <p className="text-xs text-muted-foreground">Mejor Score</p>
                      </div>
                    </div>
                    
                    {bestRound && (
                      <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-amber-500" />
                            <span className="text-sm font-medium text-foreground">Mejor Ronda</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-foreground">{bestRound.score}</span>
                            <span className="text-sm text-muted-foreground ml-1">
                              ({bestRound.score - coursePar >= 0 ? '+' : ''}{bestRound.score - coursePar})
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Por {bestRound.profiles?.full_name || bestRound.profiles?.username || 'Jugador'} • {new Date(bestRound.date).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

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
                {/* Rounds Statistics */}
                <Card className="rounded-xl border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Estadísticas de Rondas Jugadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-5 w-5 text-primary" />
                          <span className="text-sm font-medium text-muted-foreground">Total Rondas</span>
                        </div>
                        <p className="text-3xl font-bold text-foreground">{totalRounds}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-5 w-5 text-blue-500" />
                          <span className="text-sm font-medium text-muted-foreground">Jugadores Únicos</span>
                        </div>
                        <p className="text-3xl font-bold text-foreground">{uniqueUsers}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Trophy className="h-5 w-5 text-amber-500" />
                          <span className="text-sm font-medium text-muted-foreground">Mejor Score</span>
                        </div>
                        <p className="text-3xl font-bold text-foreground">
                          {bestRound ? bestRound.score : '-'}
                          {bestRound && (
                            <span className="text-lg text-muted-foreground ml-1">
                              ({bestRound.score - coursePar >= 0 ? '+' : ''}{bestRound.score - coursePar})
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                          <span className="text-sm font-medium text-muted-foreground">Promedio Score</span>
                        </div>
                        <p className="text-3xl font-bold text-foreground">
                          {averageScore || '-'}
                          {averageScore > 0 && (
                            <span className="text-lg text-muted-foreground ml-1">
                              ({averageScore - coursePar >= 0 ? '+' : ''}{averageScore - coursePar})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {bestRound && (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 border border-amber-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-amber-500" />
                            <span className="font-semibold text-foreground">Récord del Campo</span>
                          </div>
                          <Badge variant="secondary" className="bg-amber-500/20 text-amber-600">
                            {bestRound.score} golpes
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Jugado por <span className="font-medium text-foreground">{bestRound.profiles?.full_name || bestRound.profiles?.username || 'Jugador'}</span> el {new Date(bestRound.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="rounded-xl border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Resumen de Reservas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                          <span className="text-sm text-muted-foreground">Total Reservas</span>
                          <span className="font-bold text-foreground">{reservations.length}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-green-500/10">
                          <span className="text-sm text-muted-foreground">Confirmadas</span>
                          <span className="font-bold text-green-600">{confirmedReservations.length}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-yellow-500/10">
                          <span className="text-sm text-muted-foreground">Pendientes</span>
                          <span className="font-bold text-yellow-600">{pendingReservations.length}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-red-500/10">
                          <span className="text-sm text-muted-foreground">Canceladas</span>
                          <span className="font-bold text-red-600">{cancelledReservations.length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-xl border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Métricas de Rendimiento
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                          <span className="text-sm text-muted-foreground">Tasa de Confirmación</span>
                          <span className="font-bold text-foreground">
                            {reservations.length > 0 
                              ? Math.round((confirmedReservations.length / reservations.length) * 100)
                              : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                          <span className="text-sm text-muted-foreground">Promedio Jugadores</span>
                          <span className="font-bold text-foreground">
                            {reservations.length > 0 
                              ? Math.round(reservations.reduce((acc, r) => acc + r.players, 0) / reservations.length)
                              : 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                          <span className="text-sm text-muted-foreground">Ingresos Mensuales</span>
                          <span className="font-bold text-foreground">${confirmedReservations.length * 50}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                          <span className="text-sm text-muted-foreground">Rondas por Jugador</span>
                          <span className="font-bold text-foreground">
                            {uniqueUsers > 0 ? (totalRounds / uniqueUsers).toFixed(1) : 0}
                          </span>
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