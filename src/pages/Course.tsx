import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, MapPin, Phone, Globe, Calendar, Flag, Trophy, Clock, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { isCurrentlyOpen, formatOpeningHours, getDayName, getCurrentDayIndex } from "@/utils/openingHours";
import CourseHoleDetails from "@/components/course/CourseHoleDetails";
import CourseMap from "@/components/course/CourseMap";
import CoursePhotos from "@/components/course/CoursePhotos";
import CourseWeather from "@/components/course/CourseWeather";
import AddReviewForm from "@/components/course/AddReviewForm";
import CourseReviews from "@/components/course/CourseReviews";
import CourseStats from "@/components/course/CourseStats";
import CourseLeaderboard from "@/components/course/CourseLeaderboard";
import ReservationCalendar from "@/components/course/ReservationCalendar";
import FavoriteButton from "@/components/ui/FavoriteButton";

const Course = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isHoursOpen, setIsHoursOpen] = useState(false);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      if (!id) throw new Error("Course ID is required");
      
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

  const { data: reviews, refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('course_reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          course_id,
          user_id,
          profiles!course_reviews_user_id_fkey (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('course_id', id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching reviews:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!id,
  });

  const { data: rounds } = useQuery({
    queryKey: ['course-rounds', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('rounds')
        .select('*')
        .eq('course_id', id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching rounds:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!id,
  });

  const { data: reservations } = useQuery({
    queryKey: ['course-reservations', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('course_id', id)
        .order('date', { ascending: true });

      if (error) {
        console.error("Error fetching reservations:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t("course", "courseNotFound")}</h2>
          <Button onClick={() => navigate('/')}>{t("common", "goHome")}</Button>
        </div>
      </div>
    );
  }

  // Parse opening_hours safely
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

  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    refetchReviews();
  };

  const handlePhoneClick = () => {
    if (course.phone) {
      window.open(`tel:${course.phone}`, '_self');
    }
  };

  const handleLocationClick = () => {
    const address = [course.address, course.city, course.state].filter(Boolean).join(', ');
    if (address) {
      const encodedAddress = encodeURIComponent(address);
      window.open(`https://maps.google.com/maps?q=${encodedAddress}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-80 bg-cover bg-center" style={{
        backgroundImage: course.image_url ? `url(${course.image_url})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 p-4 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("common", "back")}
            </Button>
            <FavoriteButton courseId={course.id} size="sm" variant="ghost" className="text-white hover:bg-white/20 backdrop-blur-sm" />
          </div>
          
          <div className="text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{course.name}</h1>
            <div className="flex items-center gap-2 text-lg mb-2">
              <MapPin className="h-5 w-5" />
              <span>{[course.address, course.city, course.state].filter(Boolean).join(', ')}</span>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Flag className="mr-1 h-4 w-4" />
                {course.holes} {t("profile", "holes")}
              </Badge>
              {course.par && (
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <Trophy className="mr-1 h-4 w-4" />
                  {t("course", "par")} {course.par}
                </Badge>
              )}
              <Badge variant="secondary" className={`${isOpen ? 'bg-green-500/20 text-green-100 border-green-300/30' : 'bg-amber-500/20 text-amber-100 border-amber-300/30'}`}>
                <Clock className="mr-1 h-4 w-4" />
                {isOpen ? t("home", "openNow") : t("home", "closed")}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="container mx-auto px-4 py-6 pb-28">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-6">
            <TabsTrigger value="overview">{t("course", "overview")}</TabsTrigger>
            <TabsTrigger value="holes">Holes</TabsTrigger>
            <TabsTrigger value="photos">{t("course", "photos")}</TabsTrigger>
            <TabsTrigger value="book" className="hidden md:block">{t("course", "book")}</TabsTrigger>
            <TabsTrigger value="stats" className="hidden md:block">{t("course", "stats")}</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-300px)] mt-6">
            <TabsContent value="overview" className="space-y-6">
              {/* Course Description */}
              {course.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("course", "about")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{course.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Quick Info */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("course", "quickInfo")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course.phone && (
                      <div 
                        className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                        onClick={handlePhoneClick}
                      >
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{t("course", "phone")}</p>
                          <p className="text-muted-foreground text-primary hover:underline">{course.phone}</p>
                        </div>
                      </div>
                    )}
                    
                    {course.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{t("course", "website")}</p>
                          <a 
                            href={course.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {t("course", "visitWebsite")}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{t("course", "hours")}</p>
                        <Collapsible open={isHoursOpen} onOpenChange={setIsHoursOpen}>
                          <CollapsibleTrigger className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                            <span>{formattedHours}</span>
                            <ChevronDown className={`h-4 w-4 transition-transform ${isHoursOpen ? 'rotate-180' : ''}`} />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2">
                            {openingHoursData && Array.isArray(openingHoursData) && (
                              <div className="space-y-1 text-sm">
                                {openingHoursData.map((day, index) => {
                                  const isToday = index === getCurrentDayIndex();
                                  return (
                                    <div key={index} className={`flex justify-between ${isToday ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
                                      <span>{getDayName(index)}</span>
                                      <span>
                                        {day && day.isOpen ? `${day.open} - ${day.close}` : 'Closed'}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    </div>
                    
                    {course.established_year && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{t("course", "established")}</p>
                          <p className="text-muted-foreground">{course.established_year}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Location */}
                  {(course.address || course.city || course.state) && (
                    <div 
                      className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                      onClick={handleLocationClick}
                    >
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-muted-foreground text-primary hover:underline">
                          {[course.address, course.city, course.state].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Weather */}
              <CourseWeather 
                latitude={course.latitude} 
                longitude={course.longitude}
              />

              {/* Reviews Section */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("course", "reviews")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {user && !showReviewForm && (
                    <Button onClick={() => setShowReviewForm(true)} className="w-full">
                      {t("course", "writeReview")}
                    </Button>
                  )}
                  
                  {showReviewForm && (
                    <AddReviewForm 
                      courseId={course.id} 
                      onSuccess={handleReviewSuccess}
                      onCancel={() => setShowReviewForm(false)}
                    />
                  )}
                  
                  <CourseReviews reviews={reviews || []} isLoading={false} />
                </CardContent>
              </Card>

              {/* Map */}
              {course.latitude && course.longitude && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("course", "location")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CourseMap 
                      latitude={course.latitude} 
                      longitude={course.longitude} 
                      name={course.name} 
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="holes" className="space-y-6">
              <CourseHoleDetails 
                holePars={course.hole_pars} 
                holeHandicaps={course.hole_handicaps} 
              />
            </TabsContent>

            <TabsContent value="photos" className="space-y-6">
              <CoursePhotos 
                courseId={course.id} 
                imageUrl={course.image_url}
                imageGallery={course.image_gallery}
              />
            </TabsContent>

            <TabsContent value="book" className="space-y-6">
              <ReservationCalendar reservations={reservations || []} />
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              <CourseStats rounds={rounds || []} isLoading={false} />
              <CourseLeaderboard rounds={rounds || []} isLoading={false} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
};

export default Course;
