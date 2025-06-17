import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import CourseCard from "./CourseCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Filter } from "lucide-react";
import FilterPanel from "../FilterPanel";
import ActiveFilterBadges from "./ActiveFilterBadges";
interface CourseListProps {
  searchQuery?: string;
  selectedFilters?: {
    location: string;
    holes: string;
    status: string;
    favorites: boolean;
  };
  onFiltersChange?: (filters: any) => void;
}
const CourseList = ({
  searchQuery = "",
  selectedFilters,
  onFiltersChange
}: CourseListProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const {
    data: courses = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['golf_courses', localSearchQuery, selectedFilters],
    queryFn: async () => {
      console.log("Fetching courses with query:", localSearchQuery, "and filters:", selectedFilters);
      let query = supabase.from('golf_courses').select('*').order('name');

      // Apply search filter
      if (localSearchQuery.trim()) {
        query = query.or(`name.ilike.%${localSearchQuery}%,city.ilike.%${localSearchQuery}%,state.ilike.%${localSearchQuery}%`);
      }

      // Apply location filter
      if (selectedFilters?.location) {
        query = query.or(`city.ilike.%${selectedFilters.location}%,state.ilike.%${selectedFilters.location}%`);
      }

      // Apply holes filter
      if (selectedFilters?.holes && selectedFilters.holes !== 'all') {
        const holesValue = parseInt(selectedFilters.holes);
        query = query.eq('holes', holesValue);
      }
      const {
        data,
        error
      } = await query;
      if (error) {
        console.error("Error fetching courses:", error);
        throw error;
      }
      console.log("Fetched courses:", data?.length || 0);
      return data || [];
    }
  });
  const handleSearch = () => {
    // Search is handled automatically by the query when localSearchQuery changes
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  if (isLoading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
            <div className="bg-gray-200 rounded h-4 mb-2"></div>
            <div className="bg-gray-200 rounded h-4 w-2/3"></div>
          </div>)}
      </div>;
  }
  if (error) {
    return <div className="text-center py-8">
        <p className="text-muted-foreground">Error loading courses. Please try again.</p>
      </div>;
  }
  return <div className="space-y-6">
      {/* Search and Filter Controls */}
      

      {/* Active Filter Badges */}
      {selectedFilters && <ActiveFilterBadges filters={selectedFilters} onFiltersChange={onFiltersChange} />}

      {/* Filter Panel */}
      {showFilters && <FilterPanel selectedFilters={selectedFilters} onFiltersChange={onFiltersChange} onClose={() => setShowFilters(false)} />}

      {/* Course Grid - Updated for 4 columns on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {courses.map(course => <CourseCard key={course.id} course={course} />)}
      </div>

      {courses.length === 0 && !isLoading && <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No courses found</h3>
          <p className="text-muted-foreground">
            {localSearchQuery || selectedFilters?.location || selectedFilters?.holes !== 'all' ? "Try adjusting your search criteria or filters" : "No golf courses available at the moment"}
          </p>
        </div>}
    </div>;
};
export default CourseList;