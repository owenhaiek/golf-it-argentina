
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToggleFavorite, useIsFavorite } from "@/hooks/useFavorites";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface FavoriteButtonProps {
  courseId: string;
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "outline" | "default";
  className?: string;
}

const FavoriteButton = ({ 
  courseId, 
  size = "md", 
  variant = "ghost",
  className = ""
}: FavoriteButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: isFavorite = false, isLoading } = useIsFavorite(courseId);
  const toggleFavorite = useToggleFavorite();

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to save favorites",
        variant: "destructive"
      });
      return;
    }

    toggleFavorite.mutate({ courseId, isFavorite });
  };

  const getIconSize = () => {
    switch (size) {
      case "sm": return 16;
      case "lg": return 24;
      default: return 20;
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case "sm": return "sm";
      case "lg": return "lg";
      default: return "icon";
    }
  };

  return (
    <Button
      variant={variant}
      size={getButtonSize()}
      onClick={handleToggleFavorite}
      disabled={isLoading || toggleFavorite.isPending}
      className={`transition-all duration-200 hover:scale-105 ${className}`}
    >
      <Heart
        size={getIconSize()}
        className={`transition-all duration-200 ${
          isFavorite 
            ? "fill-red-500 text-red-500" 
            : "text-gray-400 hover:text-red-400"
        }`}
      />
    </Button>
  );
};

export default FavoriteButton;
