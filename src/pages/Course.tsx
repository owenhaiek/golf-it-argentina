import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Phone, Globe, Calendar, Users, Flag, Star, ArrowLeft, Navigation } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import CoursePhotos from "@/components/course/CoursePhotos";
import CourseHoleDetails from "@/components/course/CourseHoleDetails";
import CourseStats from "@/components/course/CourseStats";
import CourseWeather from "@/components/course/CourseWeather";
import CourseMap from "@/components/course/CourseMap";
import AddReviewForm from "@/components/course/AddReviewForm";
import CourseReviews from "@/components/course/CourseReviews";
import ReservationForm from "@/components/course/ReservationForm";
import { isCurrentlyOpen, formatOpeningHours } from "@/utils/openingHours";
import FavoriteButton from "@/components/ui/FavoriteButton";

const Course = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const { data: course, isLoading: isLoadingCourse } = useQuery({
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

  const { data: reviews = [], isLoading: isLoadingReviews, refetch: refetchReviews } = useQuery({
    queryKey: ['course-reviews', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('course_reviews')
        .select(`
          *,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('course_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data?.map(review => ({
        ...review,
        profiles: Array.isArray(review.profiles) ? review.profiles[0] : review.profiles
      })) || [];
    },
    enabled: !!id,
  });

  if (isLoadingCourse) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-2xl font-bold text-foreground mb-2">Course Not Found</h1>
        <p className="text-muted-foreground mb-4">The golf course you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/')} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>
    );
  }

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

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

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
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 bg-background border-b border-border">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === "en" ? "Back" : "Volver"}
          </Button>
          <div className="flex items-center gap-2">
            <FavoriteButton courseId={course.id} size="sm" />
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="pb-28">
          {/* Course Images */}
          <div className="w-full h-64 sm:h-80 relative">
            <CoursePhotos images={courseImages} courseName={course.name} />
          </div>

          <div className="p-4 space-y-6">
            {/* Course Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{course.name}</h1>
                  
                  {course.description && (
                    <p className="text-muted-foreground text-sm sm:text-base mb-3">{course.description}</p>
                  )}

                  {/* Status Badge */}
                  <div className="mb-3">
                    <Badge 
                      variant={isOpen ? "default" : "secondary"}
                      className={cn(
                        "text-xs font-medium",
                        isOpen ? "bg-green-500 hover:bg-green-600" : "bg-amber-500 hover:bg-amber-600"
                      )}
                    >
                      {isOpen ? t("home", "openNow") : t("home", "closed")}
                    </Badge>
                  </div>

                  {/* Course Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {course.address && (
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                        <span>{[course.address, course.city, course.state].filter(Boolean).join(', ')}</span>
                      </div>
                    )}

                    {formattedHours && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar size={16} className="flex-shrink-0" />
                        <span>{formattedHours}</span>
                      </div>
                    )}

                    {course.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone size={16} className="flex-shrink-0" />
                        <span>{course.phone}</span>
                      </div>
                    )}

                    {course.website && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Globe size={16} className="flex-shrink-0" />
                        <a href={course.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary truncate">
                          {t("course", "website")}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-accent/20 rounded-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-primary mb-1">
                    <Flag size={16} />
                    <span className="font-semibold">{course.holes}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t("profile", "holes")}</p>
                </div>
                
                {course.par && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-primary mb-1">
                      <Flag size={16} />
                      <span className="font-semibold">{course.par}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{t("course", "par")}</p>
                  </div>
                )}
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-primary mb-1">
                    <Star size={16} />
                    <span className="font-semibold">
                      {averageRating > 0 ? averageRating.toFixed(1) : '--'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {reviews.length} {language === "en" ? "review" + (reviews.length !== 1 ? "s" : "") : "reseña" + (reviews.length !== 1 ? "s" : "")}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <ReservationForm
                  courseId={course.id}
                  courseName={course.name}
                  courseLocation={`${course.city}, ${course.state}`}
                />
                <Link to={`/add-round`} className="flex-1">
                  <Button variant="outline" className="w-full flex gap-2 items-center">
                    <Users size={16} />
                    {language === "en" ? "Add Round" : "Agregar Ronda"}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Tabs Content */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 text-xs">
                <TabsTrigger value="overview">{language === "en" ? "Overview" : "Resumen"}</TabsTrigger>
                <TabsTrigger value="holes">{language === "en" ? "Holes" : "Hoyos"}</TabsTrigger>
                <TabsTrigger value="weather">{language === "en" ? "Weather" : "Clima"}</TabsTrigger>
                <TabsTrigger value="reviews">{language === "en" ? "Reviews" : "Reseñas"}</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <CourseStats course={course} />
                {course.latitude && course.longitude && (
                  <CourseMap
                    latitude={course.latitude}
                    longitude={course.longitude}
                    courseName={course.name}
                  />
                )}
              </TabsContent>

              <TabsContent value="holes" className="mt-4">
                <CourseHoleDetails
                  holes={course.holes}
                  holePars={course.hole_pars}
                  holeHandicaps={course.hole_handicaps}
                />
              </TabsContent>

              <TabsContent value="weather" className="mt-4">
                <CourseWeather
                  latitude={course.latitude}
                  longitude={course.longitude}
                  courseName={course.name}
                />
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4 mt-4">
                <AddReviewForm courseId={course.id} onReviewAdded={refetchReviews} />
                <CourseReviews
                  courseId={course.id}
                  reviews={reviews}
                  isLoading={isLoadingReviews}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Course;
