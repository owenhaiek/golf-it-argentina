
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { FilterContent } from "./filters/FilterContent";
import { FilterPanelBackdrop } from "./filters/FilterPanelBackdrop";
import { FilterPanelDragHandle } from "./filters/FilterPanelDragHandle";
import { FilterPanelHeader } from "./filters/FilterPanelHeader";
import { useFilterPanelDrag } from "@/hooks/useFilterPanelDrag";
import { useFilterPanelScrollPrevention } from "@/hooks/useFilterPanelScrollPrevention";

type FilterOptions = {
  holes: string;
  location: string;
  isOpen: boolean;
  favoritesOnly: boolean;
  minRating: number;
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
  const panelRef = useFilterPanelScrollPrevention(isOpen);
  const { dragOffset, handleTouchStart, handleTouchMove, handleTouchEnd, handleMouseDown } = useFilterPanelDrag({ onClose });

  useEffect(() => {
    setFilters(currentFilters);
  }, [isOpen, currentFilters]);

  // Apply filters immediately when they change
  useEffect(() => {
    if (isOpen) {
      onApplyFilters(filters);
    }
  }, [filters, isOpen, onApplyFilters]);

  const handleResetFilters = () => {
    const resetFilters = {
      holes: "",
      location: "",
      isOpen: false,
      favoritesOnly: false,
      minRating: 0
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
    onClose();
  };

  return (
    <>
      <FilterPanelBackdrop isOpen={isOpen} onClick={onClose} />
      
      <div 
        ref={panelRef}
        className={`fixed inset-x-0 z-[50] w-full transform transition-transform duration-500 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          transform: `translateY(${isOpen ? dragOffset : 100}%)`,
          bottom: '80px',
          height: 'auto',
          maxHeight: 'calc(100vh - 160px)',
          touchAction: 'none'
        }}
      >
        <Card className="rounded-t-2xl border-b-0 shadow-2xl bg-card text-card-foreground w-full flex flex-col">
          <FilterPanelDragHandle
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
          />
          
          <FilterPanelHeader onClose={onClose} onReset={handleResetFilters} />

          <div className="px-6 pb-6 pt-2 overflow-y-auto max-h-full">
            <FilterContent filters={filters} setFilters={setFilters} />
          </div>
        </Card>
      </div>
    </>
  );
};

export default FilterPanel;
