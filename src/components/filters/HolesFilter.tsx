
import { Label } from "@/components/ui/label";
import { Flag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface HolesFilterProps {
  selectedHoles: string;
  onSelect: (holes: string) => void;
}

export const HolesFilter = ({ selectedHoles, onSelect }: HolesFilterProps) => {
  const { t } = useLanguage();

  const holesOptions = [
    { value: "", label: t("filters", "all") },
    { value: "9", label: "9" },
    { value: "18", label: "18" },
    { value: "27", label: "27" }
  ];

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">{t("filters", "numberOfHoles")}</Label>
      <div className="grid grid-cols-4 gap-2">
        {holesOptions.map((option) => (
          <div
            key={option.value}
            className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
              selectedHoles === option.value
                ? 'bg-green-50 border-green-500 dark:bg-green-950/20 dark:border-green-500'
                : 'bg-muted/50 border-border hover:bg-muted'
            }`}
            onClick={() => onSelect(option.value)}
          >
            <Flag 
              size={12} 
              className={`mb-1 transition-all ${
                selectedHoles === option.value
                  ? 'text-green-600'
                  : 'text-muted-foreground'
              }`} 
            />
            <span className={`text-sm font-medium transition-all ${
              selectedHoles === option.value
                ? 'text-green-700 dark:text-green-300'
                : 'text-foreground'
            }`}>
              {option.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
