
import { Link } from "react-router-dom";
import { MapPin, Flag, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { isCurrentlyOpen, formatOpeningHours } from "@/utils/openingHours";
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
  
  // Parse opening_hours if it's a string
  const parseOpeningHours = () => {
    try {
      if (typeof course.opening_hours === 'string') {
        return JSON.parse(course.opening_hours);
      }
      return course.opening_hours;
    } catch (error) {
      console.error("Error parsing opening hours for course:", course.name, error);
      return null;
    }
  };
  
  const openingHoursData = parseOpeningHours();
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
        <div className="p-4 sm:p-6 space-y-3">
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
            
            {/* Opening Hours with Par - Now below address */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock size={16} className="flex-shrink-0" />
              <div className="text-left">
                <span className="text-xs md:text-sm lg:text-base font-medium">{formattedHours}</span>
                {course.par && <span className="text-xs text-muted-foreground ml-1">
                  • {t("course", "par")} {course.par}
                </span>}
              </div>
            </div>
            
            {/* Course Info - Mobile: 2-column grid, Desktop: inline */}
            <div className="grid grid-cols-2 gap-2 md:flex md:flex-col md:gap-3 lg:flex-row lg:items-center lg:gap-6">
              {/* Holes - Column 1 */}
              <div className="flex items-center gap-2 md:gap-2 text-primary">
                <Flag size={16} className="flex-shrink-0" />
                <div className="text-left">
                  <span className="font-medium text-xs md:text-sm lg:text-base">{course.holes} {t("profile", "holes")}</span>
                </div>
              </div>
              
              {/* Open/Closed Status - Column 2 */}
              <div className="flex items-center gap-2 md:gap-2">
                <div className={`w-2 h-2 rounded-full ${isOpen ? "bg-green-600" : "bg-amber-600"} flex-shrink-0`} />
                <div className="text-left">
                  <span className={`font-medium text-xs md:text-sm lg:text-base ${isOpen ? "text-green-600" : "text-amber-600"}`}>
                    {isOpen ? t("home", "openNow") : t("home", "closed")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
