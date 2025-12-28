import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { hapticLight, hapticMedium } from "@/hooks/useDespiaNative";

export interface MapFilters {
  isOpen: boolean | null; // null = all, true = open, false = closed
  holes: number | null; // null = all, 9 or 18
  topRated: boolean;
}

interface MapFilterMenuProps {
  filters: MapFilters;
  onFiltersChange: (filters: MapFilters) => void;
}

export const MapFilterMenu = ({ filters, onFiltersChange }: MapFilterMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    hapticMedium();
    setIsOpen(!isOpen);
  };

  const handleFilterChange = (key: keyof MapFilters, value: any) => {
    hapticLight();
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = filters.isOpen !== null || filters.holes !== null || filters.topRated;

  const filterOptions = [
    {
      label: "Abierto",
      active: filters.isOpen === true,
      onClick: () => handleFilterChange('isOpen', filters.isOpen === true ? null : true),
      color: "bg-green-500/20 text-green-400 border-green-500/50",
      activeColor: "bg-green-500 text-white border-green-500",
      icon: <div className="w-2 h-2 rounded-full bg-green-400" />
    },
    {
      label: "Cerrado",
      active: filters.isOpen === false,
      onClick: () => handleFilterChange('isOpen', filters.isOpen === false ? null : false),
      color: "bg-red-500/20 text-red-400 border-red-500/50",
      activeColor: "bg-red-500 text-white border-red-500",
      icon: <div className="w-2 h-2 rounded-full bg-red-400" />
    },
    {
      label: "18 Hoyos",
      active: filters.holes === 18,
      onClick: () => handleFilterChange('holes', filters.holes === 18 ? null : 18),
      color: "bg-primary/20 text-primary border-primary/50",
      activeColor: "bg-primary text-primary-foreground border-primary",
      icon: null
    },
    {
      label: "9 Hoyos",
      active: filters.holes === 9,
      onClick: () => handleFilterChange('holes', filters.holes === 9 ? null : 9),
      color: "bg-primary/20 text-primary border-primary/50",
      activeColor: "bg-primary text-primary-foreground border-primary",
      icon: null
    },
    {
      label: "+ Valorados",
      active: filters.topRated,
      onClick: () => handleFilterChange('topRated', !filters.topRated),
      color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      activeColor: "bg-yellow-500 text-white border-yellow-500",
      icon: <span className="text-yellow-400">★</span>
    }
  ];

  return (
    <div className="fixed bottom-24 left-4 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="absolute bottom-16 left-0 bg-background/95 backdrop-blur-xl border border-border rounded-2xl p-3 shadow-2xl min-w-[180px]"
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
              <span className="text-sm font-semibold text-foreground">Filtros</span>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    hapticLight();
                    onFiltersChange({ isOpen: null, holes: null, topRated: false });
                  }}
                >
                  Limpiar
                </Button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {filterOptions.map((option, index) => (
                <motion.button
                  key={option.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={option.onClick}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                    option.active ? option.activeColor : option.color
                  }`}
                >
                  {option.icon}
                  <span className="flex-1 text-left">{option.label}</span>
                  {option.active && <Check className="w-4 h-4" />}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Button */}
      <motion.div
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          onClick={handleToggle}
          size="icon"
          className={`h-12 w-12 rounded-full shadow-lg transition-all ${
            hasActiveFilters 
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
              : 'bg-background/95 hover:bg-background border border-border text-foreground'
          }`}
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <div className="relative">
              <Filter className="h-5 w-5" />
              {hasActiveFilters && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background"
                />
              )}
            </div>
          )}
        </Button>
      </motion.div>
    </div>
  );
};
