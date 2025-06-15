
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Flag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import CourseStats from "@/components/course/CourseStats";
import CourseMap from "@/components/course/CourseMap";
import CoursePhotos from "@/components/course/CoursePhotos";
import CourseHoleDetails from "@/components/course/CourseHoleDetails";
import CourseWeather from "@/components/course/CourseWeather";
import AddReviewForm from "@/components/course/AddReviewForm";
import CourseReviews from "@/components/course/CourseReviews";
import ReservationForm from "@/components/course/ReservationForm";
import OpeningHoursDisplay from "@/components/course/OpeningHoursDisplay";
import { isCurrentlyOpen } from "@/utils/openingHours";
import FavoriteButton from "@/components/ui/FavoriteButton";
import { cn } from "@/lib/utils";
import { CourseHero } from "@/components/course/CourseHero";
import { CourseStatsHeader } from "@/components/course/CourseStatsHeader";
import { CourseCTARow } from "@/components/course/CourseCTARow";
import { CourseTabs } from "@/components/course/CourseTabs";

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
      return data?.map((review: any) => ({
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
        const parsed = JSON.parse(course.opening_hours);
        return parsed;
      }
      return course.opening_hours;
    } catch (error) {
      return null;
    }
  };

  const openingHoursData = parseOpeningHours();
  const isOpen = isCurrentlyOpen(openingHoursData);

  const validReviews = Array.isArray(reviews) ? reviews.filter(r => typeof r.rating !== 'undefined') : [];
  const averageRating = validReviews.length > 0 
    ? validReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / validReviews.length 
    : 0;
  const reviewCount = (Array.isArray(reviews) && reviews.length) || 0;

  // CTA handlers
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
      let url = course.website;
      if (!url.startsWith('http://') && !url.startsWith('https://')) url = `https://${url}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
  const handleReviewSuccess = () => refetchReviews();

  return (
    <div className="h-screen flex flex-col">
      <ScrollArea className="flex-1">
        <div className="pb-28">
          {/* Hero Section */}
          <CourseHero course={course} language={language} isOpen={isOpen} />
          <div className="p-4 space-y-6">
            {/* Description */}
            {course.description && (
              <p className="text-muted-foreground text-sm sm:text-base">{course.description}</p>
            )}
            <CourseStatsHeader course={course} averageRating={averageRating} reviewCount={reviewCount} />
            <CourseCTARow 
              course={course}
              language={language}
              onLocationClick={handleLocationClick}
              onPhoneClick={handlePhoneClick}
              onWebsiteClick={handleWebsiteClick}
            />
            <OpeningHoursDisplay openingHours={openingHoursData} />
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <ReservationForm
                courseId={course.id}
                courseName={course.name}
                courseLocation={`${course.city}, ${course.state}`}
              />
              <Button asChild variant="outline" className="w-full flex gap-2 items-center">
                <a href="/add-round">
                  <span className="material-icons"><Flag size={16} /></span>
                  {language === "en" ? "Add Round" : "Agregar Ronda"}
                </a>
              </Button>
            </div>
            {/* Tabs */}
            <CourseTabs
              course={course}
              rounds={rounds}
              isLoadingRounds={isLoadingRounds}
              reviews={reviews}
              isLoadingReviews={isLoadingReviews}
              onReviewSuccess={handleReviewSuccess}
              language={language}
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Course;
