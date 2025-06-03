
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import FilterPanel from "@/components/FilterPanel";
import CourseList from "@/components/home/CourseList";
import SearchBar from "@/components/home/SearchBar";
import ActiveFilterBadges from "@/components/home/ActiveFilterBadges";
import { useGolfCourses } from "@/hooks/useGolfCourses";

type FilterOptions = {
  holes: string;
  location: string;
  isOpen: boolean;
};

const Home = () => {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    holes: "",
    location: "",
    isOpen: false
  });

  const { courses, isLoading, currentTime } = useGolfCourses(search, filters);

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      holes: "",
      location: "",
      isOpen: false
    });
    setSearch("");
  };

  return (
    <div className="space-y-4 -mt-6 -mx-4">
      <div className="flex items-center justify-between px-4 pt-6">
        <h1 className="text-2xl font-bold">{t("home", "golfCourses")}</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsSearchVisible(!isSearchVisible)} 
            className="p-2 hover:bg-secondary/20 rounded-full transition-colors"
          >
            <Search size={20} />
          </button>
        </div>
      </div>

      <SearchBar 
        search={search}
        setSearch={setSearch}
        isVisible={isSearchVisible}
      />

      <ActiveFilterBadges 
        filters={filters}
        handleResetFilters={handleResetFilters}
      />

      <div className="space-y-6 pb-32">
        <CourseList 
          courses={courses}
          isLoading={isLoading}
          currentTime={currentTime}
          handleResetFilters={handleResetFilters}
        />
      </div>

      <Button 
        onClick={() => setIsFilterPanelOpen(true)} 
        size="icon" 
        className="fixed right-4 h-12 w-12 rounded-full shadow-lg z-[60] bg-primary hover:bg-primary/90"
        style={{
          bottom: `calc(76px + max(env(safe-area-inset-bottom, 0px), 8px))`
        }}
      >
        <Filter size={20} />
      </Button>

      <FilterPanel 
        isOpen={isFilterPanelOpen} 
        onClose={() => setIsFilterPanelOpen(false)} 
        onApplyFilters={handleApplyFilters} 
        currentFilters={filters} 
      />
    </div>
  );
};

export default Home;
