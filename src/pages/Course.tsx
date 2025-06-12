
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Phone, Globe, Calendar, Trophy, Camera, Star, Users, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReservationForm from "@/components/course/ReservationForm";
import AddReviewForm from "@/components/course/AddReviewForm";
import CourseReviews from "@/components/course/CourseReviews";
import CoursePhotos from "@/components/course/CoursePhotos";
import { CourseHoleDetails } from "@/components/course/CourseHoleDetails";
import CourseStats from "@/components/course/CourseStats";
import CourseLeaderboard from "@/components/course/CourseLeaderboard";
import CourseWeather from "@/components/course/CourseWeather";
import CourseMap from "@/components/course/CourseMap";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { formatOpeningHours } from "@/utils/formatOpeningHours";
import { isCurrentlyOpen } from "@/utils/openingHours";

interface GolfCourse {
  id: string;
  name: string;
  city?: string;
  state?: string;
  par?: number;
  holes: number;
  description?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  phone?: string;
  website?: string;
  opening_hours?: any;
  hole_pars?: number[];
  hole_handicaps?: number[];
  image_gallery?: string;
  established_year?: number;
  type?: string;
}

const Course = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("overview");

  const { data: course, isLoading } = useQuery({
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

  const { data: reviews = [] } = useQuery({
    queryKey: ['course-reviews', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('course_reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('course_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading course details...</div>
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

  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        {course.image_url && (
          <div className="h-64 md:h-96 relative overflow-hidden">
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
            <div className="absolute top-4 right-4 z-10">
              <FavoriteButton courseId={course.id} />
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
            <div className="absolute top-4 right-4 z-10">
              <FavoriteButton courseId={course.id} />
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-6">
          <div className="relative -mt-20 md:-mt-32 z-10">
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
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center gap-2">
                      {averageRating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{averageRating.toFixed(1)}</span>
                          <span className="text-muted-foreground">({reviews.length})</span>
                        </div>
                      )}
                      <Badge variant={isOpen ? "default" : "secondary"} className="ml-2">
                        {isOpen ? "Open" : "Closed"}
                      </Badge>
                    </div>
                    
                    {user && (
                      <ReservationForm
                        courseId={course.id}
                        courseName={course.name}
                        courseLocation={`${course.city}, ${course.state}`}
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-foreground">{course.holes}</div>
                    <div className="text-sm text-muted-foreground">Holes</div>
                  </div>
                  {course.par && (
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-foreground">{course.par}</div>
                      <div className="text-sm text-muted-foreground">Par</div>
                    </div>
                  )}
                  {course.established_year && (
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-foreground">{course.established_year}</div>
                      <div className="text-sm text-muted-foreground">Established</div>
                    </div>
                  )}
                  {course.type && (
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-lg font-bold text-foreground">{course.type}</div>
                      <div className="text-sm text-muted-foreground">Type</div>
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>
          </div>

          <div className="mt-6">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-7 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="stats">Stats</TabsTrigger>
                <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                <TabsTrigger value="weather">Weather</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
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

                {course.latitude && course.longitude && (
                  <CourseMap latitude={course.latitude} longitude={course.longitude} name={course.name} />
                )}
              </TabsContent>

              <TabsContent value="details">
                <CourseHoleDetails
                  holePars={course.hole_pars}
                  holeHandicaps={course.hole_handicaps}
                />
              </TabsContent>

              <TabsContent value="stats">
                <CourseStats courseId={course.id} />
              </TabsContent>

              <TabsContent value="leaderboard">
                <CourseLeaderboard courseId={course.id} />
              </TabsContent>

              <TabsContent value="weather">
                <CourseWeather latitude={course.latitude} longitude={course.longitude} />
              </TabsContent>

              <TabsContent value="photos">
                <CoursePhotos course={course} />
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                {user && (
                  <AddReviewForm courseId={course.id} />
                )}
                <CourseReviews reviews={reviews} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Course;
