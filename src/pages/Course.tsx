
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Globe, Flag } from "lucide-react";

const Course = () => {
  const { id } = useParams();
  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('golf_courses')
        .select('*')
        .eq('id', id)
        .single();
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-left">{course.name}</h1>
      <Card>
        <CardContent className="p-6 space-y-6">
          {course.image_url ? (
            <img 
              src={course.image_url} 
              alt={course.name} 
              className="w-full h-64 object-cover rounded-lg" 
            />
          ) : (
            <div className="w-full h-64 bg-secondary/20 rounded-lg flex items-center justify-center text-muted-foreground">
              No image available
            </div>
          )}

          <div className="space-y-6 text-left">
            {course.description && (
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">About</h3>
                <p className="text-muted-foreground">{course.description}</p>
              </div>
            )}

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Flag className="text-primary mt-1" size={20} />
                <div>
                  <h3 className="font-semibold">Course Details</h3>
                  <p className="text-muted-foreground">
                    {course.holes} holes {course.par && `• Par ${course.par}`}
                  </p>
                </div>
              </li>

              {course.address && (
                <li className="flex items-start gap-3">
                  <MapPin className="text-primary mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold">Location</h3>
                    <p className="text-muted-foreground">
                      {[course.address, course.city, course.state].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </li>
              )}

              {course.phone && (
                <li className="flex items-start gap-3">
                  <Phone className="text-primary mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold">Contact</h3>
                    <p className="text-muted-foreground">{course.phone}</p>
                  </div>
                </li>
              )}

              {course.website && (
                <li className="flex items-start gap-3">
                  <Globe className="text-primary mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold">Website</h3>
                    <a 
                      href={course.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary hover:underline"
                    >
                      Visit website
                    </a>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Course;
