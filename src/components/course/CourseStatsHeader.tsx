
import { Flag, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function CourseStatsHeader({ course }: any) {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-accent/20 rounded-lg">
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
    </div>
  )
}
