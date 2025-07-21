
import { useLanguage } from "@/contexts/LanguageContext";
import CourseSelector from "@/components/course/CourseSelector";

interface AddRoundStep1Props {
  courses: any[];
  isLoadingCourses: boolean;
  selectedCourse: string;
  onSelectCourse: (courseId: string) => void;
  onNext: () => void;
}

const AddRoundStep1 = ({ 
  courses, 
  isLoadingCourses, 
  selectedCourse, 
  onSelectCourse, 
  onNext 
}: AddRoundStep1Props) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {t("addRound", "selectCourse") || "Select Golf Course"}
        </h2>
        <p className="text-muted-foreground">
          {t("addRound", "chooseCourse") || "Choose the golf course where you played your round"}
        </p>
      </div>
      
      <CourseSelector
        courses={courses}
        isLoading={isLoadingCourses}
        selectedCourse={selectedCourse}
        onSelectCourse={onSelectCourse}
        placeholder={t("addRound", "searchCourse") || "Search and select golf course..."}
      />
      
      {selectedCourse && (
        <button
          onClick={onNext}
          className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          {t("common", "continue") || "Continue"}
        </button>
      )}
    </div>
  );
};

export default AddRoundStep1;
