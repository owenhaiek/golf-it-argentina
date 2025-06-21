
import { Label } from "@/components/ui/label";
import { Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FavoritesFilterProps {
  favoritesOnly: boolean;
  onToggle: (value: boolean) => void;
}

export const FavoritesFilter = ({ favoritesOnly, onToggle }: FavoritesFilterProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">{t("filters", "showFavorites")}</Label>
      <div 
        className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
          favoritesOnly 
            ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800' 
            : 'bg-muted/50 border-border hover:bg-muted'
        }`}
        onClick={() => onToggle(!favoritesOnly)}
      >
        <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
          favoritesOnly 
            ? 'bg-red-100 dark:bg-red-900/30' 
            : 'bg-background'
        }`}>
          <Heart 
            size={16} 
            className={`transition-all ${
              favoritesOnly 
                ? 'fill-red-500 text-red-500' 
                : 'text-muted-foreground'
            }`} 
          />
        </div>
        <div className="flex-1">
          <p className={`font-medium transition-all ${
            favoritesOnly 
              ? 'text-red-700 dark:text-red-300' 
              : 'text-foreground'
          }`}>
            {t("filters", "favoritesOnly")}
          </p>
          <p className="text-xs text-muted-foreground">
            {favoritesOnly ? t("filters", "showOnlyFavorites") : t("filters", "showAllCourses")}
          </p>
        </div>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          favoritesOnly 
            ? 'bg-red-500 border-red-500' 
            : 'border-muted-foreground'
        }`}>
          {favoritesOnly && (
            <div className="w-2 h-2 rounded-full bg-white"></div>
          )}
        </div>
      </div>
    </div>
  );
};
