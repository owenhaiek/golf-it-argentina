import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import CourseList from "@/components/home/CourseList";
import SearchBar from "@/components/home/SearchBar";
import FilterPanel from "@/components/FilterPanel";
import ActiveFilterBadges from "@/components/home/ActiveFilterBadges";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Trophy, Filter, X } from "lucide-react";
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

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState<GolfCourse[]>([]);
  const [activeFilters, setActiveFilters] = useState<{ [key: string]: string }>({});
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const { user } = useAuth();

  const { data: allCourses, isLoading } = useQuery({
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

  useEffect(() => {
    if (allCourses) {
      setCourses(allCourses);
    }
  }, [allCourses]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (filterName: string, filterValue: string) => {
    setActiveFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: filterValue
    }));
  };

  const handleClearFilter = (filterName: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[filterName];
    setActiveFilters(newFilters);
  };

  const filteredCourses = courses?.filter(course => {
    const searchTermMatch = course.name.toLowerCase().includes(searchTerm.toLowerCase());
    const cityMatch = !activeFilters.city || course.city === activeFilters.city;
    const holesMatch = !activeFilters.holes || course.holes === parseInt(activeFilters.holes);
    return searchTermMatch && cityMatch && holesMatch;
  });

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-shrink-0 p-4 bg-white border-b">
        <h1 className="text-2xl font-bold">Golf Courses</h1>
      </div>
      
      <div className="p-4 space-y-4">
        <SearchBar onSearch={handleSearch} />

        <Collapsible>
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </CollapsibleTrigger>
            <ActiveFilterBadges
              activeFilters={activeFilters}
              onClearFilter={handleClearFilter}
            />
          </div>
          <CollapsibleContent className="pl-4 mt-2">
            <FilterPanel onFilterChange={handleFilterChange} />
          </CollapsibleContent>
        </Collapsible>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 pb-28">
          <CourseList courses={filteredCourses} isLoading={isLoading} />
        </div>
      </ScrollArea>
    </div>
  );
};

export default Home;
