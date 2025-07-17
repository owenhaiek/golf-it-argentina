
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import CourseList from "@/components/home/CourseList";
import SearchBar from "@/components/home/SearchBar";
import FilterPanel from "@/components/FilterPanel";
import ActiveFilterBadges from "@/components/home/ActiveFilterBadges";
import { Button } from "@/components/ui/button";
import { Filter, Search } from "lucide-react";
import { useGolfCourses } from "@/hooks/useGolfCourses";

interface FilterOptions {
  location: string;
  holes: string;
  favoritesOnly: boolean;
  isOpen: boolean;
  minRating: number;
}

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    location: "",
    holes: "",
    favoritesOnly: false,
    isOpen: false,
    minRating: 0
  });
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const { user } = useAuth();

  // Use the useGolfCourses hook instead of local filtering
  const { courses, isLoading, currentTime } = useGolfCourses(searchTerm, activeFilters);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (filters: FilterOptions) => {
    setActiveFilters(filters);
  };

  const handleClearFilter = (filterName: string) => {
    const newFilters = {
      ...activeFilters
    };
    if (filterName === 'location') newFilters.location = "";
    if (filterName === 'holes') newFilters.holes = "";
    if (filterName === 'favoritesOnly') newFilters.favoritesOnly = false;
    if (filterName === 'isOpen') newFilters.isOpen = false;
    if (filterName === 'minRating') newFilters.minRating = 0;
    setActiveFilters(newFilters);
  };

  const handleResetFilters = () => {
    setActiveFilters({
      location: "",
      holes: "",
      favoritesOnly: false,
      isOpen: false,
      minRating: 0
    });
    setSearchTerm("");
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Sticky Header with logo, title and search */}
      <div className="flex-shrink-0 p-4 bg-background border-b border-border sticky top-0 z-40 touch-none">
        <div className="flex items-center justify-between gap-3">
          {/* Logo and Title - always visible */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 relative">
              <img src="/lovable-uploads/419a6f14-cf7f-486d-b411-be08939987f8.png" alt="Golf App Logo" className="w-full h-full object-contain rounded-full" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">GolfIt</h1>
          </div>
          
          {/* Search Input - slides in when active, replacing search icon */}
          {isSearchVisible ? (
            <div className="flex-1 max-w-xs">
              <SearchBar search={searchTerm} setSearch={handleSearch} isVisible={isSearchVisible} onClose={() => setIsSearchVisible(false)} />
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setIsSearchVisible(true)} className="flex-shrink-0">
              <Search className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        {/* Active Filter Badges */}
        <ActiveFilterBadges filters={activeFilters} handleResetFilters={handleResetFilters} />
      </div>

      <ScrollArea className="flex-1">
        {/* Mobile: no padding left/right, Desktop: normal padding */}
        <div className="py-4 px-0 md:p-4 pb-28">
          <CourseList courses={courses} isLoading={isLoading} currentTime={currentTime} handleResetFilters={handleResetFilters} />
        </div>
      </ScrollArea>

      {/* Floating Filter Button - made fully circular */}
      <div className="fixed bottom-24 right-4 z-50">
        <Button onClick={() => setIsFilterPanelOpen(true)} size="icon" className="rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90">
          <Filter className="h-6 w-6" />
        </Button>
      </div>

      {/* Filter Panel */}
      <FilterPanel isOpen={isFilterPanelOpen} onClose={() => setIsFilterPanelOpen(false)} onApplyFilters={handleFilterChange} currentFilters={activeFilters} />
    </div>
  );
};

export default Home;
