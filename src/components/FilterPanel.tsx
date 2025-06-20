
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { FilterContent } from "./filters/FilterContent";
import { FilterPanelBackdrop } from "./filters/FilterPanelBackdrop";
import { FilterPanelDragHandle } from "./filters/FilterPanelDragHandle";
import { FilterPanelHeader } from "./filters/FilterPanelHeader";
import { FilterPanelActions } from "./filters/FilterPanelActions";
import { useFilterPanelDrag } from "@/hooks/useFilterPanelDrag";
import { useFilterPanelScrollPrevention } from "@/hooks/useFilterPanelScrollPrevention";

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
  const panelRef = useFilterPanelScrollPrevention(isOpen);
  const { dragOffset, handleTouchStart, handleTouchMove, handleTouchEnd, handleMouseDown } = useFilterPanelDrag({ onClose });

  useEffect(() => {
    setFilters(currentFilters);
  }, [isOpen, currentFilters]);

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

  return (
    <>
      <FilterPanelBackdrop isOpen={isOpen} onClick={onClose} />
      
      <div 
        ref={panelRef}
        className={`fixed inset-x-0 z-[110] w-full transform transition-transform duration-500 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          transform: `translateY(${isOpen ? dragOffset : 100}%)`,
          bottom: '0px',
          height: 'auto',
          maxHeight: '70vh',
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
          
          <FilterPanelHeader onClose={onClose} />

          <div className="px-4">
            <FilterContent filters={filters} setFilters={setFilters} />
          </div>

          <FilterPanelActions 
            onReset={handleResetFilters}
            onApply={handleApplyFilters}
          />
        </Card>
      </div>
    </>
  );
};

export default FilterPanel;
