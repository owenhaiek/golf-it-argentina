
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
      <div className="h-64 bg-secondary/20 rounded-none" />
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
    <div className="space-y-6 -mx-4">
      <h1 className="text-2xl font-bold text-left px-4">{course.name}</h1>
      
      {course.image_url ? (
        <img 
          src={course.image_url} 
          alt={course.name} 
          className="w-full h-64 object-cover" 
        />
      ) : (
        <div className="w-full h-64 bg-secondary/20 flex items-center justify-center text-muted-foreground">
          No image available
        </div>
      )}

      <Card className="border-0 shadow-none mx-4">
        <CardContent className="p-4 space-y-6">
          {course.description && (
            <div className="space-y-1">
              <h3 className="font-semibold text-base">About</h3>
              <p className="text-sm text-muted-foreground">{course.description}</p>
            </div>
          )}

          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <Flag className="text-primary mt-1" size={18} />
              <div>
                <h3 className="font-semibold text-sm">Course Details</h3>
                <p className="text-xs text-muted-foreground">
                  {course.holes} holes {course.par && `• Par ${course.par}`}
                </p>
              </div>
            </li>

            {course.address && (
              <li className="flex items-start gap-3">
                <MapPin className="text-primary mt-1" size={18} />
                <div>
                  <h3 className="font-semibold text-sm">Location</h3>
                  <p className="text-xs text-muted-foreground">
                    {[course.address, course.city, course.state].filter(Boolean).join(', ')}
                  </p>
                </div>
              </li>
            )}

            {course.phone && (
              <li className="flex items-start gap-3">
                <Phone className="text-primary mt-1" size={18} />
                <div>
                  <h3 className="font-semibold text-sm">Contact</h3>
                  <p className="text-xs text-muted-foreground">{course.phone}</p>
                </div>
              </li>
            )}

            {course.website && (
              <li className="flex items-start gap-3">
                <Globe className="text-primary mt-1" size={18} />
                <div>
                  <h3 className="font-semibold text-sm">Website</h3>
                  <a 
                    href={course.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-primary hover:underline"
                  >
                    Visit website
                  </a>
                </div>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Course;
