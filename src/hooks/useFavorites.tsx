
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export const useFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [favoriteCourseIds, setFavoriteCourseIds] = useState<string[]>([]);

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['user_favorites', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_favorites')
        .select('course_id')
        .eq('user_id', user.id);

      if (error) {
        console.error("Error fetching favorites:", error);
        throw error;
      }
      return data.map(fav => fav.course_id);
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (favorites) {
      setFavoriteCourseIds(favorites);
    }
  }, [favorites]);

  const addFavoriteMutation = useMutation({
    mutationFn: async (courseId: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      const { error } = await supabase
        .from('user_favorites')
        .insert([{ user_id: user.id, course_id: courseId }]);

      if (error) {
        console.error("Error adding favorite:", error);
        throw error;
      }
    },
    onSuccess: (data, courseId) => {
      queryClient.invalidateQueries({ queryKey: ['user_favorites', user?.id] });
      setFavoriteCourseIds(prev => [...prev, courseId]);
      toast({
        title: "Course added to favorites!",
      });
    },
    onError: (error: any, courseId) => {
      console.error("Error adding favorite:", error);
      toast({
        title: "Failed to add course to favorites.",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (courseId: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('course_id', courseId);

      if (error) {
        console.error("Error removing favorite:", error);
        throw error;
      }
    },
    onSuccess: (data, courseId) => {
      queryClient.invalidateQueries({ queryKey: ['user_favorites', user?.id] });
      setFavoriteCourseIds(prev => prev.filter(id => id !== courseId));
      toast({
        title: "Course removed from favorites.",
      });
    },
    onError: (error: any, courseId) => {
      console.error("Error removing favorite:", error);
      toast({
        title: "Failed to remove course from favorites.",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const isFavorite = (courseId: string) => favoriteCourseIds.includes(courseId);

  const toggleFavorite = (courseId: string) => {
    if (isFavorite(courseId)) {
      removeFavoriteMutation.mutate(courseId);
    } else {
      addFavoriteMutation.mutate(courseId);
    }
  };

  return {
    favorites: favoriteCourseIds,
    isLoading,
    isFavorite,
    toggleFavorite,
    addFavorite: addFavoriteMutation.mutate,
    removeFavorite: removeFavoriteMutation.mutate,
  };
};
