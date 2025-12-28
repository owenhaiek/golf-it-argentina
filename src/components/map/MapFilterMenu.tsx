import { useState } from "react";
import { Filter, X } from "lucide-react";
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
      dotColor: "bg-green-500"
    },
    {
      label: "Cerrado",
      active: filters.isOpen === false,
      onClick: () => handleFilterChange('isOpen', filters.isOpen === false ? null : false),
      dotColor: "bg-red-500"
    },
    {
      label: "18 Hoyos",
      active: filters.holes === 18,
      onClick: () => handleFilterChange('holes', filters.holes === 18 ? null : 18),
      dotColor: null
    },
    {
      label: "9 Hoyos",
      active: filters.holes === 9,
      onClick: () => handleFilterChange('holes', filters.holes === 9 ? null : 9),
      dotColor: null
    },
    {
      label: "Mejor valorados",
      active: filters.topRated,
      onClick: () => handleFilterChange('topRated', !filters.topRated),
      dotColor: null,
      icon: "★"
    }
  ];

  const handleClearFilters = () => {
    hapticLight();
    onFiltersChange({ isOpen: null, holes: null, topRated: false });
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence mode="sync">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="fixed inset-0 z-[5] bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Filter panel */}
      <AnimatePresence mode="sync">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="absolute bottom-28 left-4 z-10 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-sm font-semibold text-foreground">Filtros</span>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Filter options */}
            <div className="p-2">
              {filterOptions.map((option, index) => (
                <motion.button
                  key={option.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={option.onClick}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                    transition-all duration-150
                    ${option.active 
                      ? 'bg-primary/20 text-primary' 
                      : 'text-foreground/80 hover:bg-white/5'
                    }
                  `}
                >
                  {/* Icon or dot */}
                  <div className="w-5 h-5 flex items-center justify-center">
                    {option.dotColor ? (
                      <div className={`w-2.5 h-2.5 rounded-full ${option.dotColor}`} />
                    ) : option.icon ? (
                      <span className="text-yellow-400 text-sm">{option.icon}</span>
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary/50" />
                    )}
                  </div>
                  
                  {/* Label */}
                  <span className="text-sm font-medium flex-1 text-left">
                    {option.label}
                  </span>

                  {/* Check indicator */}
                  {option.active && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                    >
                      <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter button - same position/size as action menu but on the left */}
      <div 
        className="absolute bottom-6 left-4 z-10" 
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <motion.button
          onClick={handleToggle}
          whileTap={{ scale: 0.92 }}
          animate={{ 
            rotate: isOpen ? 90 : 0,
            scale: isOpen ? 1.05 : 1
          }}
          transition={{ 
            type: "spring",
            stiffness: 500,
            damping: 25
          }}
          className={`
            h-14 w-14 rounded-full 
            bg-[#0a2820]
            shadow-xl shadow-black/40 
            flex items-center justify-center
            relative
            ${isOpen ? 'ring-4 ring-[#0a2820]/30' : ''}
          `}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" strokeWidth={2.5} />
          ) : (
            <Filter className="w-6 h-6 text-white" strokeWidth={2} />
          )}
          
          {/* Active filters indicator */}
          {hasActiveFilters && !isOpen && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center shadow-lg"
            >
              <span className="text-[10px] font-bold text-primary-foreground">
                {[filters.isOpen !== null, filters.holes !== null, filters.topRated].filter(Boolean).length}
              </span>
            </motion.div>
          )}
        </motion.button>
      </div>
    </>
  );
};
