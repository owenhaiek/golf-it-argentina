
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface StatusFilterProps {
  isOpen: boolean;
  onToggle: (value: boolean) => void;
}

export const StatusFilter = ({ isOpen, onToggle }: StatusFilterProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">{t("filters", "status")}</Label>
      <div 
        className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
          isOpen 
            ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800' 
            : 'bg-muted/50 border-border hover:bg-muted'
        }`}
        onClick={() => onToggle(!isOpen)}
      >
        <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
          isOpen 
            ? 'bg-blue-100 dark:bg-blue-900/30' 
            : 'bg-background'
        }`}>
          <Clock 
            size={16} 
            className={`transition-all ${
              isOpen 
                ? 'text-blue-600' 
                : 'text-muted-foreground'
            }`} 
          />
        </div>
        <div className="flex-1">
          <p className={`font-medium transition-all ${
            isOpen 
              ? 'text-blue-700 dark:text-blue-300' 
              : 'text-foreground'
          }`}>
            {t("filters", "currentlyOpen")}
          </p>
          <p className="text-xs text-muted-foreground">
            {isOpen ? t("filters", "showOnlyOpen") : t("filters", "showAllStatus")}
          </p>
        </div>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          isOpen 
            ? 'bg-blue-500 border-blue-500' 
            : 'border-muted-foreground'
        }`}>
          {isOpen && (
            <div className="w-2 h-2 rounded-full bg-white"></div>
          )}
        </div>
      </div>
    </div>
  );
};
