import { Link, useNavigate } from "react-router-dom";
import { MapPin, Flag, Clock, Share, Map } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { isCurrentlyOpen, formatOpeningHours } from "@/utils/openingHours";
import { validateOpeningHours } from "@/utils/openingHoursValidation";
import { useCourseReviews } from "@/hooks/useCourseReviews";
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
    navigate(`/map?focus=${course.id}`);
  };
  return <Link to={`/course/${course.id}`} className="block w-full">
      <div className="w-full bg-background hover:bg-accent/50 transition-colors duration-200 border-b md:border md:rounded-lg md:overflow-hidden md:shadow-sm last:border-b-0 md:last:border-b">
        {/* Image Section - Full Width with bottom spacing */}
        <div className="w-full h-48 sm:h-56 relative mb-4">
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
        <div className="px-4 pb-4 pt-2 space-y-2">
          <div className="space-y-1">
            {/* Rating Stars above title */}
            {averageRating > 0 && <div className="flex items-center">
                <StarRating rating={averageRating} size="md" showRating={false} className="justify-start" />
              </div>}
            
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground line-clamp-1 flex-1">{course.name}</h2>
            </div>
            
            {/* Open in Map Button */}
            <button 
              onClick={handleMapClick}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg border border-primary/20 transition-colors"
            >
              <Map size={16} />
              Open in Map
            </button>
            
            {course.description && <p className="text-muted-foreground text-sm sm:text-base line-clamp-2">{course.description}</p>}
          </div>
          
          <div className="space-y-2 bg-muted/30 rounded-lg p-3 border border-border/30">
            {/* Location */}
            {course.city && <div className="flex items-center gap-2">
                
                <div>
                  <p className="text-xs text-muted-foreground/70 uppercase tracking-wide">{t("home", "location")}</p>
                  <p className="text-sm font-medium text-foreground">{course.city}</p>
                </div>
              </div>}
            
            {/* Opening Hours */}
            <div className="flex items-center gap-2">
              
              <div>
                <p className="text-xs text-muted-foreground/70 uppercase tracking-wide">{t("home", "hours")}</p>
                <p className="text-sm font-medium text-foreground">{formattedHours}</p>
              </div>
            </div>
          </div>
          
          {/* Course Info - Holes and Par (with boxes) */}
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                <Flag size={12} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Holes</p>
                <p className="text-sm font-semibold text-primary">{course.holes}</p>
              </div>
            </div>
            
            {course.par && <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg border border-accent">
                <div className="flex-shrink-0 w-6 h-6 bg-accent/70 rounded-full flex items-center justify-center">
                  <Flag size={12} className="text-accent-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Par</p>
                  <p className="text-sm font-semibold text-accent-foreground">{course.par}</p>
                </div>
              </div>}
          </div>
        </div>
      </div>
    </Link>;
};
export default CourseCard;