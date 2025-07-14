import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface StarRatingFilterProps {
  minRating: number;
  onChange: (rating: number) => void;
}

export const StarRatingFilter = ({ minRating, onChange }: StarRatingFilterProps) => {
  const ratings = [0, 3, 4, 5]; // 0 = All, 3+ stars, 4+ stars, 5 stars

  const getRatingLabel = (rating: number) => {
    if (rating === 0) return "All Ratings";
    if (rating === 5) return "5 Stars Only";
    return `${rating}+ Stars`;
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-foreground">Minimum Rating</Label>
      <div className="grid grid-cols-2 gap-2">
        {ratings.map((rating) => (
          <Button
            key={rating}
            variant={minRating === rating ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(rating)}
            className="h-10 flex items-center gap-1.5 text-sm"
          >
            {rating > 0 && (
              <>
                <Star 
                  className="h-3.5 w-3.5" 
                  fill={minRating === rating ? "currentColor" : "none"}
                />
                <span>{rating}+</span>
              </>
            )}
            {rating === 0 && <span>All</span>}
          </Button>
        ))}
      </div>
    </div>
  );
};