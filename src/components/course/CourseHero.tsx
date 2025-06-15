
import { Button } from "@/components/ui/button";
import { ArrowLeft, Flag, MapPin } from "lucide-react";
import FavoriteButton from "@/components/ui/FavoriteButton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export const CourseHero = ({ course, language, isOpen }: any) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const courseImages = [];
  if (course.image_url) courseImages.push(course.image_url);
  if (course.image_gallery) {
    const galleryImages = course.image_gallery.split(',').map((url: string) => url.trim()).filter((url: string) => url !== '');
    courseImages.push(...galleryImages);
  }

  return (
    <div className="relative w-full h-80 sm:h-96 md:h-[28rem]">
      {courseImages.length > 0 ? (
        <img
          src={courseImages[0]}
          alt={course.name}
          className="w-full h-full object-cover"
          onError={e => (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Golf+Course'}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
          <Flag className="h-16 w-16 text-white opacity-50" />
        </div>
      )}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === "en" ? "Back" : "Volver"}
          </Button>
          <div className="flex items-center gap-2">
            <FavoriteButton courseId={course.id} size="sm" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{course.name}</h1>
        <div className="flex items-center gap-4 text-white/90">
          {course.address && (
            <div className="flex items-center gap-1 text-sm">
              <MapPin size={16} />
              <span>{course.city}, {course.state}</span>
            </div>
          )}
          <Badge
            variant={isOpen ? "default" : "secondary"}
            className={cn(
              "text-xs font-medium",
              isOpen ? "bg-green-500 hover:bg-green-600" : "bg-amber-500 hover:bg-amber-600"
            )}
          >
            {isOpen ? t("home", "openNow") : t("home", "closed")}
          </Badge>
        </div>
      </div>
    </div>
  );
};
