
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CourseCard from "./CourseCard";
import GolfAnimationLoader from "@/components/ui/GolfAnimationLoader";

interface CourseListProps {
  courses: any[] | null;
  isLoading: boolean;
  currentTime: Date;
  handleResetFilters: () => void;
}

const CourseList = ({ courses, isLoading, currentTime, handleResetFilters }: CourseListProps) => {
  const { t } = useLanguage();
  
  if (isLoading) {
    return <GolfAnimationLoader />;
  }

  if (!courses?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{t("home", "noCoursesFound")}</p>
        <Button variant="outline" className="mt-2" onClick={handleResetFilters}>
          {t("home", "resetFilters")}
        </Button>
      </div>
    );
  }

  return (
    <div className="mobile-course-list md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
      {courses.map(course => (
        <div key={course.id} className="mobile-course-card">
          <CourseCard course={course} currentTime={currentTime} />
        </div>
      ))}
    </div>
  );
};

export default CourseList;
