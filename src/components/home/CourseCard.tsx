
import { Link } from "react-router-dom";
import { MapPin, Flag, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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

  // Helper function to get all images for a course
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
      <Card className="overflow-hidden hover:shadow-lg transition-shadow rounded-lg border w-full bg-card">
        <CardContent className="p-0 w-full">
          <div className="flex w-full">
            {/* Image Section - Full Width */}
            <div className="w-full h-32 md:w-40 md:h-40 flex-shrink-0 relative">
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
            <div className="flex-1 p-4 space-y-2">
              <h2 className="text-lg md:text-xl font-semibold text-foreground line-clamp-1">{course.name}</h2>
              
              {course.description && (
                <p className="text-muted-foreground text-sm line-clamp-2 md:line-clamp-1">{course.description}</p>
              )}
              
              <div className="space-y-1 text-sm text-muted-foreground">
                {course.address && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    <span className="line-clamp-1">{[course.address, course.city, course.state].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Flag size={14} />
                    <span>{course.holes} {t("profile", "holes")}</span>
                    {course.par && <span>• {t("course", "par")} {course.par}</span>}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock size={14} className={isOpen ? "text-green-600" : "text-amber-600"} />
                    <span className={isOpen ? "text-green-600 font-medium" : "text-amber-600"}>
                      {isOpen ? t("home", "openNow") : t("home", "closed")}
                    </span>
                    <span className="text-muted-foreground hidden md:inline">
                      • {formattedHours}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CourseCard;
