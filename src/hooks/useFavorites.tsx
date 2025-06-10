
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export const useFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          id,
          course_id,
          created_at,
          golf_courses (
            id,
            name,
            city,
            state,
            holes,
            par,
            image_url,
            description,
            address,
            opening_hours
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching favorites:", error);
        toast({
          title: "Error loading favorites",
          description: "Could not load your favorite courses",
          variant: "destructive"
        });
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id
  });
};

export const useToggleFavorite = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, isFavorite }: { courseId: string; isFavorite: boolean }) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('course_id', courseId);

        if (error) throw error;
        return { action: 'removed', courseId };
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            course_id: courseId
          });

        if (error) throw error;
        return { action: 'added', courseId };
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch favorites
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['courseIsFavorite'] });
      
      toast({
        title: data.action === 'added' ? "Added to favorites" : "Removed from favorites",
        description: data.action === 'added' ? "Course saved to your favorites" : "Course removed from favorites"
      });
    },
    onError: (error) => {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Could not update favorites",
        variant: "destructive"
      });
    }
  });
};

export const useIsFavorite = (courseId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['courseIsFavorite', courseId, user?.id],
    queryFn: async () => {
      if (!user?.id || !courseId) return false;
      
      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();

      if (error) {
        console.error("Error checking favorite status:", error);
        return false;
      }

      return !!data;
    },
    enabled: !!user?.id && !!courseId
  });
};
