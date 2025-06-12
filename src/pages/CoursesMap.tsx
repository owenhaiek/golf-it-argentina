import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import CourseInfoTab from "@/components/map/CourseInfoTab";
import CourseMarker from "@/components/map/CourseMarker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, List, Loader2 } from "lucide-react";

interface GolfCourse {
  id: string;
  name: string;
  city?: string;
  state?: string;
  par?: number;
  holes: number;
  description?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  phone?: string;
  website?: string;
  opening_hours?: any;
  hole_pars?: number[];
  hole_distances?: number[];
  hole_handicaps?: number[];
  image_gallery?: string;
  established_year?: number;
  type?: string;
}

const CoursesMap = () => {
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null);

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('golf_courses')
        .select('*')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  const handleMarkerClick = (course: GolfCourse) => {
    setSelectedCourse(course);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-shrink-0 p-4 bg-white border-b">
        <h1 className="text-2xl font-bold">Golf Courses Map</h1>
      </div>
      
      <Tabs defaultValue="map" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="map" className="flex items-center justify-center gap-2">
            <MapPin className="h-4 w-4" />
            Map View
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center justify-center gap-2">
            <List className="h-4 w-4" />
            List View
          </TabsTrigger>
        </TabsList>
        
        <div className="flex-1 relative overflow-hidden">
          <TabsContent value="map" className="absolute inset-0 flex-1 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="h-full w-full">
                {courses && courses.length > 0 ? (
                  <CourseMarker courses={courses} onMarkerClick={handleMarkerClick} />
                ) : (
                  <Card className="max-w-md mx-auto mt-10">
                    <CardContent className="text-center">
                      No courses found.
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="list" className="absolute inset-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : courses && courses.length > 0 ? (
                  courses.map(course => (
                    <Card key={course.id} onClick={() => handleMarkerClick(course)} className="cursor-pointer">
                      <CardHeader>
                        <CardTitle>{course.name}</CardTitle>
                        <CardContent>
                          {course.city}, {course.state}
                        </CardContent>
                      </CardHeader>
                    </Card>
                  ))
                ) : (
                  <Card className="max-w-md mx-auto">
                    <CardContent className="text-center">
                      No courses found.
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>

      {selectedCourse && (
        <CourseInfoTab course={selectedCourse} onClose={() => setSelectedCourse(null)} />
      )}
    </div>
  );
};

export default CoursesMap;
