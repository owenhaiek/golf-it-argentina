
import { FavoritesFilter } from "./FavoritesFilter";
import { HolesFilter } from "./HolesFilter";
import { StatusFilter } from "./StatusFilter";
import { StarRatingFilter } from "./StarRatingFilter";

type FilterOptions = {
  holes: string;
  location: string;
  isOpen: boolean;
  favoritesOnly: boolean;
  minRating: number;
};

interface FilterContentProps {
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
}

export const FilterContent = ({ filters, setFilters }: FilterContentProps) => {
  return (
    <div className="space-y-4 pb-2">
      <FavoritesFilter 
        favoritesOnly={filters.favoritesOnly}
        onToggle={(value) => setFilters({ ...filters, favoritesOnly: value })}
      />
      
      <StarRatingFilter 
        minRating={filters.minRating}
        onChange={(rating) => setFilters({ ...filters, minRating: rating })}
      />
      
      <HolesFilter 
        selectedHoles={filters.holes}
        onSelect={(holes) => setFilters({ ...filters, holes })}
      />
      
      <StatusFilter 
        isOpen={filters.isOpen}
        onToggle={(value) => setFilters({ ...filters, isOpen: value })}
      />
    </div>
  );
};
