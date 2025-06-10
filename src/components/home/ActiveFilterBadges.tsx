
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Heart } from "lucide-react";

type FilterOptions = {
  holes: string;
  location: string;
  isOpen: boolean;
  favoritesOnly: boolean;
};

interface ActiveFilterBadgesProps {
  filters: FilterOptions;
  handleResetFilters: () => void;
}

const ActiveFilterBadges = ({ filters, handleResetFilters }: ActiveFilterBadgesProps) => {
  const hasActiveFilters = filters.holes || filters.location || filters.isOpen || filters.favoritesOnly;

  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3 items-center">
      {filters.favoritesOnly && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Heart size={12} className="text-red-500" />
          Favorites
        </Badge>
      )}
      {filters.holes && (
        <Badge variant="secondary">
          {filters.holes} Holes
        </Badge>
      )}
      {filters.location && (
        <Badge variant="secondary">
          📍 {filters.location}
        </Badge>
      )}
      {filters.isOpen && (
        <Badge variant="secondary" className="text-green-600">
          Currently Open
        </Badge>
      )}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleResetFilters}
        className="h-6 px-2 text-xs"
      >
        <X size={12} className="mr-1" />
        Clear All
      </Button>
    </div>
  );
};

export default ActiveFilterBadges;
