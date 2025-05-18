
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Globe, Flag, Search, Filter, X, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FilterPanel from "@/components/FilterPanel";
import { useLanguage } from "@/contexts/LanguageContext";
import { isCurrentlyOpen } from "@/utils/openingHours";

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
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [imageIndexes, setImageIndexes] = useState<Record<string, number>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const formatOpeningHours = (openHours: string | null): string => {
    if (!openHours) return "Hours not available";
    try {
      const today = currentTime.getDay();
      const hours = JSON.parse(openHours);
      if (!hours[today === 0 ? 6 : today - 1]) return "Hours not available";
      if (!hours[today === 0 ? 6 : today - 1].isOpen) return "Closed today";
      return `${hours[today === 0 ? 6 : today - 1].open} - ${hours[today === 0 ? 6 : today - 1].close}`;
    } catch (error) {
      console.error("Error formatting opening hours:", error);
      return "Hours not available";
    }
  };

  const {
    data: courses,
    isLoading
  } = useQuery({
    queryKey: ['courses', search, filters, currentTime],
    queryFn: async () => {
      let query = supabase.from('golf_courses').select('*').order('name');
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

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

      if (filters.isOpen) {
        return data.filter(course => {
          try {
            const openingHours = course.opening_hours ? JSON.parse(course.opening_hours) : null;
            return isCurrentlyOpen(openingHours);
          } catch (error) {
            console.error("Error parsing opening hours:", error);
            return false;
          }
        });
      }
      return data;
    }
  });

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

  const hasActiveFilters = filters.holes || filters.location || filters.isOpen;

  // Helper function to get all images for a course
  const getCourseImages = (course: any): string[] => {
    const images: string[] = [];
    
    // If there's an image_url, add it first
    if (course.image_url) {
      images.push(course.image_url);
    }
    
    // If there's a gallery, add those images
    if (course.image_gallery) {
      const galleryImages = course.image_gallery.split(',').map((url: string) => url.trim()).filter((url: string) => url !== '');
      images.push(...galleryImages);
    }
    
    // If no images, return a placeholder
    return images.length > 0 ? images : [];
  };

  const handlePrevImage = (courseId: string, imagesLength: number) => {
    setImageIndexes(prev => ({
      ...prev,
      [courseId]: (prev[courseId] - 1 + imagesLength) % imagesLength
    }));
  };

  const handleNextImage = (courseId: string, imagesLength: number) => {
    setImageIndexes(prev => ({
      ...prev,
      [courseId]: (prev[courseId] + 1) % imagesLength
    }));
  };

  return <div className="space-y-4 -mt-6 -mx-4">
      <div className="flex items-center justify-between px-4 pt-6">
        <h1 className="text-2xl font-bold">{t("home", "golfCourses")}</h1>
        <div className="flex gap-2">
          <button onClick={() => setIsSearchVisible(!isSearchVisible)} className="p-2 hover:bg-secondary/20 rounded-full transition-colors">
            <Search size={20} />
          </button>
        </div>
      </div>

      {isSearchVisible && <div className="animate-in slide-in-from-top duration-300 px-4">
          <Input type="text" placeholder={t("common", "search")} value={search} onChange={e => setSearch(e.target.value)} className="w-full" />
        </div>}

      {hasActiveFilters && <div className="px-4">
          <div className="flex justify-between items-center">
            <div className="flex flex-wrap gap-2">
              {filters.holes && <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  {filters.holes} {t("profile", "holes")}
                </div>}
              {filters.location && <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  {t("course", "location")}: {filters.location}
                </div>}
              {filters.isOpen && <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <Clock size={14} />
                  {t("home", "openNow")}
                </div>}
            </div>
            <Button variant="ghost" size="icon" onClick={handleResetFilters} className="rounded-full">
              <X size={18} />
            </Button>
          </div>
        </div>}

      <div className="space-y-6 pb-20">
        {isLoading ?
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
            </Card>) : courses?.map(course => {
              const courseImages = getCourseImages(course);
              // Initialize image index for this course if not already set
              if (imageIndexes[course.id] === undefined && courseImages.length > 0) {
                setImageIndexes(prev => ({...prev, [course.id]: 0}));
              }
              const currentImageIndex = imageIndexes[course.id] || 0;
              
              let courseOpeningHours;
              try {
                courseOpeningHours = course.opening_hours ? JSON.parse(course.opening_hours) : null;
              } catch (error) {
                console.error("Error parsing opening hours:", error);
                courseOpeningHours = null;
              }
              
              const isOpen = isCurrentlyOpen(courseOpeningHours);
              
              return <Link to={`/course/${course.id}`} key={course.id} className="block">
                <Card className="overflow-hidden hover:shadow-lg transition-shadow rounded-none border-x-0">
                  <CardContent className="p-0">
                    <div>
                      <div className="relative">
                        {courseImages.length > 0 ? (
                          <>
                            <img 
                              src={courseImages[currentImageIndex]} 
                              alt={course.name} 
                              className="w-full h-48 object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Error';
                              }}
                            />
                            {courseImages.length > 1 && (
                              <>
                                <button 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handlePrevImage(course.id, courseImages.length);
                                  }} 
                                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                                >
                                  <ChevronLeft size={20} />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleNextImage(course.id, courseImages.length);
                                  }} 
                                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                                >
                                  <ChevronRight size={20} />
                                </button>
                                <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                                  <div className="flex gap-1">
                                    {courseImages.map((_, idx) => (
                                      <div 
                                        key={idx} 
                                        className={`h-1.5 rounded-full ${idx === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-48 bg-secondary/20 flex items-center justify-center text-muted-foreground">
                            {t("home", "noImageAvailable")}
                          </div>
                        )}
                      </div>
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
                            <span>{course.holes} {t("profile", "holes")}</span>
                            {course.par && <span>• {t("course", "par")} {course.par}</span>}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock size={16} className={isOpen ? "text-green-600" : "text-amber-600"} />
                            <div>
                              <span className={isOpen ? "text-green-600 font-medium" : "text-amber-600"}>
                                {isOpen ? t("home", "openNow") : t("home", "closed")}
                              </span>
                              <span className="text-muted-foreground ml-1">
                                • {t("home", "today")} {formatOpeningHours(course.opening_hours)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>;
            })}

        {courses?.length === 0 && !isLoading && <div className="text-center py-8 text-muted-foreground">
            <p>{t("home", "noCoursesFound")}</p>
            <Button variant="outline" className="mt-2" onClick={handleResetFilters}>
              {t("home", "resetFilters")}
            </Button>
          </div>}
      </div>

      <Button 
        onClick={() => setIsFilterPanelOpen(true)} 
        size="icon" 
        className="fixed right-4 bottom-24 h-12 w-12 rounded-full shadow-lg py-0 my-0 z-[60]"
      >
        <Filter size={20} />
      </Button>

      <FilterPanel 
        isOpen={isFilterPanelOpen} 
        onClose={() => setIsFilterPanelOpen(false)} 
        onApplyFilters={handleApplyFilters} 
        currentFilters={filters} 
      />
    </div>;
};

export default Home;
