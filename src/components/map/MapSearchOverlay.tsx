import { useState, useMemo, useRef, useEffect } from "react";
import { Search, X, MapPin, Flag, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

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
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
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
      {/* Top left controls - Profile & Search */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {/* Profile button */}
        <Button
          onClick={() => navigate('/profile')}
          size="icon"
          variant="secondary"
          className="h-10 w-10 bg-background/95 backdrop-blur-sm hover:bg-background border shadow-lg text-foreground"
          title="Mi perfil"
        >
          <User className="w-4 h-4" />
        </Button>

        {/* Search section */}
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.div
              key="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              <Button
                onClick={() => setIsOpen(true)}
                size="icon"
                variant="secondary"
                className="h-10 w-10 bg-background/95 backdrop-blur-sm hover:bg-background border shadow-lg text-foreground"
                title="Buscar campos"
              >
                <Search className="w-4 h-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: -20, width: 40 }}
              animate={{ opacity: 1, x: 0, width: 'auto' }}
              exit={{ opacity: 0, x: -20, width: 40 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex flex-col"
            >
              {/* Floating search input */}
              <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm border shadow-lg rounded-xl p-1.5 w-[calc(100vw-32px)] max-w-sm">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    ref={inputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar campo..."
                    className="pl-9 pr-8 h-9 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-muted-foreground h-8 px-2 text-xs"
                >
                  Cerrar
                </Button>
              </div>

              {/* Results dropdown */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.15 }}
                className="mt-2 bg-background/95 backdrop-blur-sm border shadow-lg rounded-xl overflow-hidden w-[calc(100vw-32px)] max-w-sm"
              >
                {/* Results count */}
                <div className="px-3 py-2 border-b border-border/50 bg-muted/30">
                  <p className="text-xs text-muted-foreground font-medium">
                    {filteredCourses.length} {filteredCourses.length === 1 ? 'resultado' : 'resultados'}
                  </p>
                </div>

                {/* Scrollable results list */}
                <div 
                  ref={listRef}
                  className="max-h-[50vh] overflow-y-auto overscroll-contain"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  {filteredCourses.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      <Search className="w-6 h-6 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No se encontraron campos</p>
                    </div>
                  ) : (
                    <div className="py-1">
                      {filteredCourses.map((course) => (
                        <button
                          key={course.id}
                          onClick={() => handleSelectCourse(course)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/60 active:bg-muted transition-colors text-left"
                        >
                          {/* Course image or placeholder */}
                          <div className="w-10 h-10 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                            {course.image_url ? (
                              <img 
                                src={course.image_url} 
                                alt=""
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                <Flag className="w-4 h-4 text-primary" />
                              </div>
                            )}
                          </div>
                          
                          {/* Course info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-1">{course.name}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="line-clamp-1">
                                {[course.city, course.state].filter(Boolean).join(', ') || 'Argentina'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Holes badge */}
                          <div className="flex-shrink-0 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {course.holes}H
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Click-away backdrop when search is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[5]"
            onClick={handleClose}
          />
        )}
      </AnimatePresence>
    </>
  );
};
