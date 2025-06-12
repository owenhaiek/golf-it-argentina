
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CourseSearch from "@/components/rounds/CourseSearch";
import ReservationForm from "@/components/course/ReservationForm";
import ReservationsList from "@/components/reservations/ReservationsList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";

const AddReservation = () => {
  const { t, language } = useLanguage();
  const [selectedCourse, setSelectedCourse] = useState<string>("");

  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('golf_courses')
        .select('id, name, holes, hole_pars, opening_hours, image_url, address, city, state, par')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  const selectedCourseData = courses?.find(course => course.id === selectedCourse);

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourse(courseId);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-shrink-0 p-4 bg-background border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">
          {language === "en" ? "Book Tee Time" : "Reservar Horario"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {language === "en" 
            ? "Make reservations and manage your bookings" 
            : "Hacer reservas y gestionar tus reservaciones"}
        </p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 pb-28">
          <Tabs defaultValue="book" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="book">
                {language === "en" ? "Book Tee Time" : "Reservar"}
              </TabsTrigger>
              <TabsTrigger value="manage">
                {language === "en" ? "My Reservations" : "Mis Reservas"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="book" className="space-y-6 mt-2">
              <CourseSearch 
                courses={courses}
                isLoading={isLoadingCourses}
                selectedCourse={selectedCourse}
                onSelectCourse={handleSelectCourse}
              />

              {selectedCourseData && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar size={20} />
                      {selectedCourseData.name}
                    </CardTitle>
                    <CardDescription>
                      {selectedCourseData.city}, {selectedCourseData.state}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReservationForm
                      courseId={selectedCourseData.id}
                      courseName={selectedCourseData.name}
                      courseLocation={`${selectedCourseData.city}, ${selectedCourseData.state}`}
                    />
                  </CardContent>
                </Card>
              )}

              {!selectedCourse && (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      {language === "en" ? "Select a Golf Course" : "Selecciona un Campo de Golf"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {language === "en" 
                        ? "Choose a golf course to book your tee time" 
                        : "Elige un campo de golf para reservar tu horario"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="manage" className="mt-2">
              <ReservationsList />
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
};

export default AddReservation;
