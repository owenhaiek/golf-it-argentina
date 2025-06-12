
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { isCurrentlyOpen } from "@/utils/openingHours";

interface FilterOptions {
  location: string;
  holes: string;
  favoritesOnly: boolean;
  isOpen: boolean;
}

interface GolfCourse {
  id: string;
  name: string;
  city?: string;
  state?: string;
  par?: number;
  holes: number;
  description?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  phone?: string;
  website?: string;
  opening_hours?: any;
  hole_pars?: number[];
  hole_distances?: number[];
  hole_handicaps?: number[];
  image_gallery?: string;
  established_year?: number;
  type?: string;
}

export const useGolfCourses = (search: string, filters: FilterOptions) => {
  const { user } = useAuth();
  const { favorites = [] } = useFavorites();
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
        filteredCourses = filteredCourses.filter(course => favorites.includes(course.id));
      }

      // Apply "currently open" filter - this was the missing logic
      if (filters.isOpen) {
        filteredCourses = filteredCourses.filter(course => {
          if (!course.opening_hours) {
            console.log(`Course ${course.name} has no opening hours`);
            return false;
          }
          try {
            const openingHours = typeof course.opening_hours === 'string' 
              ? JSON.parse(course.opening_hours) 
              : course.opening_hours;
            const isOpen = isCurrentlyOpen(openingHours);
            console.log(`Course ${course.name} is ${isOpen ? 'open' : 'closed'}`);
            return isOpen;
          } catch (error) {
            console.error(`Error parsing opening hours for ${course.name}:`, error);
            return false;
          }
        });
      }

      console.log(`Filtered courses count: ${filteredCourses.length}`);
      return filteredCourses;
    }
  });

  return {
    courses,
    isLoading,
    currentTime
  };
};
