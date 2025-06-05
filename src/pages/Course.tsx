import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, MapPin, Clock, Calendar, Info, Users, Star, Phone } from "lucide-react";
import CourseMap from "@/components/course/CourseMap";
import CourseReviews, { Review } from "@/components/course/CourseReviews";
import CoursePhotos from "@/components/course/CoursePhotos";
import CourseHoleDetails from "@/components/course/CourseHoleDetails";
import CourseWeather from "@/components/course/CourseWeather";
import CourseLeaderboard from "@/components/course/CourseLeaderboard";
import CourseStats from "@/components/course/CourseStats";
import ReservationForm from "@/components/course/ReservationForm";
import { formatOpeningHoursForDisplay } from "@/utils/openingHours";
import { format } from "date-fns";
import AddReviewForm from "@/components/course/AddReviewForm";

const Course = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);

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
    enabled: !!id
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
    enabled: !!id && !!user?.id
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
    enabled: !!id
  });

  // Fetch course reviews and profiles separately, then combine them
  const { data: reviews, isLoading: reviewsLoading, refetch: refetchReviews } = useQuery({
    queryKey: ['courseReviews', id],
    queryFn: async () => {
      if (!id) return [];
      
      // Fetch reviews first
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('course_reviews')
        .select('*')
        .eq('course_id', id)
        .order('created_at', { ascending: false });
      
      if (reviewsError) {
        console.error("Reviews fetch error:", reviewsError);
        throw reviewsError;
      }
      
      if (!reviewsData || reviewsData.length === 0) {
        return [];
      }
      
      // Get unique user IDs from reviews
      const userIds = [...new Set(reviewsData.map(review => review.user_id))];
      
      // Fetch profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);
      
      if (profilesError) {
        console.error("Profiles fetch error:", profilesError);
        // Continue with reviews even if profiles can't be fetched
      }
      
      // Create a map of user profiles
      const profilesMap = (profilesData || []).reduce((map, profile) => {
        map[profile.id] = profile;
        return map;
      }, {});
      
      // Combine reviews with user profile data
      const enrichedReviews: Review[] = reviewsData.map(review => ({
        ...review,
        username: profilesMap[review.user_id]?.username || "Anonymous User",
        avatar_url: profilesMap[review.user_id]?.avatar_url || null
      }));
      
      return enrichedReviews;
    },
    enabled: !!id
  });

  // Check if user has already reviewed this course
  const { data: userReview } = useQuery({
    queryKey: ['userReview', id, user?.id],
    queryFn: async () => {
      if (!id || !user?.id) return null;
      const { data, error } = await supabase
        .from('course_reviews')
        .select('*')
        .eq('course_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error("User review fetch error:", error);
        throw error;
      }
      return data;
    },
    enabled: !!id && !!user?.id
  });

  // Parse image gallery from string to array
  const parseImageGallery = () => {
    if (!courseData?.image_gallery) return [];
    
    if (typeof courseData.image_gallery === 'string') {
      return courseData.image_gallery.split(',').map(url => url.trim()).filter(url => url !== '');
    }
    
    return courseData.image_gallery;
  };

  // Parse opening hours from JSON if needed
  const parseOpeningHours = () => {
    if (!courseData?.opening_hours) return null;
    if (typeof courseData.opening_hours === 'string') {
      try {
        return JSON.parse(courseData.opening_hours);
      } catch (error) {
        console.error("Error parsing opening hours:", error);
        return null;
      }
    }
    return courseData.opening_hours;
  };

  // Format opening hours for display
  const openingHoursData = parseOpeningHours();
  const formattedOpeningHours = openingHoursData ? formatOpeningHoursForDisplay(openingHoursData) : '';

  // Calculate average rating
  const averageRating = reviews?.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  // Handle back button
  const handleBack = () => {
    navigate(-1);
  };

  // Handle contact button
  const handleContact = () => {
    if (courseData?.phone) {
      window.location.href = `tel:${courseData.phone}`;
      toast({
        title: t("course", "calling"),
        description: courseData.name
      });
    } else {
      toast({
        title: t("course", "phoneNotAvailable"),
        description: t("course", "tryWebsite"),
        variant: "destructive"
      });
    }
  };

  const handleReviewSubmitSuccess = () => {
    setShowReviewForm(false);
    refetchReviews();
    toast({
      title: t("course", "reviewSubmitted"),
      description: t("course", "thankYouForReview")
    });
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

  // Format opening hours to display for the day
  const getDayOpeningHours = () => {
    if (!openingHoursData || !Array.isArray(openingHoursData)) return "Horario no disponible";
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const today = new Date().getDay(); // 0 is Sunday
    const adjustedDay = today === 0 ? 6 : today - 1; // Convert to 0-6 where 0 is Monday

    const dayData = openingHoursData[adjustedDay];
    if (!dayData || !dayData.isOpen) return "Cerrado hoy";
    return `${dayData.open} - ${dayData.close}`;
  };

  return (
    <div className="px-4 md:px-8 lg:px-12 xl:px-16 pb-20">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("common", "back")}
      </Button>

      {/* Course header - now full width and taller */}
      <div className="relative rounded-lg overflow-hidden mb-6">
        {courseData?.image_url ? (
          <div className="h-64 w-full">
            <img src={courseData.image_url} alt={courseData.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          </div>
        ) : (
          <div className="h-64 w-full bg-gradient-to-r from-primary/20 to-secondary/20" />
        )}
        
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <h1 className="text-2xl font-bold">{courseData?.name}</h1>
          {/* Enhanced address display */}
          {courseData?.city}
          {averageRating > 0 && (
            <div className="flex items-center mt-1">
              <Star className="h-4 w-4 mr-1 text-yellow-400 fill-yellow-400" />
              <span className="text-sm">{averageRating.toFixed(1)} ({reviews?.length} reviews)</span>
            </div>
          )}
        </div>
      </div>

      {/* Contact and Reservation Buttons */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        <Button
          onClick={handleContact}
          className="bg-primary shadow-md"
          size="lg"
        >
          <Phone className="mr-2 h-5 w-5" />
          {t("course", "getInTouch")}
        </Button>
        {user && courseData && (
          <ReservationForm 
            courseId={id!}
            courseName={courseData.name}
            courseLocation={[courseData.city, courseData.state].filter(Boolean).join(', ')}
          />
        )}
      </div>

      {/* Main content */}
      <div className="space-y-6">
        {/* Course details card with prominently displayed address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Course Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Address section - Enhanced */}
            {(courseData?.address || courseData?.city || courseData?.state) && (
              <div className="bg-primary/5 p-3 rounded-lg mb-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Location</h3>
                    <p className="text-sm">
                      {courseData.address && <span className="block">{courseData.address}</span>}
                      {(courseData.city || courseData.state) && (
                        <span>{[courseData.city, courseData.state].filter(Boolean).join(', ')}</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

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
            {openingHoursData && Array.isArray(openingHoursData) && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Opening Hours</h3>
                <div className="grid grid-cols-1 gap-1">
                  {openingHoursData.map((day, index) => {
                    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                    return (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="font-medium">{dayNames[index]}</span>
                        <span>
                          {day && day.isOpen ? `${day.open} - ${day.close}` : 'Closed'}
                        </span>
                      </div>
                    );
                  })}
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

            {/* Phone */}
            {courseData?.phone && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Contact</h3>
                <p className="text-sm flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <a href={`tel:${courseData.phone}`} className="text-primary underline">
                    {courseData.phone}
                  </a>
                </p>
              </div>
            )}

            {/* Website */}
            {courseData?.website && (
              <div className="mt-2">
                <p className="text-sm">
                  <a href={courseData.website} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                    Visit website
                  </a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Photos - Show carousel before the map */}
        <CoursePhotos 
          courseId={id || ''} 
          imageUrl={courseData?.image_url} 
          imageGallery={parseImageGallery()} 
        />

        {/* Map */}
        {courseData?.latitude && courseData?.longitude && (
          <CourseMap latitude={courseData.latitude} longitude={courseData.longitude} name={courseData.name} />
        )}

        {/* Reviews - Now with Add Review button */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Reviews</CardTitle>
            {user && !userReview && !showReviewForm && (
              <Button variant="outline" size="sm" onClick={() => setShowReviewForm(true)}>
                Add Review
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {showReviewForm ? (
              <AddReviewForm 
                courseId={id!} 
                onSuccess={handleReviewSubmitSuccess} 
                onCancel={() => setShowReviewForm(false)} 
              />
            ) : (
              <CourseReviews courseId={id} reviews={reviews || []} isLoading={reviewsLoading} />
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

        {/* Weather */}
        {courseData?.latitude && courseData?.longitude && (
          <CourseWeather 
            latitude={courseData.latitude} 
            longitude={courseData.longitude} 
          />
        )}
      </div>
    </div>
  );
};

export default Course;
