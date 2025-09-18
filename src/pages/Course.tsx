import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Flag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { isCurrentlyOpen } from "@/utils/openingHours";
import { CourseHero } from "@/components/course/CourseHero";
import { CourseStatsHeader } from "@/components/course/CourseStatsHeader";
import { CourseCTARow } from "@/components/course/CourseCTARow";
import { CourseTabs } from "@/components/course/CourseTabs";
import ReservationForm from "@/components/course/ReservationForm";
import OpeningHoursDisplay from "@/components/course/OpeningHoursDisplay";
import ShareButton from "@/components/ui/ShareButton";
import { useCourseData } from "@/hooks/useCourseData";
import { useCourseReviews } from "@/hooks/useCourseReviews";
import { useCourseRounds } from "@/hooks/useCourseRounds";

const Course = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const { data: course, isLoading: isLoadingCourse } = useCourseData(id);
  const { data: reviews = [], isLoading: isLoadingReviews, refetch: refetchReviews } = useCourseReviews(id);
  const { data: rounds = [], isLoading: isLoadingRounds } = useCourseRounds(id);

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
          <CourseHero 
            course={course} 
            language={language} 
            isOpen={isOpen} 
            averageRating={averageRating}
            reviewCount={reviewCount}
          />
          <div className="p-4 space-y-6">
            {course.description && (
              <p className="text-muted-foreground text-sm sm:text-base">{course.description}</p>
            )}
            <CourseStatsHeader course={course} />
            <CourseCTARow 
              course={course}
              language={language}
              onLocationClick={handleLocationClick}
              onPhoneClick={handlePhoneClick}
              onWebsiteClick={handleWebsiteClick}
            />
            <OpeningHoursDisplay openingHours={openingHoursData} />
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild variant="outline" className="w-full flex gap-2 items-center">
                <a href={`/add-round?courseId=${course.id}`}>
                  <span className="material-icons"><Flag size={16} /></span>
                  {language === "en" ? "Add Round" : "Agregar Ronda"}
                </a>
              </Button>
            </div>
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
