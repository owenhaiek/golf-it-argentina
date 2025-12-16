import { useState, useMemo, useRef, useEffect } from "react";
import { Search, X, MapPin, Flag, User, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

interface UserProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  handicap: number | null;
}

interface MapSearchOverlayProps {
  courses: GolfCourse[];
  onSelectCourse: (course: GolfCourse) => void;
  onOpenChange?: (isOpen: boolean) => void;
}

type SearchTab = 'courses' | 'users';

export const MapSearchOverlay = ({ courses, onSelectCourse, onOpenChange }: MapSearchOverlayProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>('courses');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Notify parent of open state changes
  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

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

  // Search users when tab is users and query changes
  useEffect(() => {
    if (activeTab !== 'users') return;
    
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setUsers([]);
        return;
      }
      
      setIsLoadingUsers(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url, handicap')
          .or(`full_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`)
          .limit(20);
        
        if (!error && data) {
          setUsers(data);
        }
      } catch (err) {
        console.error('Error searching users:', err);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, activeTab]);

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

  const handleSelectUser = (userId: string) => {
    navigate(`/user/${userId}`);
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
      <div className="absolute left-4 z-10 flex flex-col gap-2" style={{ top: 'max(1rem, env(safe-area-inset-top, 1rem))' }}>
        {/* Profile button */}
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button
            onClick={() => navigate('/profile')}
            size="icon"
            variant="secondary"
            className="h-12 w-12 bg-background/95 backdrop-blur-sm hover:bg-background shadow-lg text-foreground border-0"
            title="Mi perfil"
          >
            <User className="w-5 h-5" />
          </Button>
        </motion.div>

        {/* Search section */}
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.div
              key="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                onClick={() => setIsOpen(true)}
                size="icon"
                variant="secondary"
                className="h-12 w-12 bg-background/95 backdrop-blur-sm hover:bg-background shadow-lg text-foreground border-0"
                title="Buscar"
              >
                <Search className="w-5 h-5" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: -20, width: 48 }}
              animate={{ opacity: 1, x: 0, width: 'auto' }}
              exit={{ opacity: 0, x: -20, width: 48 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex flex-col"
            >
              {/* Floating search input */}
              <div className="flex flex-col gap-2 bg-background/95 backdrop-blur-sm shadow-xl rounded-2xl p-2 w-[calc(100vw-32px)] max-w-sm">
                {/* Tab selector */}
                <div className="flex gap-1 p-1 bg-muted/50 rounded-xl">
                  <button
                    onClick={() => setActiveTab('courses')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      activeTab === 'courses' 
                        ? 'bg-background shadow-sm text-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Flag className="w-4 h-4" />
                    Campos
                  </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      activeTab === 'users' 
                        ? 'bg-background shadow-sm text-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Usuarios
                  </button>
                </div>

                {/* Search input */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      ref={inputRef}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={activeTab === 'courses' ? "Buscar campo..." : "Buscar usuario..."}
                      className="pl-9 pr-8 h-10 border-0 bg-muted/30 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl"
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
                    className="text-muted-foreground h-10 px-3 text-xs"
                  >
                    Cerrar
                  </Button>
                </div>
              </div>

              {/* Results dropdown */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.15 }}
                className="mt-2 bg-background/95 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden w-[calc(100vw-32px)] max-w-sm"
              >
                {/* Results count */}
                <div className="px-3 py-2 border-b border-border/50 bg-muted/30">
                  <p className="text-xs text-muted-foreground font-medium">
                    {activeTab === 'courses' 
                      ? `${filteredCourses.length} ${filteredCourses.length === 1 ? 'campo' : 'campos'}`
                      : `${users.length} ${users.length === 1 ? 'usuario' : 'usuarios'}`
                    }
                  </p>
                </div>

                {/* Scrollable results list */}
                <div 
                  ref={listRef}
                  className="max-h-[50vh] overflow-y-auto overscroll-contain"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  {activeTab === 'courses' ? (
                    // Courses results
                    filteredCourses.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground">
                        <Search className="w-6 h-6 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No se encontraron campos</p>
                      </div>
                    ) : (
                      <div className="py-1">
                        {filteredCourses.map((course) => (
                          <motion.button
                            key={course.id}
                            whileTap={{ scale: 0.98, backgroundColor: 'hsl(var(--muted))' }}
                            onClick={() => handleSelectCourse(course)}
                            className="w-full flex items-center gap-3 px-3 py-3 hover:bg-muted/60 active:bg-muted transition-colors text-left"
                          >
                            {/* Course image or placeholder */}
                            <div className="w-11 h-11 rounded-xl bg-muted flex-shrink-0 overflow-hidden">
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
                            <div className="flex-shrink-0 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg font-medium">
                              {course.holes}H
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    )
                  ) : (
                    // Users results
                    isLoadingUsers ? (
                      <div className="py-8 text-center text-muted-foreground">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-sm">Buscando...</p>
                      </div>
                    ) : !searchQuery.trim() ? (
                      <div className="py-8 text-center text-muted-foreground">
                        <Users className="w-6 h-6 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">Escribe para buscar usuarios</p>
                      </div>
                    ) : users.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground">
                        <Users className="w-6 h-6 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No se encontraron usuarios</p>
                      </div>
                    ) : (
                      <div className="py-1">
                        {users.map((user) => (
                          <motion.button
                            key={user.id}
                            whileTap={{ scale: 0.98, backgroundColor: 'hsl(var(--muted))' }}
                            onClick={() => handleSelectUser(user.id)}
                            className="w-full flex items-center gap-3 px-3 py-3 hover:bg-muted/60 active:bg-muted transition-colors text-left"
                          >
                            <Avatar className="w-11 h-11">
                              <AvatarImage src={user.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {user.full_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm line-clamp-1">
                                {user.full_name || user.username || 'Usuario'}
                              </p>
                              {user.username && user.full_name && (
                                <p className="text-xs text-muted-foreground">@{user.username}</p>
                              )}
                            </div>
                            
                            {user.handicap !== null && (
                              <div className="flex-shrink-0 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg font-medium">
                                HCP {user.handicap}
                              </div>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    )
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Click-away backdrop when search is open - with blur */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[5] bg-black/30 backdrop-blur-md"
            onClick={handleClose}
          />
        )}
      </AnimatePresence>
    </>
  );
};
