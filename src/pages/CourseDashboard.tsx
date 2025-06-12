
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Clock, MapPin, Phone, Globe, Star, Users, Calendar, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface Reservation {
  id: string;
  player_name: string;
  date: string;
  time: string;
  players: number;
  status: string;
  created_at: string;
  course_notes?: string;
  license?: string;
  additional_players?: any;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles?: {
    full_name?: string;
    username?: string;
  };
}

interface Course {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  website?: string;
  image_url?: string;
  holes: number;
  par?: number;
  opening_hours?: any;
  type?: string;
  established_year?: number;
  latitude?: number;
  longitude?: number;
  hole_pars?: number[];
  hole_handicaps?: number[];
}

const CourseDashboard = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
      fetchReservations();
      fetchReviews();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const { data, error } = await supabase
        .from('golf_courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) throw error;
      setCourse(data);
    } catch (error) {
      console.error('Error fetching course:', error);
      toast({
        title: "Error",
        description: "Error al cargar los datos del campo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('course_id', courseId)
        .order('date', { ascending: false })
        .order('time', { ascending: true });

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('course_reviews')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleReservationStatusUpdate = async (reservationId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('reservations')
        .update(updateData)
        .eq('id', reservationId);

      if (error) throw error;

      await fetchReservations();
      toast({
        title: "Éxito",
        description: `Reserva ${newStatus === 'confirmed' ? 'confirmada' : 'rechazada'} exitosamente`,
      });
    } catch (error) {
      console.error('Error updating reservation:', error);
      toast({
        title: "Error",
        description: "Error al actualizar la reserva",
        variant: "destructive",
      });
    }
  };

  const formatOpeningHours = (openingHours: any) => {
    if (!openingHours) return "No disponible";
    
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    
    try {
      let hoursArray = openingHours;
      if (typeof openingHours === 'string') {
        hoursArray = JSON.parse(openingHours);
      }
      
      if (Array.isArray(hoursArray)) {
        return hoursArray.map((day: any, index: number) => (
          <div key={index} className="text-sm">
            <span className="font-medium">{days[index]}:</span>{' '}
            {day.isOpen ? `${day.open} - ${day.close}` : 'Cerrado'}
          </div>
        ));
      }
    } catch (error) {
      console.error('Error parsing opening hours:', error);
    }
    
    return "Error al cargar horarios";
  };

  const renderReservationCard = (reservation: Reservation) => (
    <Card key={reservation.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold">{reservation.player_name}</h3>
            <p className="text-sm text-muted-foreground">
              {format(new Date(reservation.date), "PPP")} a las {reservation.time}
            </p>
            <p className="text-sm">{reservation.players} jugador{reservation.players > 1 ? 'es' : ''}</p>
          </div>
          <Badge variant={
            reservation.status === 'confirmed' ? 'default' :
            reservation.status === 'rejected' ? 'destructive' : 'secondary'
          }>
            {reservation.status === 'confirmed' ? 'Confirmada' :
             reservation.status === 'rejected' ? 'Rechazada' : 'Pendiente'}
          </Badge>
        </div>
        
        {reservation.course_notes && (
          <div className="mb-3">
            <p className="text-sm"><strong>Notas:</strong> {reservation.course_notes}</p>
          </div>
        )}
        
        {reservation.license && (
          <div className="mb-3">
            <p className="text-sm"><strong>Licencia:</strong> {reservation.license}</p>
          </div>
        )}
        
        {reservation.additional_players && (
          <div className="mb-3">
            <p className="text-sm"><strong>Jugadores adicionales:</strong></p>
            <div className="text-sm text-muted-foreground">
              {typeof reservation.additional_players === 'string' 
                ? reservation.additional_players 
                : JSON.stringify(reservation.additional_players)}
            </div>
          </div>
        )}
        
        {reservation.status === 'pending' && (
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              onClick={() => handleReservationStatusUpdate(reservation.id, 'confirmed')}
              className="flex items-center gap-1"
            >
              <CheckCircle size={16} />
              Confirmar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleReservationStatusUpdate(reservation.id, 'rejected')}
              className="flex items-center gap-1"
            >
              <XCircle size={16} />
              Rechazar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Campo no encontrado</div>
      </div>
    );
  }

  const pendingReservations = reservations.filter(r => r.status === 'pending');
  const confirmedReservations = reservations.filter(r => r.status === 'confirmed');
  const averageRating = reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">{course.name}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{pendingReservations.length}</div>
              <div className="text-sm text-muted-foreground">Reservas Pendientes</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{confirmedReservations.length}</div>
              <div className="text-sm text-muted-foreground">Reservas Confirmadas</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Calificación Promedio</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{reviews.length}</div>
              <div className="text-sm text-muted-foreground">Reseñas Totales</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="reservations">Reservas</TabsTrigger>
            <TabsTrigger value="reviews">Reseñas</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información del Campo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{course.address}, {course.city}, {course.state}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{course.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{course.website}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Hoyos:</strong> {course.holes}</p>
                    <p><strong>Par:</strong> {course.par}</p>
                    <p><strong>Tipo:</strong> {course.type}</p>
                    {course.established_year && (
                      <p><strong>Año de fundación:</strong> {course.established_year}</p>
                    )}
                  </div>
                </div>
                {course.description && (
                  <div>
                    <h4 className="font-medium mb-2">Descripción</h4>
                    <p className="text-sm text-muted-foreground">{course.description}</p>
                  </div>
                )}
                {course.opening_hours && (
                  <div>
                    <h4 className="font-medium mb-2">Horarios de Apertura</h4>
                    <div className="text-sm">
                      {formatOpeningHours(course.opening_hours)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reservations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Reservas Pendientes ({pendingReservations.length})</h3>
                {pendingReservations.length > 0 ? (
                  pendingReservations.map(renderReservationCard)
                ) : (
                  <p className="text-muted-foreground">No hay reservas pendientes</p>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Reservas Confirmadas ({confirmedReservations.length})</h3>
                {confirmedReservations.length > 0 ? (
                  confirmedReservations.map(renderReservationCard)
                ) : (
                  <p className="text-muted-foreground">No hay reservas confirmadas</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reseñas ({reviews.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Usuario anónimo</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(review.created_at), "PPP")}
                          </span>
                        </div>
                        <p className="text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No hay reseñas disponibles</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Campo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  La configuración avanzada del campo estará disponible próximamente.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CourseDashboard;
