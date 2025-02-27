
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Globe, Flag, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const Home = () => {
  const [search, setSearch] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses', search],
    queryFn: async () => {
      const query = supabase
        .from('golf_courses')
        .select('*')
        .order('name');
      
      if (search) {
        query.ilike('name', `%${search}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Golf Courses</h1>
          <button 
            onClick={() => setIsSearchVisible(!isSearchVisible)}
            className="p-2 hover:bg-secondary/20 rounded-full transition-colors"
          >
            <Search size={20} />
          </button>
        </div>
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Golf Courses</h1>
        <button 
          onClick={() => setIsSearchVisible(!isSearchVisible)}
          className="p-2 hover:bg-secondary/20 rounded-full transition-colors"
        >
          <Search size={20} />
        </button>
      </div>

      {isSearchVisible && (
        <div className="animate-in slide-in-from-top duration-300">
          <Input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
      )}

      <div className="space-y-4">
        {courses?.map((course) => (
          <Link to={`/course/${course.id}`} key={course.id}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
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
                      <div className="flex items-center gap-2 text-primary">
                        <Flag size={16} />
                        <span>{course.holes} holes</span>
                        {course.par && <span>• Par {course.par}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;
