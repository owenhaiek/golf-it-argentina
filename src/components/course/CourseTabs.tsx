
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, BarChart3, MessageSquare, Calendar, Flag } from "lucide-react";
import CourseStats from "./CourseStats";
import CourseReviews from "./CourseReviews";
import CourseHoleDetails from "./CourseHoleDetails";
import CourseMap from "./CourseMap";

interface CourseTabsProps {
  course: any;
  rounds: any[];
  isLoadingRounds: boolean;
  reviews: any[];
  isLoadingReviews: boolean;
  onReviewSuccess: () => void;
  language: string;
  courseId: string;
}

export const CourseTabs = ({
  course,
  rounds,
  isLoadingRounds,
  reviews,
  isLoadingReviews,
  onReviewSuccess,
  language,
  courseId
}: CourseTabsProps) => {
  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="details" className="flex items-center gap-1 text-xs">
          <Flag className="h-4 w-4" />
          <span className="hidden sm:inline">
            {language === "en" ? "Details" : "Detalles"}
          </span>
        </TabsTrigger>
        <TabsTrigger value="map" className="flex items-center gap-1 text-xs">
          <MapPin className="h-4 w-4" />
          <span className="hidden sm:inline">
            {language === "en" ? "Map" : "Mapa"}
          </span>
        </TabsTrigger>
        <TabsTrigger value="stats" className="flex items-center gap-1 text-xs">
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">
            {language === "en" ? "Stats" : "Stats"}
          </span>
        </TabsTrigger>
        <TabsTrigger value="reviews" className="flex items-center gap-1 text-xs">
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">
            {language === "en" ? "Reviews" : "Reseñas"}
          </span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="details" className="mt-6">
        <CourseHoleDetails
          coursePar={course.par}
          holes={course.holes}
          holePars={course.hole_pars}
          holeHandicaps={course.hole_handicaps}
        />
      </TabsContent>
      
      <TabsContent value="map" className="mt-6">
        <CourseMap
          latitude={course.latitude}
          longitude={course.longitude}
          name={course.name}
          courseId={courseId}
        />
      </TabsContent>
      
      <TabsContent value="stats" className="mt-6">
        <CourseStats
          rounds={rounds}
          isLoading={isLoadingRounds}
          coursePar={course.par}
          courseHolePars={course.hole_pars}
        />
      </TabsContent>
      
      <TabsContent value="reviews" className="mt-6">
        <CourseReviews
          courseId={course.id}
          reviews={reviews}
          isLoading={isLoadingReviews}
        />
      </TabsContent>
    </Tabs>
  );
};
