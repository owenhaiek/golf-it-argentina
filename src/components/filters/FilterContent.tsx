
import { FavoritesFilter } from "./FavoritesFilter";
import { HolesFilter } from "./HolesFilter";
import { StatusFilter } from "./StatusFilter";
import { LocationFilter } from "./LocationFilter";

type FilterOptions = {
  holes: string;
  location: string;
  isOpen: boolean;
  favoritesOnly: boolean;
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
      
      <HolesFilter 
        selectedHoles={filters.holes}
        onSelect={(holes) => setFilters({ ...filters, holes })}
      />
      
      <StatusFilter 
        isOpen={filters.isOpen}
        onToggle={(value) => setFilters({ ...filters, isOpen: value })}
      />
      
      <LocationFilter 
        location={filters.location}
        onChange={(location) => setFilters({ ...filters, location })}
      />
    </div>
  );
};
