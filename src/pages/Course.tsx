
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Phone, Globe, Calendar, Users, Flag, Star, ArrowLeft, Navigation, Plus, ExternalLink } from "lucide-react";
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
import OpeningHoursDisplay from "@/components/course/OpeningHoursDisplay";
import { isCurrentlyOpen, formatOpeningHours } from "@/utils/openingHours";
import FavoriteButton from "@/components/ui/FavoriteButton";
import { cn } from "@/lib/utils";

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

  const { data: rounds = [], isLoading: isLoadingRounds } = useQuery({
    queryKey: ['course-rounds', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('rounds')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq('course_id', id)
        .order('score', { ascending: true });
      
      if (error) throw error;
      return data || [];
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

  // Handle click actions for CTAs
  const handleLocationClick = () => {
    if (course.address) {
      const query = encodeURIComponent([course.address, course.city, course.state].filter(Boolean).join(', '));
      window.open(`https://maps.google.com?q=${query}`, '_blank');
    }
  };

  const handlePhoneClick = () => {
    if (course.phone) {
      window.open(`tel:${course.phone}`, '_self');
    }
  };

  const handleWebsiteClick = () => {
    if (course.website) {
      // Ensure the URL has a protocol
      let url = course.website;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleReviewSuccess = () => {
    refetchReviews();
  };

  return (
    <div className="h-screen flex flex-col">
      <ScrollArea className="flex-1">
        <div className="pb-28">
          {/* Hero Section with Course Image - Increased Height */}
          <div className="relative w-full h-80 sm:h-96 md:h-[28rem]">
            {courseImages.length > 0 ? (
              <img
                src={courseImages[0]}
                alt={course.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Golf+Course';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <Flag className="h-16 w-16 text-white opacity-50" />
              </div>
            )}
            
            {/* Header Controls Overlay */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {language === "en" ? "Back" : "Volver"}
                </Button>
                <div className="flex items-center gap-2">
                  <FavoriteButton courseId={course.id} size="sm" />
                </div>
              </div>
            </div>

            {/* Course Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{course.name}</h1>
              <div className="flex items-center gap-4 text-white/90">
                {course.address && (
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin size={16} />
                    <span>{course.city}, {course.state}</span>
                  </div>
                )}
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
            </div>
          </div>

          <div className="p-4 space-y-6">
            {/* Course Description */}
            {course.description && (
              <p className="text-muted-foreground text-sm sm:text-base">{course.description}</p>
            )}

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

            {/* Call to Action Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {course.address && (
                <Card 
                  className="cursor-pointer hover:shadow-md transition-all duration-200 hover:bg-accent/10 border-2 hover:border-primary/20"
                  onClick={handleLocationClick}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm mb-1">{language === "en" ? "Get Directions" : "Obtener Direcciones"}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {[course.address, course.city, course.state].filter(Boolean).join(', ')}
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {course.phone && (
                <Card 
                  className="cursor-pointer hover:shadow-md transition-all duration-200 hover:bg-accent/10 border-2 hover:border-primary/20"
                  onClick={handlePhoneClick}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm mb-1">{language === "en" ? "Call Course" : "Llamar"}</p>
                        <p className="text-xs text-muted-foreground">{course.phone}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {course.website && (
                <Card 
                  className="cursor-pointer hover:shadow-md transition-all duration-200 hover:bg-accent/10 border-2 hover:border-primary/20"
                  onClick={handleWebsiteClick}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm mb-1">{language === "en" ? "Visit Website" : "Visitar Web"}</p>
                        <p className="text-xs text-muted-foreground truncate">{t("course", "website")}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Opening Hours Display */}
            <OpeningHoursDisplay openingHours={openingHoursData} />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <ReservationForm
                courseId={course.id}
                courseName={course.name}
                courseLocation={`${course.city}, ${course.state}`}
              />
              <Link to={`/add-round`} className="flex-1">
                <Button variant="outline" className="w-full flex gap-2 items-center">
                  <Plus size={16} />
                  {language === "en" ? "Add Round" : "Agregar Ronda"}
                </Button>
              </Link>
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
                <CourseStats rounds={rounds} isLoading={isLoadingRounds} coursePar={course.par} />
                {course.latitude && course.longitude && (
                  <CourseMap
                    latitude={course.latitude}
                    longitude={course.longitude}
                  />
                )}
              </TabsContent>

              <TabsContent value="holes" className="mt-4">
                <CourseHoleDetails coursePar={course.par} holes={course.holes} />
              </TabsContent>

              <TabsContent value="weather" className="mt-4">
                <CourseWeather
                  latitude={course.latitude}
                  longitude={course.longitude}
                />
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4 mt-4">
                <AddReviewForm 
                  courseId={course.id} 
                  onSuccess={handleReviewSuccess}
                  onCancel={() => {}}
                />
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
