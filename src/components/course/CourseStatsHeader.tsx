
import { Flag, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function CourseStatsHeader({ course, averageRating, reviewCount }: any) {
  const { t, language } = useLanguage();
  return (
    <div className="grid grid-cols-3 gap-4 p-4 bg-accent/20 rounded-lg">
      <div className="text-center">
        <div className="flex items-center justify-center gap-1 text-primary mb-1">
          <Flag size={16} />
          <span className="font-semibold">{course.holes}</span>
        </div>
        <p className="text-xs text-muted-foreground">{t("profile", "holes")}</p>
      </div>

      {course.par && (
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-primary mb-1">
            <Flag size={16} />
            <span className="font-semibold">{course.par}</span>
          </div>
          <p className="text-xs text-muted-foreground">{t("course", "par")}</p>
        </div>
      )}

      <div className="text-center">
        <div className="flex items-center justify-center gap-1 text-primary mb-1">
          <Star size={16} />
          <span className="font-semibold">
            {averageRating > 0 ? averageRating.toFixed(1) : '--'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {reviewCount} {language === "en" ? "review" + (reviewCount !== 1 ? "s" : "") : "reseña" + (reviewCount !== 1 ? "s" : "")}
        </p>
      </div>
    </div>
  )
}
