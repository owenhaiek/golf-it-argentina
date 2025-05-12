import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, MapPin, Clock, Calendar, Info, Users, Star } from "lucide-react";
import { ReservationForm } from "@/components/course/ReservationForm";
import { CourseMap } from "@/components/course/CourseMap";
import { CourseReviews } from "@/components/course/CourseReviews";
import { CoursePhotos } from "@/components/course/CoursePhotos";
import { CourseHoleDetails } from "@/components/course/CourseHoleDetails";
import { CourseWeather } from "@/components/course/CourseWeather";
import { CourseLeaderboard } from "@/components/course/CourseLeaderboard";
import { CourseStats } from "@/components/course/CourseStats";
import { formatOpeningHours } from "@/lib/utils";
import { OpeningHours } from "@/lib/supabase";
import { format } from "date-fns";

const Course = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("info");

  // Fetch course data
  const { data: courseData, isLoading: courseLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('golf_courses')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error("Course fetch error:", error);
        throw error;
      }
      
      return data;
    },
    enabled: !!id,
  });

  // Fetch user's rounds at this course
  const { data: userRounds, isLoading: roundsLoading } = useQuery({
    queryKey: ['userRounds', id, user?.id],
    queryFn: async () => {
      if (!id || !user?.id) return [];
      
      const { data, error } = await supabase
        .from('rounds')
        .select('*')
        .eq('course_id', id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("User rounds fetch error:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!id && !!user?.id,
  });

  // Fetch all rounds at this course for leaderboard
  const { data: allRounds, isLoading: allRoundsLoading } = useQuery({
    queryKey: ['courseRounds', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('rounds')
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('course_id', id)
        .order('score', { ascending: true })
        .limit(10);
        
      if (error) {
        console.error("All rounds fetch error:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!id,
  });

  // Fetch course reviews
  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['courseReviews', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('course_reviews')
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('course_id', id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Reviews fetch error:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!id,
  });

  // Format opening hours
  const formattedHours = courseData?.opening_hours 
    ? formatOpeningHours(courseData.opening_hours as OpeningHours) 
    : [];

  // Calculate average rating
  const averageRating = reviews?.length 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  // Handle back button
  const handleBack = () => {
    navigate(-1);
  };

  // Set page title
  useEffect(() => {
    if (courseData?.name) {
      document.title = `${courseData.name} | Golf App`;
    }
    return () => {
      document.title = 'Golf App';
    };
  }, [courseData?.name]);

  const isLoading = courseLoading || roundsLoading || allRoundsLoading || reviewsLoading;

  return (
    <div className="pb-20">
      {/* Back button */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleBack} 
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("common", "back")}
      </Button>

      {/* Course header */}
      <div className="relative rounded-lg overflow-hidden mb-6">
        {courseData?.image_url ? (
          <div className="h-48 w-full">
            <img 
              src={courseData.image_url} 
              alt={courseData.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          </div>
        ) : (
          <div className="h-48 w-full bg-gradient-to-r from-primary/20 to-secondary/20" />
        )}
        
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <h1 className="text-2xl font-bold">{courseData?.name}</h1>
          {courseData?.city && (
            <div className="flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">
                {[courseData.address, courseData.city, courseData.state]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </div>
          )}
          {averageRating > 0 && (
            <div className="flex items-center mt-1">
              <Star className="h-4 w-4 mr-1 text-yellow-400 fill-yellow-400" />
              <span className="text-sm">{averageRating.toFixed(1)} ({reviews?.length} reviews)</span>
            </div>
          )}
        </div>
      </div>

      {/* Course tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="map">Map</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="book">Book</TabsTrigger>
        </TabsList>

        {/* Info tab */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Course Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Info className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium">{courseData?.type || "Standard"}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Holes</p>
                    <p className="font-medium">{courseData?.holes || 18}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Established</p>
                    <p className="font-medium">{courseData?.established_year || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Par</p>
                    <p className="font-medium">{courseData?.par || "72"}</p>
                  </div>
                </div>
              </div>

              {/* Opening hours */}
              {formattedHours.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Opening Hours</h3>
                  <div className="grid grid-cols-1 gap-1">
                    {formattedHours.map((day, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="font-medium">{day.day}</span>
                        <span>{day.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {courseData?.description && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">About</h3>
                  <p className="text-sm">{courseData.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hole details */}
          {courseData?.hole_pars && (
            <CourseHoleDetails 
              holePars={courseData.hole_pars} 
              holeDistances={courseData.hole_distances}
              holeHandicaps={courseData.hole_handicaps}
            />
          )}

          {/* Weather */}
          {courseData?.latitude && courseData?.longitude && (
            <CourseWeather 
              latitude={courseData.latitude} 
              longitude={courseData.longitude}
            />
          )}

          {/* Photos */}
          <CoursePhotos courseId={id} />

          {/* Reviews */}
          <CourseReviews 
            courseId={id} 
            reviews={reviews || []} 
            isLoading={reviewsLoading}
          />
        </TabsContent>

        {/* Map tab */}
        <TabsContent value="map">
          <CourseMap 
            latitude={courseData?.latitude} 
            longitude={courseData?.longitude}
            name={courseData?.name}
          />
        </TabsContent>

        {/* Stats tab */}
        <TabsContent value="stats" className="space-y-4">
          {/* Leaderboard */}
          <CourseLeaderboard 
            rounds={allRounds || []} 
            isLoading={allRoundsLoading}
            coursePar={courseData?.par}
          />
          
          {/* User stats */}
          {user && (
            <CourseStats 
              rounds={userRounds || []} 
              isLoading={roundsLoading}
              coursePar={courseData?.par}
            />
          )}
        </TabsContent>

        {/* Book tab */}
        <TabsContent value="book">
          <ReservationForm 
            courseId={courseData?.id} 
            courseName={courseData?.name}
            courseLocation={`${courseData?.city || ''}, ${courseData?.state || ''}`} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Course;
