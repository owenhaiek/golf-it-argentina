import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Globe, Flag } from "lucide-react";
const Course = () => {
  const {
    id
  } = useParams();
  const {
    data: course,
    isLoading
  } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('golf_courses').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    }
  });
  if (isLoading) {
    return <div className="animate-pulse space-y-4">
        <div className="h-6 w-1/3 bg-secondary/20 rounded" />
        <div className="h-64 bg-secondary/20 rounded-lg" />
        <div className="space-y-2">
          <div className="h-4 w-2/3 bg-secondary/20 rounded" />
          <div className="h-4 w-1/2 bg-secondary/20 rounded" />
        </div>
      </div>;
  }
  if (!course) {
    return <div className="text-center">Course not found</div>;
  }
  return <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">{course.name}</h1>
      <Card className="overflow-hidden">
        <CardContent className="p-6 space-y-6">
          {course.image_url ? <img src={course.image_url} alt={course.name} className="w-full h-64 object-cover rounded-lg" /> : <div className="w-full h-64 bg-secondary/20 rounded-lg flex items-center justify-center text-muted-foreground">
              No image available
            </div>}
          
          {course.description && <p className="text-lg text-muted-foreground">{course.description}</p>}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-lg">
                <Flag className="text-primary" size={24} />
                <span>{course.holes} holes</span>
                {course.par && <span>• Par {course.par}</span>}
              </div>

              {course.address && <div className="flex items-center gap-3">
                  <MapPin className="text-primary" size={20} />
                  <span className="text-sm">{[course.address, course.city, course.state].filter(Boolean).join(', ')}</span>
                </div>}
            </div>

            <div className="space-y-4">
              {course.phone && <div className="flex items-center gap-3">
                  <Phone className="text-primary" size={20} />
                  <span className="text-sm">{course.phone}</span>
                </div>}
              
              {course.website && <div className="flex items-center gap-3">
                  <Globe className="text-primary" size={20} />
                  <a href={course.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Visit website
                  </a>
                </div>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default Course;