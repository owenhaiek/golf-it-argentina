
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/contexts/AuthContext";
import { isCurrentlyOpen } from "@/utils/openingHours";

type FilterOptions = {
  holes: string;
  location: string;
  isOpen: boolean;
  favoritesOnly: boolean;
};

export const useGolfCourses = (search: string, filters: FilterOptions) => {
  const { user } = useAuth();
  const { data: favorites = [] } = useFavorites();
  const currentTime = new Date();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['golf-courses', search, filters],
    queryFn: async () => {
      let query = supabase
        .from('golf_courses')
        .select('*')
        .order('name');

      // Apply search filter
      if (search.trim()) {
        query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,state.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // Apply location filter
      if (filters.location.trim()) {
        query = query.or(`city.ilike.%${filters.location}%,state.ilike.%${filters.location}%,address.ilike.%${filters.location}%`);
      }

      // Apply holes filter
      if (filters.holes) {
        query = query.eq('holes', parseInt(filters.holes));
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching courses:", error);
        throw error;
      }

      let filteredCourses = data || [];

      // Apply favorites filter
      if (filters.favoritesOnly && user) {
        const favoriteIds = favorites.map(fav => fav.course_id);
        filteredCourses = filteredCourses.filter(course => favoriteIds.includes(course.id));
      }

      // Apply "currently open" filter
      if (filters.isOpen) {
        filteredCourses = filteredCourses.filter(course => {
          if (!course.opening_hours) return false;
          try {
            const openingHours = typeof course.opening_hours === 'string' 
              ? JSON.parse(course.opening_hours) 
              : course.opening_hours;
            return isCurrentlyOpen(openingHours);
          } catch {
            return false;
          }
        });
      }

      return filteredCourses;
    }
  });

  return {
    courses,
    isLoading,
    currentTime
  };
};
