
import { Link } from "react-router-dom";
import { MapPin, Flag, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { isCurrentlyOpen, formatOpeningHours } from "@/utils/openingHours";
import CourseImageCarousel from "./CourseImageCarousel";

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
    
    // If no images, return a placeholder
    return images.length > 0 ? images : [];
  };

  const courseImages = getCourseImages(course);
  
  let courseOpeningHours;
  try {
    courseOpeningHours = course.opening_hours ? JSON.parse(course.opening_hours) : null;
  } catch (error) {
    console.error("Error parsing opening hours for course:", course.name, error);
    courseOpeningHours = null;
  }
  
  const isOpen = isCurrentlyOpen(courseOpeningHours);
  const formattedHours = formatOpeningHours(courseOpeningHours);
  
  return (
    <Link to={`/course/${course.id}`} className="block">
      <Card className="overflow-hidden hover:shadow-lg transition-shadow rounded-none border-x-0">
        <CardContent className="p-0">
          <div>
            {courseImages.length > 0 ? (
              <CourseImageCarousel 
                images={courseImages} 
                courseName={course.name} 
                courseId={course.id} 
              />
            ) : (
              <div className="w-full h-48 bg-secondary/20 flex items-center justify-center text-muted-foreground">
                {t("home", "noImageAvailable")}
              </div>
            )}
            
            <div className="p-4 space-y-2">
              <h2 className="text-xl font-semibold">{course.name}</h2>
              
              {course.description && <p className="text-muted-foreground line-clamp-2">{course.description}</p>}
              
              <div className="space-y-1 text-sm text-muted-foreground">
                {course.address && <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{[course.address, course.city, course.state].filter(Boolean).join(', ')}</span>
                  </div>}
                
                <div className="flex items-center gap-2 text-primary">
                  <Flag size={16} />
                  <span>{course.holes} {t("profile", "holes")}</span>
                  {course.par && <span>• {t("course", "par")} {course.par}</span>}
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock size={16} className={isOpen ? "text-green-600" : "text-amber-600"} />
                  <div>
                    <span className={isOpen ? "text-green-600 font-medium" : "text-amber-600"}>
                      {isOpen ? t("home", "openNow") : t("home", "closed")}
                    </span>
                    <span className="text-muted-foreground ml-1">
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
