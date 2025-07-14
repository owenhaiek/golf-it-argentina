import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface StarRatingFilterProps {
  minRating: number;
  onChange: (rating: number) => void;
}

export const StarRatingFilter = ({ minRating, onChange }: StarRatingFilterProps) => {
  const { t } = useLanguage();

  const ratings = [
    { value: 0, label: t("filters", "all") },
    { value: 3, label: "3+" },
    { value: 4, label: "4+" },
    { value: 5, label: "5" }
  ];

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">{t("filters", "topRated")}</Label>
      <div className="grid grid-cols-4 gap-2">
        {ratings.map((rating) => (
          <div
            key={rating.value}
            className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
              minRating === rating.value
                ? 'bg-yellow-50 border-yellow-500 dark:bg-yellow-950/20 dark:border-yellow-500'
                : 'bg-muted/50 border-border hover:bg-muted'
            }`}
            onClick={() => onChange(rating.value)}
          >
            <Star 
              size={12} 
              className={`mb-1 transition-all ${
                minRating === rating.value
                  ? 'text-yellow-600'
                  : 'text-muted-foreground'
              }`}
              fill={minRating === rating.value ? "currentColor" : "none"}
            />
            <span className={`text-sm font-medium transition-all ${
              minRating === rating.value
                ? 'text-yellow-700 dark:text-yellow-300'
                : 'text-foreground'
            }`}>
              {rating.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};