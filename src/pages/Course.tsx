import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GolfCourseDetails } from "@/components/course/GolfCourseDetails";
import { ReservationForm } from "@/components/course/ReservationForm";
import { Calendar, Clock, MapPin, Phone, Globe, Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { isOpenNow, formatOpeningHours, OpeningHours } from "@/utils/openingHours";

// Create interface for the golf course data
interface GolfCourse {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  website: string;
  description: string;
  holes: number;
  par: number;
  image_url: string;
  opening_hours: OpeningHours | null;
  created_at: string;
  updated_at: string;
  hole_pars: number[] | null;
}

const Course = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<GolfCourse | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;

      const { data: response, error } = await supabase
        .from("golf_courses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching course:", error);
        return;
      }

      // Make sure to properly cast or handle the opening_hours data from the database
      // For example, when fetching:

      // When using openingHours data, ensure it's properly cast to OpeningHours type:
      const course = response as GolfCourse;
      // Handle the opening_hours data type checking
      if (course && course.opening_hours) {
        course.opening_hours = course.opening_hours as unknown as OpeningHours;
      }

      setCourse(course);
    };

    fetchCourse();
  }, [id]);

  if (!course) {
    return <div>Loading course data...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <div className="relative">
          <img
            src={course.image_url}
            alt={course.name}
            className="rounded-md w-full h-64 object-cover object-center"
          />
          <div className="absolute bottom-0 left-0 p-4 w-full bg-gradient-to-t from-black/80 to-transparent text-white">
            <h1 className="text-3xl font-bold">{course.name}</h1>
            <p className="text-sm">{course.address}, {course.city}, {course.state}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="w-full flex justify-center">
          <TabsTrigger value="details">{t("course", "details")}</TabsTrigger>
          <TabsTrigger value="book">{t("course", "book")}</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="space-y-4">
          <GolfCourseDetails course={course} />
        </TabsContent>
        <TabsContent value="book" className="space-y-4">
          <ReservationForm courseId={course.id} courseName={course.name} courseLocation={`${course.city}, ${course.state}`} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Course;
