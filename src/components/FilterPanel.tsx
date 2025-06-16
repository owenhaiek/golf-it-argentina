
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X, Clock, Heart, Flag } from "lucide-react";

type FilterOptions = {
  holes: string;
  location: string;
  isOpen: boolean;
  favoritesOnly: boolean;
};

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

const FilterPanel = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters
}: FilterPanelProps) => {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFilters(currentFilters);
  }, [isOpen, currentFilters]);

  // Prevent body scrolling when filter is open - improved for all devices
  useEffect(() => {
    if (isOpen) {
      // Store current scroll position
      const scrollY = window.scrollY;
      
      // Apply styles to prevent scrolling
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.height = '100vh';
      
      // Also prevent scrolling on documentElement for some browsers
      document.documentElement.style.overflow = 'hidden';
      
      return () => {
        // Restore scroll position and styles
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.documentElement.style.overflow = '';
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleResetFilters = () => {
    const resetFilters = {
      holes: "",
      location: "",
      isOpen: false,
      favoritesOnly: false
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
    onClose();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStart(e.touches[0].clientY);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStart === null) return;
    
    const currentY = e.touches[0].clientY;
    const offset = Math.max(0, currentY - dragStart);
    setDragOffset(offset);
  };

  const handleTouchEnd = () => {
    if (dragOffset > 100) {
      onClose();
    }
    setDragStart(null);
    setDragOffset(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStart(e.clientY);
    setDragOffset(0);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragStart === null) return;
    
    const offset = Math.max(0, e.clientY - dragStart);
    setDragOffset(offset);
  };

  const handleMouseUp = () => {
    if (dragOffset > 100) {
      onClose();
    }
    setDragStart(null);
    setDragOffset(0);
  };

  useEffect(() => {
    if (dragStart !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragStart, dragOffset]);

  const holesOptions = [
    { value: "", label: "All" },
    { value: "9", label: "9" },
    { value: "18", label: "18" },
    { value: "27", label: "27" }
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[100] bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      
      {/* Filter Panel */}
      <div 
        ref={panelRef}
        className={`fixed inset-x-0 bottom-0 z-[110] w-full transform transition-transform duration-500 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          transform: `translateY(${isOpen ? dragOffset : 100}%)`,
          height: '75vh',
          maxHeight: '75vh'
        }}
      >
        <Card className="rounded-t-2xl border-b-0 shadow-2xl bg-card text-card-foreground w-full h-full">
          <div className="h-full flex flex-col">
            {/* Larger drag indicator */}
            <div 
              className="w-16 h-2 bg-muted rounded-full mx-auto mt-3 mb-3 cursor-pointer touch-none relative"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              style={{
                padding: '8px 0'
              }}
            >
              <div className="absolute inset-0 -top-4 -bottom-4 -left-4 -right-4 touch-none" />
            </div>
            
            <div className="flex items-center justify-between mb-4 px-6">
              <h3 className="text-lg font-semibold text-foreground">Filter Courses</h3>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X size={20} />
              </Button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto px-6">
              {/* Favorites Filter - Enhanced Design */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Show Favorites</Label>
                <div 
                  className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    filters.favoritesOnly 
                      ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800' 
                      : 'bg-muted/50 border-border hover:bg-muted'
                  }`}
                  onClick={() => setFilters({
                    ...filters,
                    favoritesOnly: !filters.favoritesOnly
                  })}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                    filters.favoritesOnly 
                      ? 'bg-red-100 dark:bg-red-900/30' 
                      : 'bg-background'
                  }`}>
                    <Heart 
                      size={16} 
                      className={`transition-all ${
                        filters.favoritesOnly 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-muted-foreground'
                      }`} 
                    />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium transition-all ${
                      filters.favoritesOnly 
                        ? 'text-red-700 dark:text-red-300' 
                        : 'text-foreground'
                    }`}>
                      Favorites Only
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {filters.favoritesOnly ? 'Show only your favorite courses' : 'Show all courses including favorites'}
                    </p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    filters.favoritesOnly 
                      ? 'bg-red-500 border-red-500' 
                      : 'border-muted-foreground'
                  }`}>
                    {filters.favoritesOnly && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Number of Holes - Compact Design */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Number of Holes</Label>
                <div className="grid grid-cols-4 gap-2">
                  {holesOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all cursor-pointer min-h-[40px] ${
                        filters.holes === option.value
                          ? 'bg-green-50 border-green-500 dark:bg-green-950/20 dark:border-green-500'
                          : 'bg-muted/50 border-border hover:bg-muted'
                      }`}
                      onClick={() => setFilters({
                        ...filters,
                        holes: option.value
                      })}
                    >
                      <Flag 
                        size={10} 
                        className={`mb-1 transition-all ${
                          filters.holes === option.value
                            ? 'text-green-600'
                            : 'text-muted-foreground'
                        }`} 
                      />
                      <span className={`text-xs font-medium transition-all ${
                        filters.holes === option.value
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-foreground'
                      }`}>
                        {option.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Currently Open - Enhanced Design */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Status</Label>
                <div 
                  className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    filters.isOpen 
                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800' 
                      : 'bg-muted/50 border-border hover:bg-muted'
                  }`}
                  onClick={() => setFilters({
                    ...filters,
                    isOpen: !filters.isOpen
                  })}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                    filters.isOpen 
                      ? 'bg-blue-100 dark:bg-blue-900/30' 
                      : 'bg-background'
                  }`}>
                    <Clock 
                      size={16} 
                      className={`transition-all ${
                        filters.isOpen 
                          ? 'text-blue-600' 
                          : 'text-muted-foreground'
                      }`} 
                    />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium transition-all ${
                      filters.isOpen 
                        ? 'text-blue-700 dark:text-blue-300' 
                        : 'text-foreground'
                    }`}>
                      Currently Open
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {filters.isOpen ? 'Show only open courses' : 'Show all courses regardless of status'}
                    </p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    filters.isOpen 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'border-muted-foreground'
                  }`}>
                    {filters.isOpen && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location-filter" className="text-sm font-medium text-foreground">Location</Label>
                <Input 
                  id="location-filter" 
                  type="text" 
                  placeholder="City or state..." 
                  value={filters.location} 
                  onChange={e => setFilters({
                    ...filters,
                    location: e.target.value
                  })}
                  className="h-11"
                />
              </div>
            </div>

            {/* Fixed button area at bottom */}
            <div className="flex-shrink-0 p-6 bg-card border-t">
              <div className="flex space-x-3">
                <Button onClick={handleResetFilters} variant="outline" className="flex-1 h-11">
                  Reset
                </Button>
                <Button onClick={handleApplyFilters} className="flex-1 h-11">
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default FilterPanel;
