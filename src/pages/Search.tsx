
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, MapPin, Star, Filter, X, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import FilterPanel from "@/components/FilterPanel";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('golf_courses')
        .select('*');

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Course fetch error:", error);
        throw error;
      }
      return data || [];
    },
  });

  const handleCourseClick = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  const handleApplyFilters = (filterName: string, filterValue: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: filterValue
    }));
  };

  const handleCloseFilters = () => {
    // Close filter functionality if needed
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search and Filter Section */}
        <div className="w-full md:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <SearchIcon size={20} />
                Search Courses
              </CardTitle>
              <CardDescription>
                Find your next golf adventure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="text"
                placeholder="Search by course name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filter
                    </div>
                    <Filter className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                  <FilterPanel 
                    isOpen={true}
                    onClose={handleCloseFilters}
                    onApplyFilters={handleApplyFilters}
                    currentFilters={filters}
                  />
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="w-full md:w-3/4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Results
              </CardTitle>
              <CardDescription>
                {courses.length} courses found
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {isLoading ? (
                  <div className="p-4 text-center">Loading courses...</div>
                ) : courses.length > 0 ? (
                  <div className="divide-y">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className="p-4 hover:bg-secondary/50 cursor-pointer"
                        onClick={() => handleCourseClick(course.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{course.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {course.city && course.state && (
                                <>
                                  <MapPin className="h-4 w-4" />
                                  {course.city}, {course.state}
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {course.par && (
                              <Badge variant="secondary">
                                <Star className="h-4 w-4 mr-1" />
                                Par {course.par}
                              </Badge>
                            )}
                            <Badge>
                              <CalendarDays className="h-4 w-4 mr-1" />
                              {course.holes} Holes
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center">No courses found.</div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Search;
