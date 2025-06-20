
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, Filter, MapPin, Users, Star, Clock, Calendar as CalendarIcon } from "lucide-react";
import { useGolfCourses } from "@/hooks/useGolfCourses";
import CourseCard from "@/components/home/CourseCard";
import { FilterContent } from "@/components/filters/FilterContent";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface FilterOptions {
  location: string;
  holes: string;
  favoritesOnly: boolean;
  isOpen: boolean;
}

const Search = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [search, setSearch] = useState(initialQuery);
  const [filters, setFilters] = useState<FilterOptions>({
    location: "",
    holes: "",
    favoritesOnly: false,
    isOpen: false
  });
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [showFilters, setShowFilters] = useState(false);

  const { courses, isLoading, currentTime } = useGolfCourses(search, filters);

  const handleClearFilters = () => {
    setFilters({
      location: "",
      holes: "",
      favoritesOnly: false,
      isOpen: false
    });
    setSelectedDate(undefined);
  };

  const activeFilterCount = Object.values(filters).filter(value => 
    typeof value === 'boolean' ? value : value !== ""
  ).length + (selectedDate ? 1 : 0);

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-shrink-0 p-4 bg-background border-b border-border">
        <h1 className="text-2xl font-bold text-foreground mb-4">Search Golf Courses</h1>
        
        <div className="space-y-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search courses, cities, or descriptions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-background border-border text-foreground"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="border border-border rounded-lg p-4 bg-muted/30">
              <FilterContent filters={filters} setFilters={setFilters} />
            </div>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 pb-28">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <Card className="max-w-md mx-auto">
              <CardContent className="text-center py-12">
                <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No courses found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Try adjusting your search terms or filters to find what you're looking for.
                </p>
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Found {courses.length} course{courses.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    currentTime={currentTime}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Search;
