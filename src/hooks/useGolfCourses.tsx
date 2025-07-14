
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
  minRating: number;
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

      // Apply "currently open" filter
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

      // Apply rating filter (fetch and filter by average rating)
      if (filters.minRating > 0) {
        // Get course IDs for review query
        const courseIds = filteredCourses.map(course => course.id);
        
        if (courseIds.length > 0) {
          const { data: reviews, error: reviewError } = await supabase
            .from('course_reviews')
            .select('course_id, rating')
            .in('course_id', courseIds);

          if (!reviewError && reviews) {
            // Calculate average ratings per course
            const courseRatings = reviews.reduce((acc, review) => {
              if (!acc[review.course_id]) {
                acc[review.course_id] = { total: 0, count: 0 };
              }
              acc[review.course_id].total += review.rating;
              acc[review.course_id].count += 1;
              return acc;
            }, {} as Record<string, { total: number; count: number }>);

            // Filter courses by minimum rating
            filteredCourses = filteredCourses.filter(course => {
              const ratingData = courseRatings[course.id];
              if (!ratingData) return false; // No reviews = doesn't meet rating filter
              const avgRating = ratingData.total / ratingData.count;
              return avgRating >= filters.minRating;
            });
          }
        }
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
