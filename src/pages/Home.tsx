
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Globe, Flag, Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FilterPanel from "@/components/FilterPanel";

type FilterOptions = {
  holes: string;
  location: string;
};

const Home = () => {
  const [search, setSearch] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    holes: "",
    location: ""
  });

  const {
    data: courses,
    isLoading
  } = useQuery({
    queryKey: ['courses', search, filters],
    queryFn: async () => {
      let query = supabase.from('golf_courses').select('*').order('name');
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      // Apply filters
      if (filters.holes) {
        query = query.eq('holes', parseInt(filters.holes));
      }
      if (filters.location) {
        query = query.or(`city.ilike.%${filters.location}%,state.ilike.%${filters.location}%`);
      }
      const {
        data,
        error
      } = await query;
      if (error) throw error;
      return data;
    }
  });

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      holes: "",
      location: ""
    });
    setSearch("");
  };

  const hasActiveFilters = filters.holes || filters.location;

  return <div className="space-y-4 -mt-6 -mx-4">
      <div className="flex items-center justify-between px-4 pt-6">
        <h1 className="text-2xl font-bold">Golf Courses</h1>
        <div className="flex gap-2">
          <button onClick={() => setIsSearchVisible(!isSearchVisible)} className="p-2 hover:bg-secondary/20 rounded-full transition-colors">
            <Search size={20} />
          </button>
        </div>
      </div>

      {isSearchVisible && <div className="animate-in slide-in-from-top duration-300 px-4">
          <Input type="text" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} className="w-full" />
        </div>}

      {/* Active filters indicator with reset button */}
      {hasActiveFilters && <div className="px-4">
          <div className="flex justify-between items-center">
            <div className="flex flex-wrap gap-2">
              {filters.holes && <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  {filters.holes} Holes
                </div>}
              {filters.location && <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  Location: {filters.location}
                </div>}
            </div>
            <Button variant="ghost" size="icon" onClick={handleResetFilters} className="rounded-full">
              <X size={18} />
            </Button>
          </div>
        </div>}

      <div className="space-y-6">
        {isLoading ?
      // Loading skeleton
      [1, 2, 3].map(i => <Card key={i} className="overflow-hidden rounded-none border-x-0">
              <CardContent className="p-0">
                <div className="animate-pulse space-y-3">
                  <div className="h-48 bg-secondary/20" />
                  <div className="p-4">
                    <div className="h-4 w-2/3 bg-secondary/20 rounded mb-2" />
                    <div className="h-4 w-1/2 bg-secondary/20 rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>) : courses?.map(course => <Link to={`/course/${course.id}`} key={course.id} className="block">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow rounded-none border-x-0">
                <CardContent className="p-0">
                  <div>
                    {course.image_url ? <img src={course.image_url} alt={course.name} className="w-full h-48 object-cover" /> : <div className="w-full h-48 bg-secondary/20 flex items-center justify-center text-muted-foreground">
                        No image available
                      </div>}
                    <div className="p-4 space-y-2">
                      <h2 className="text-xl font-semibold">{course.name}</h2>
                      {course.description && <p className="text-muted-foreground line-clamp-2">{course.description}</p>}
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {course.address && <div className="flex items-center gap-2">
                            <MapPin size={16} />
                            <span>{[course.address, course.city, course.state].filter(Boolean).join(', ')}</span>
                          </div>}
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
            </Link>)}

        {courses?.length === 0 && !isLoading && <div className="text-center py-8 text-muted-foreground">
            <p>No courses found matching your criteria</p>
            <Button variant="outline" className="mt-2" onClick={handleResetFilters}>
              Reset filters
            </Button>
          </div>}
      </div>

      {/* Floating filter button - adjusted position to be higher */}
      <Button onClick={() => setIsFilterPanelOpen(true)} size="icon" className="fixed right-4 bottom-24 h-12 w-12 rounded-full shadow-lg py-0 my-[5px]">
        <Filter size={20} />
      </Button>

      {/* Filter Panel */}
      <FilterPanel isOpen={isFilterPanelOpen} onClose={() => setIsFilterPanelOpen(false)} onApplyFilters={handleApplyFilters} currentFilters={filters} />
    </div>;
};

export default Home;
