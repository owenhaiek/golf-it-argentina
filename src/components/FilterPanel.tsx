import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { FilterContent } from "./filters/FilterContent";

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

  // Comprehensive scroll prevention
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      const body = document.body;
      const html = document.documentElement;
      
      // Store original styles
      const originalBodyOverflow = body.style.overflow;
      const originalBodyPosition = body.style.position;
      const originalBodyTop = body.style.top;
      const originalBodyWidth = body.style.width;
      const originalBodyHeight = body.style.height;
      const originalHtmlOverflow = html.style.overflow;
      
      // Apply comprehensive scroll prevention
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.width = '100%';
      body.style.height = '100vh';
      html.style.overflow = 'hidden';
      
      // Prevent all touch and scroll events on background
      const preventTouch = (e: TouchEvent) => {
        if (!panelRef.current?.contains(e.target as Node)) {
          e.preventDefault();
          e.stopPropagation();
        }
      };
      
      const preventWheel = (e: WheelEvent) => {
        if (!panelRef.current?.contains(e.target as Node)) {
          e.preventDefault();
          e.stopPropagation();
        }
      };
      
      const preventScroll = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
      };
      
      // Add event listeners with capture
      document.addEventListener('touchstart', preventTouch, { passive: false, capture: true });
      document.addEventListener('touchmove', preventTouch, { passive: false, capture: true });
      document.addEventListener('touchend', preventTouch, { passive: false, capture: true });
      document.addEventListener('wheel', preventWheel, { passive: false, capture: true });
      document.addEventListener('scroll', preventScroll, { passive: false, capture: true });
      window.addEventListener('scroll', preventScroll, { passive: false, capture: true });
      
      return () => {
        // Restore original styles
        body.style.overflow = originalBodyOverflow;
        body.style.position = originalBodyPosition;
        body.style.top = originalBodyTop;
        body.style.width = originalBodyWidth;
        body.style.height = originalBodyHeight;
        html.style.overflow = originalHtmlOverflow;
        
        // Remove event listeners
        document.removeEventListener('touchstart', preventTouch, { capture: true });
        document.removeEventListener('touchmove', preventTouch, { capture: true });
        document.removeEventListener('touchend', preventTouch, { capture: true });
        document.removeEventListener('wheel', preventWheel, { capture: true });
        document.removeEventListener('scroll', preventScroll, { capture: true });
        window.removeEventListener('scroll', preventScroll, { capture: true });
        
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

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[100] bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        style={{ touchAction: 'none' }}
      />
      
      {/* Filter Panel */}
      <div 
        ref={panelRef}
        className={`fixed inset-x-0 z-[110] w-full transform transition-transform duration-500 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          transform: `translateY(${isOpen ? dragOffset : 100}%)`,
          bottom: '76px',
          height: 'calc(100vh - 152px)',
          maxHeight: 'calc(100vh - 152px)',
          touchAction: 'none'
        }}
      >
        <Card className="rounded-t-2xl border-b-0 shadow-2xl bg-card text-card-foreground w-full h-full flex flex-col">
          {/* Drag indicator */}
          <div 
            className="w-16 h-2 bg-muted rounded-full mx-auto mt-2 mb-2 cursor-pointer touch-none relative flex-shrink-0"
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
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4 px-4 flex-shrink-0">
            <h3 className="text-lg font-semibold text-foreground">Filter Courses</h3>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X size={20} />
            </Button>
          </div>

          {/* Filter Content - flexible container */}
          <div className="flex-1 min-h-0 flex flex-col">
            <FilterContent filters={filters} setFilters={setFilters} />
          </div>

          {/* Fixed button area at bottom */}
          <div className="flex-shrink-0 p-4 bg-card border-t">
            <div className="flex space-x-3">
              <Button onClick={handleResetFilters} variant="outline" className="flex-1 h-12 text-base">
                Reset
              </Button>
              <Button onClick={handleApplyFilters} className="flex-1 h-12 text-base">
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
