import { Link, useNavigate } from "react-router-dom";
import { MapPin, Flag, Clock, Share, Map, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { isCurrentlyOpen, formatOpeningHours } from "@/utils/openingHours";
import { validateOpeningHours } from "@/utils/openingHoursValidation";
import { useCourseReviews } from "@/hooks/useCourseReviews";
import { useCoursePlayersCount } from "@/hooks/useCoursePlayersCount";
import CourseImageCarousel from "./CourseImageCarousel";
import FavoriteButton from "@/components/ui/FavoriteButton";
import ShareButton from "@/components/ui/ShareButton";
import StarRating from "@/components/ui/StarRating";
interface CourseCardProps {
  course: any;
  currentTime: Date;
}
const CourseCard = ({
  course,
  currentTime
}: CourseCardProps) => {
  const {
    t
  } = useLanguage();
  const navigate = useNavigate();

  // Fetch course reviews for rating
  const {
    data: reviews = []
  } = useCourseReviews(course.id);
  const averageRating = reviews.length > 0 ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length : 0;

  // Fetch total players count
  const { data: playersCount = 0, isLoading: isLoadingPlayers } = useCoursePlayersCount(course.id);
  const getCourseImages = (course: any): string[] => {
    const images: string[] = [];

    // If there's an image_url, add it first
    if (course.image_url) {
      images.push(course.image_url);
    }

    // If there's a gallery, add those images
    if (course.image_gallery) {
      const galleryImages = course.image_gallery.split(',').map((url: string) => url.trim()).filter((url: string) => url !== '');
      images.push(...galleryImages);
    }

    // If no images, return an empty array
    return images.length > 0 ? images : [];
  };
  const courseImages = getCourseImages(course);

  // Use the validation utility to properly parse and validate opening hours
  const openingHoursData = validateOpeningHours(course.opening_hours);
  const isOpen = isCurrentlyOpen(openingHoursData);
  const formattedHours = formatOpeningHours(openingHoursData);
  
  const handleMapClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/courses-map?focus=${course.id}`);
  };
  return <Link to={`/course/${course.id}`} className="block w-full">
      <div className="w-full bg-background hover:bg-accent/50 transition-colors duration-200 border-b md:border md:rounded-lg md:overflow-hidden md:shadow-sm last:border-b-0 md:last:border-b">
        {/* Image Section - Full Width with bottom spacing */}
        <div className="w-full h-48 sm:h-56 relative">
          <CourseImageCarousel images={courseImages} courseName={course.name} courseId={course.id} />
          
          {/* Top-left Status Badge */}
          <div className="absolute top-2 left-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border transition-all duration-200 ${isOpen ? "bg-green-500/90 text-white border-green-400/50 shadow-lg" : "bg-red-500/90 text-white border-red-400/50 shadow-lg"}`}>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-green-200" : "bg-red-200"} animate-pulse`} />
                <span>{isOpen ? t("home", "openNow") : t("home", "closed")}</span>
              </div>
            </div>
          </div>

          {/* Top-right Players Count */}
          {!isLoadingPlayers && (
            <div className="absolute top-14 right-2">
              <div className={`px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm border shadow-lg transition-all ${
                playersCount > 0 
                  ? "bg-primary/90 text-primary-foreground border-primary/50" 
                  : "bg-muted/90 text-muted-foreground border-muted-foreground/30"
              }`}>
                <div className="flex items-center gap-1.5">
                  <Users size={12} className="flex-shrink-0" />
                  <span>{playersCount}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons Overlay */}
          <div className="absolute top-2 right-2 flex gap-2">
            <div onClick={e => e.preventDefault()}>
              <ShareButton course={course} size="sm" variant="ghost" className="bg-white/80 backdrop-blur-sm hover:bg-white/90" />
            </div>
            <div onClick={e => e.preventDefault()}>
              <FavoriteButton courseId={course.id} size="sm" variant="ghost" className="bg-white/80 backdrop-blur-sm hover:bg-white/90" />
            </div>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="px-4 pb-4 pt-3 md:px-5 md:pb-5 md:pt-4 space-y-3">
          {/* Title and Rating */}
          <div className="space-y-1.5">
            {averageRating > 0 && (
              <div className="flex items-center">
                <StarRating rating={averageRating} size="sm" showRating={false} className="justify-start" />
              </div>
            )}
            
            <h2 className="text-base sm:text-lg font-poppins font-semibold text-foreground leading-tight">
              {course.name}
            </h2>
            
            {course.description && (
              <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2 leading-relaxed">
                {course.description}
              </p>
            )}
          </div>
          
          {/* Location and Hours - Clean Minimal Design */}
          <div className="flex items-start justify-between gap-3 py-2 border-y border-border/40">
            <div className="flex-1 min-w-0">
              {course.city && (
                <div className="flex items-center gap-1.5 mb-2">
                  <MapPin size={14} className="text-muted-foreground/60 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-foreground font-medium truncate">
                    {course.city}
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-muted-foreground/60 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {formattedHours}
                </span>
              </div>
            </div>
            
            {/* Minimal Map Button */}
            <button 
              onClick={handleMapClick}
              className="flex-shrink-0 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 text-primary hover:text-white bg-primary/5 hover:bg-primary rounded-lg border border-primary/20 hover:border-primary transition-all duration-200"
            >
              <Map size={16} />
            </button>
          </div>
          
          {/* Course Stats - Minimal Pills */}
          <div className="flex items-center gap-2 pt-0.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-primary/5 rounded-full border border-primary/10">
              <Flag size={12} className="text-primary" />
              <span className="text-xs font-medium text-primary">{course.holes} Holes</span>
            </div>
            
            {course.par && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-accent/10 rounded-full border border-accent/20">
                <Flag size={12} className="text-accent-foreground" />
                <span className="text-xs font-medium text-accent-foreground">Par {course.par}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>;
};
export default CourseCard;