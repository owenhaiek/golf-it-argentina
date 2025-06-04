
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Clock } from "lucide-react";

interface FilterOptions {
  holes: string;
  location: string;
  isOpen: boolean;
}

interface ActiveFilterBadgesProps {
  filters: FilterOptions;
  handleResetFilters: () => void;
}

const ActiveFilterBadges = ({ filters, handleResetFilters }: ActiveFilterBadgesProps) => {
  const { t } = useLanguage();
  const hasActiveFilters = filters.holes || filters.location || filters.isOpen;
  
  if (!hasActiveFilters) {
    return null;
  }
  
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center">
        <div className="flex flex-wrap gap-2">
          {filters.holes && (
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
              {filters.holes} {t("profile", "holes")}
            </div>
          )}
          {filters.location && (
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
              {t("course", "location")}: {filters.location}
            </div>
          )}
          {filters.isOpen && (
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-1">
              <Clock size={14} />
              {t("home", "openNow")}
            </div>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={handleResetFilters} className="rounded-full">
          <X size={18} />
        </Button>
      </div>
    </div>
  );
};

export default ActiveFilterBadges;
