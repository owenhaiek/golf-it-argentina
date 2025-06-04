
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CourseCard from "./CourseCard";

interface CourseListProps {
  courses: any[] | null;
  isLoading: boolean;
  currentTime: Date;
  handleResetFilters: () => void;
}

const CourseList = ({ courses, isLoading, currentTime, handleResetFilters }: CourseListProps) => {
  const { t } = useLanguage();
  
  if (isLoading) {
    return (
      <div className="md:grid md:grid-cols-2 md:gap-6 space-y-6 md:space-y-0">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="overflow-hidden rounded-none border-x-0 md:rounded-lg md:border-x">
            <CardContent className="p-0">
              <div className="animate-pulse space-y-3">
                <div className="h-48 bg-secondary/20" />
                <div className="p-4">
                  <div className="h-4 w-2/3 bg-secondary/20 rounded mb-2" />
                  <div className="h-4 w-1/2 bg-secondary/20 rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
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
    <div className="md:grid md:grid-cols-2 md:gap-6 space-y-6 md:space-y-0">
      {courses.map(course => (
        <CourseCard key={course.id} course={course} currentTime={currentTime} />
      ))}
    </div>
  );
};

export default CourseList;
