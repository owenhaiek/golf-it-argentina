
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Flag, Clock, Star, Users, Camera } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { isCurrentlyOpen, formatOpeningHours } from "@/utils/openingHours";
import CoursePhotos from "@/components/course/CoursePhotos";
import CourseMap from "@/components/course/CourseMap";
import CourseHoleDetails from "@/components/course/CourseHoleDetails";
import CourseReviews from "@/components/course/CourseReviews";
import CourseStats from "@/components/course/CourseStats";
import CourseWeather from "@/components/course/CourseWeather";
import CourseLeaderboard from "@/components/course/CourseLeaderboard";
import ReservationForm from "@/components/course/ReservationForm";
import GolfAnimationLoader from "@/components/ui/GolfAnimationLoader";

const Course = () => {
  const { id } = useParams();
  const { t } = useLanguage();

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('golf_courses')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch user's rounds for this course
  const { data: userRounds = [], isLoading: roundsLoading } = useQuery({
    queryKey: ['user-rounds', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rounds')
        .select('*')
        .eq('course_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch course reviews
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['course-reviews', id],
    queryFn: async () => {
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
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch leaderboard rounds
  const { data: leaderboardRounds = [], isLoading: leaderboardLoading } = useQuery({
    queryKey: ['course-leaderboard', id],
    queryFn: async () => {
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
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <GolfAnimationLoader />;
  }

  if (!course) {
    return (
      <div className="px-4 md:px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t("course", "notFound")}</h1>
        </div>
      </div>
    );
  }

  // Parse opening_hours if it's a string
  const parseOpeningHours = () => {
    try {
      if (typeof course.opening_hours === 'string') {
        return JSON.parse(course.opening_hours);
      }
      return course.opening_hours;
    } catch (error) {
      console.error("Error parsing opening hours:", error);
      return null;
    }
  };

  const openingHoursData = parseOpeningHours();
  const isOpen = isCurrentlyOpen(openingHoursData);
  const formattedHours = formatOpeningHours(openingHoursData);

  // Helper function to get all images for a course
  const getCourseImages = (course: any): string[] => {
    const images: string[] = [];
    
    if (course.image_url) {
      images.push(course.image_url);
    }
    
    if (course.image_gallery) {
      const galleryImages = course.image_gallery.split(',').map((url: string) => url.trim()).filter((url: string) => url !== '');
      images.push(...galleryImages);
    }
    
    return images.length > 0 ? images : [];
  };

  const courseImages = getCourseImages(course);

  return (
    <div className="px-4 md:px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto">
      <div className="space-y-6 py-4">
        {/* Course Header */}
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold">{course.name}</h1>
            {course.description && (
              <p className="text-lg text-muted-foreground">{course.description}</p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm">
            {course.address && (
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>{[course.address, course.city, course.state].filter(Boolean).join(', ')}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-primary">
              <Flag size={16} />
              <span>{course.holes} {t("profile", "holes")}</span>
              {course.par && <span>• {t("course", "par")} {course.par}</span>}
            </div>
            
            <div className="flex items-center gap-2">
              <Clock size={16} className={isOpen ? "text-green-600" : "text-amber-600"} />
              <div>
                <span className={isOpen ? "text-green-600 font-medium" : "text-amber-600"}>
                  {isOpen ? t("home", "openNow") : t("home", "closed")}
                </span>
                <span className="text-muted-foreground ml-1">
                  • {formattedHours}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">{t("course", "overview")}</TabsTrigger>
            <TabsTrigger value="photos">
              <Camera size={16} className="mr-1" />
              {t("course", "photos")}
            </TabsTrigger>
            <TabsTrigger value="holes">{t("course", "holes")}</TabsTrigger>
            <TabsTrigger value="reviews">{t("course", "reviews")}</TabsTrigger>
            <TabsTrigger value="leaderboard">{t("course", "leaderboard")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <CourseStats rounds={userRounds} isLoading={roundsLoading} coursePar={course.par} />
              <CourseWeather latitude={course.latitude} longitude={course.longitude} />
            </div>
            <CourseMap />
            <ReservationForm 
              courseId={course.id} 
              courseName={course.name} 
              courseLocation={[course.address, course.city, course.state].filter(Boolean).join(', ')} 
            />
          </TabsContent>
          
          <TabsContent value="photos">
            <CoursePhotos 
              courseId={course.id}
              courseName={course.name}
              imageUrl={course.image_url}
              imageGallery={course.image_gallery}
            />
          </TabsContent>
          
          <TabsContent value="holes">
            <CourseHoleDetails 
              holePars={course.hole_pars}
              holeDistances={course.hole_distances}
              holeHandicaps={course.hole_handicaps}
            />
          </TabsContent>
          
          <TabsContent value="reviews">
            <CourseReviews 
              courseId={course.id}
              reviews={reviews}
              isLoading={reviewsLoading}
            />
          </TabsContent>
          
          <TabsContent value="leaderboard">
            <CourseLeaderboard 
              rounds={leaderboardRounds}
              isLoading={leaderboardLoading}
              coursePar={course.par}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Course;
