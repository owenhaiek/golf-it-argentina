
import { Link } from "react-router-dom";
import { MapPin, Flag, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { isCurrentlyOpen, formatOpeningHours } from "@/utils/openingHours";
import { validateOpeningHours } from "@/utils/openingHoursValidation";
import CourseImageCarousel from "./CourseImageCarousel";
import FavoriteButton from "@/components/ui/FavoriteButton";

interface CourseCardProps {
  course: any;
  currentTime: Date;
}

const CourseCard = ({ course, currentTime }: CourseCardProps) => {
  const { t } = useLanguage();

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
  
  return (
    <Link to={`/course/${course.id}`} className="block w-full">
      <div className="w-full bg-background hover:bg-accent/50 transition-colors duration-200 border-b md:border md:rounded-lg md:overflow-hidden md:shadow-sm last:border-b-0 md:last:border-b">
        {/* Image Section - Full Width with bottom spacing */}
        <div className="w-full h-48 sm:h-56 relative mb-4">
          <CourseImageCarousel 
            images={courseImages} 
            courseName={course.name} 
            courseId={course.id} 
          />
          
          {/* Top-left Status Badge */}
          <div className="absolute top-2 left-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border transition-all duration-200 ${
              isOpen 
                ? "bg-green-500/90 text-white border-green-400/50 shadow-lg" 
                : "bg-red-500/90 text-white border-red-400/50 shadow-lg"
            }`}>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-green-200" : "bg-red-200"} animate-pulse`} />
                <span>{isOpen ? t("home", "openNow") : t("home", "closed")}</span>
              </div>
            </div>
          </div>
          
          {/* Favorite Button Overlay */}
          <div className="absolute top-2 right-2">
            <FavoriteButton 
              courseId={course.id} 
              size="sm" 
              variant="ghost"
              className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
            />
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-4 space-y-3">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground line-clamp-1">{course.name}</h2>
            
            {course.description && (
              <p className="text-muted-foreground text-sm sm:text-base line-clamp-2">{course.description}</p>
            )}
          </div>
          
          <div className="space-y-3 text-sm sm:text-base">
            {/* Address */}
            {course.address && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{[course.address, course.city, course.state].filter(Boolean).join(', ')}</span>
              </div>
            )}
            
            {/* Opening Hours - Now below address */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock size={16} className="flex-shrink-0" />
              <div className="text-left">
                <span className="text-xs md:text-sm lg:text-base font-medium">{formattedHours}</span>
              </div>
            </div>
            
            {/* Course Info - Holes and Par closer together */}
            <div className="flex items-center gap-6">
              {/* Holes and Par grouped together */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-primary">
                  <Flag size={16} className="flex-shrink-0" />
                  <span className="font-medium text-xs md:text-sm lg:text-base">{course.holes} {t("profile", "holes")}</span>
                </div>
                
                {course.par && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Flag size={16} className="flex-shrink-0" />
                    <span className="font-medium text-xs md:text-sm lg:text-base">{t("course", "par")} {course.par}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
