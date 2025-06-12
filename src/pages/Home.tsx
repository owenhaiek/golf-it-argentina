
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
import { MapPin, Calendar, Trophy, Filter, X, Search } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AppLogo } from "@/components/ui/AppLogo";

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
  hole_handicaps?: number[];
  image_gallery?: string;
  established_year?: number;
  type?: string;
}

interface FilterOptions {
  location: string;
  holes: string;
  favoritesOnly: boolean;
  isOpen: boolean;
}

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState<GolfCourse[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    location: "",
    holes: "",
    favoritesOnly: false,
    isOpen: false
  });
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const { user } = useAuth();
  const currentTime = new Date();

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

  const handleFilterChange = (filters: FilterOptions) => {
    setActiveFilters(filters);
  };

  const handleClearFilter = (filterName: string) => {
    const newFilters = { ...activeFilters };
    if (filterName === 'location') newFilters.location = "";
    if (filterName === 'holes') newFilters.holes = "";
    if (filterName === 'favoritesOnly') newFilters.favoritesOnly = false;
    if (filterName === 'isOpen') newFilters.isOpen = false;
    setActiveFilters(newFilters);
  };

  const handleResetFilters = () => {
    setActiveFilters({
      location: "",
      holes: "",
      favoritesOnly: false,
      isOpen: false
    });
    setSearchTerm("");
  };

  const filteredCourses = courses?.filter(course => {
    const searchTermMatch = course.name.toLowerCase().includes(searchTerm.toLowerCase());
    const cityMatch = !activeFilters.location || course.city?.toLowerCase().includes(activeFilters.location.toLowerCase());
    const holesMatch = !activeFilters.holes || course.holes === parseInt(activeFilters.holes);
    return searchTermMatch && cityMatch && holesMatch;
  });

  return (
    <div className="h-screen flex flex-col">
      {/* Header with logo, title and search */}
      <div className="flex-shrink-0 p-4 bg-background border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AppLogo size="md" />
            <h1 className="text-2xl font-bold text-foreground">GolfIt</h1>
          </div>
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        <SearchBar search={searchTerm} setSearch={setSearchTerm} isVisible={true} />

        <Collapsible>
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="lg" className="rounded-full h-20 w-20 p-0">
                <Filter className="h-8 w-8" />
              </Button>
            </CollapsibleTrigger>
            <ActiveFilterBadges
              filters={activeFilters}
              handleResetFilters={handleResetFilters}
            />
          </div>
          <CollapsibleContent className="pl-4 mt-2">
            <FilterPanel 
              isOpen={true}
              onClose={() => {}}
              onApplyFilters={handleFilterChange}
              currentFilters={activeFilters}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 pb-28">
          <CourseList 
            courses={filteredCourses} 
            isLoading={isLoading} 
            currentTime={currentTime}
            handleResetFilters={handleResetFilters}
          />
        </div>
      </ScrollArea>
    </div>
  );
};

export default Home;
