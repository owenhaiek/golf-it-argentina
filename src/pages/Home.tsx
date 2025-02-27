
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Globe } from "lucide-react";

const Home = () => {
  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('golf_courses')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Golf Courses</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-40 bg-secondary/20 rounded-lg" />
                  <div className="h-4 w-2/3 bg-secondary/20 rounded" />
                  <div className="h-4 w-1/2 bg-secondary/20 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Golf Courses</h1>
      <div className="space-y-4">
        {courses?.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="space-y-4">
                {course.image_url ? (
                  <img
                    src={course.image_url}
                    alt={course.name}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-40 bg-secondary/20 rounded-lg flex items-center justify-center text-muted-foreground">
                    No image available
                  </div>
                )}
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">{course.name}</h2>
                  {course.description && (
                    <p className="text-muted-foreground line-clamp-2">{course.description}</p>
                  )}
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {course.address && (
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span>{[course.address, course.city, course.state].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                    {course.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={16} />
                        <span>{course.phone}</span>
                      </div>
                    )}
                    {course.website && (
                      <div className="flex items-center gap-2">
                        <Globe size={16} />
                        <a 
                          href={course.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Visit website
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{course.holes} holes</span>
                    {course.par && <span>Par {course.par}</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Home;
