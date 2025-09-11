
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CourseStats from "@/components/course/CourseStats";
import CourseMap from "@/components/course/CourseMap";
import CourseHoleDetails from "@/components/course/CourseHoleDetails";
import CourseWeather from "@/components/course/CourseWeather";
import AddReviewForm from "@/components/course/AddReviewForm";
import CourseReviews from "@/components/course/CourseReviews";

export function CourseTabs({ course, rounds, isLoadingRounds, reviews, isLoadingReviews, onReviewSuccess, language }: any) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4 text-xs">
        <TabsTrigger value="overview">{language === "en" ? "Overview" : "Resumen"}</TabsTrigger>
        <TabsTrigger value="holes">{language === "en" ? "Holes" : "Hoyos"}</TabsTrigger>
        <TabsTrigger value="weather">{language === "en" ? "Weather" : "Clima"}</TabsTrigger>
        <TabsTrigger value="reviews">{language === "en" ? "Reviews" : "Reseñas"}</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4 mt-4">
        <CourseStats rounds={rounds} isLoading={isLoadingRounds} coursePar={course.par} />
        {course.latitude && course.longitude && (
          <CourseMap 
            latitude={course.latitude} 
            longitude={course.longitude} 
            name={course.name}
            courseId={course.id}
          />
        )}
      </TabsContent>
      <TabsContent value="holes" className="mt-4">
        <CourseHoleDetails 
          coursePar={course.par} 
          holes={course.holes}
          holePars={course.hole_pars}
          holeHandicaps={course.hole_handicaps}
        />
      </TabsContent>
      <TabsContent value="weather" className="mt-4">
        <CourseWeather
          latitude={course.latitude}
          longitude={course.longitude}
        />
      </TabsContent>
      <TabsContent value="reviews" className="space-y-4 mt-4">
        <AddReviewForm 
          courseId={course.id} 
          onSuccess={onReviewSuccess}
          onCancel={() => {}}
        />
        <CourseReviews
          courseId={course.id}
          reviews={reviews}
          isLoading={isLoadingReviews}
        />
      </TabsContent>
    </Tabs>
  );
}
