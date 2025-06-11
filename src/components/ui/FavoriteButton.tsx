import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  courseId: string;
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "outline" | "default";
  className?: string;
}

export const FavoriteButton = ({ 
  courseId, 
  size = "md", 
  variant = "outline",
  className 
}: FavoriteButtonProps) => {
  const { isFavorite, toggleFavorite, isLoading } = useFavorites();
  const isCurrentlyFavorite = isFavorite(courseId);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => toggleFavorite(courseId)}
      disabled={isLoading}
      className={cn(className, isCurrentlyFavorite && variant === "outline" ? "text-red-500 border-red-500" : "")}
    >
      <Heart className={cn(
        "h-4 w-4",
        isCurrentlyFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
      )} />
    </Button>
  );
};

export default FavoriteButton;
