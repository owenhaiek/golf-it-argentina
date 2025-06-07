
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X, Clock } from "lucide-react";

type FilterOptions = {
  holes: string;
  location: string;
  isOpen: boolean;
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
      isOpen: false
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
          paddingBottom: `calc(72px + env(safe-area-inset-bottom, 0px))`,
          maxHeight: 'calc(85vh - 72px)'
        }}
      >
        <Card className="rounded-t-2xl border-b-0 shadow-2xl bg-white w-full h-full">
          <div className="p-6 h-full flex flex-col">
            {/* Drag indicator */}
            <div 
              className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 cursor-pointer touch-none"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
            />
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Filter Courses</h3>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X size={20} />
              </Button>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto">
              <div className="space-y-3">
                <Label htmlFor="holes-filter" className="text-sm font-medium">Number of Holes</Label>
                <RadioGroup 
                  value={filters.holes} 
                  onValueChange={value => setFilters({
                    ...filters,
                    holes: value
                  })} 
                  className="flex flex-wrap gap-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="" id="holes-all" />
                    <Label htmlFor="holes-all" className="text-sm">All</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="9" id="holes-9" />
                    <Label htmlFor="holes-9" className="text-sm">9 Holes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="18" id="holes-18" />
                    <Label htmlFor="holes-18" className="text-sm">18 Holes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="27" id="holes-27" />
                    <Label htmlFor="holes-27" className="text-sm">27 Holes</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label htmlFor="location-filter" className="text-sm font-medium">Location</Label>
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

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is-open-filter"
                    checked={filters.isOpen}
                    onChange={e => setFilters({
                      ...filters,
                      isOpen: e.target.checked
                    })}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="is-open-filter" className="flex items-center gap-2 text-sm font-medium">
                    <Clock size={16} className="text-primary" />
                    Currently Open
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4 mt-auto">
              <Button onClick={handleResetFilters} variant="outline" className="flex-1 h-11">
                Reset
              </Button>
              <Button onClick={handleApplyFilters} className="flex-1 h-11">
                Apply Filters
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default FilterPanel;
