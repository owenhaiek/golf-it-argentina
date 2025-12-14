
import { useState, useMemo, useRef, useEffect } from "react";
import { Search, X, MapPin, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GolfCourse {
  id: string;
  name: string;
  city?: string;
  state?: string;
  par?: number;
  holes: number;
  image_url?: string;
  latitude?: number;
  longitude?: number;
}

interface MapSearchOverlayProps {
  courses: GolfCourse[];
  onSelectCourse: (course: GolfCourse) => void;
}

export const MapSearchOverlay = ({ courses, onSelectCourse }: MapSearchOverlayProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter courses based on search
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;
    
    const query = searchQuery.toLowerCase();
    return courses.filter(course => 
      course.name.toLowerCase().includes(query) ||
      course.city?.toLowerCase().includes(query) ||
      course.state?.toLowerCase().includes(query)
    );
  }, [courses, searchQuery]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSelectCourse = (course: GolfCourse) => {
    onSelectCourse(course);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      {/* Search button */}
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"
        variant="secondary"
        className="absolute top-4 left-4 z-10 h-10 w-10 bg-background/90 backdrop-blur-sm hover:bg-background border shadow-lg"
        title="Buscar campos"
      >
        <Search className="w-4 h-4" />
      </Button>

      {/* Search overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-[300]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />
            
            {/* Search panel */}
            <motion.div
              className="fixed inset-x-0 top-0 z-[310] bg-background max-w-lg mx-auto"
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              style={{ 
                paddingTop: 'env(safe-area-inset-top, 12px)',
                borderRadius: '0 0 20px 20px',
                maxHeight: '80vh'
              }}
            >
              {/* Search header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      ref={inputRef}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar campo de golf..."
                      className="pl-10 h-11"
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setSearchQuery("")}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="text-muted-foreground"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>

              {/* Results list */}
              <ScrollArea className="max-h-[60vh]">
                <div className="p-2">
                  {filteredCourses.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No se encontraron campos</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredCourses.map((course) => (
                        <button
                          key={course.id}
                          onClick={() => handleSelectCourse(course)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/80 transition-colors text-left"
                        >
                          {/* Course image or placeholder */}
                          <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                            {course.image_url ? (
                              <img 
                                src={course.image_url} 
                                alt={course.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                <Flag className="w-5 h-5 text-primary" />
                              </div>
                            )}
                          </div>
                          
                          {/* Course info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-1">{course.name}</p>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="line-clamp-1">
                                {[course.city, course.state].filter(Boolean).join(', ') || 'Argentina'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Holes badge */}
                          <div className="flex-shrink-0 text-xs text-muted-foreground">
                            {course.holes}H
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
