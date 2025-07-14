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
  averageRating?: number;
  reviewCount?: number;
}

export const useOptimizedGolfCourses = (search: string, filters: FilterOptions) => {
  const { user } = useAuth();
  const { favorites = [] } = useFavorites();
  const currentTime = new Date();

  // Prefetch all courses and reviews in a single query when possible
  const { data: coursesData = { courses: [], reviews: [] }, isLoading } = useQuery({
    queryKey: ['optimized-golf-courses', search, filters],
    queryFn: async () => {
      // Start both queries in parallel
      const [coursesResult, reviewsResult] = await Promise.all([
        // Fetch courses
        (async () => {
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

          return query;
        })(),
        
        // Fetch all reviews in parallel
        supabase
          .from('course_reviews')
          .select('course_id, rating')
      ]);

      if (coursesResult.error) {
        console.error("Error fetching courses:", coursesResult.error);
        throw coursesResult.error;
      }

      if (reviewsResult.error) {
        console.error("Error fetching reviews:", reviewsResult.error);
        // Don't throw here, just continue without reviews
      }

      const courses = coursesResult.data || [];
      const reviews = reviewsResult.data || [];

      // Calculate average ratings for all courses
      const courseRatings = reviews.reduce((acc, review) => {
        if (!acc[review.course_id]) {
          acc[review.course_id] = { total: 0, count: 0 };
        }
        acc[review.course_id].total += review.rating;
        acc[review.course_id].count += 1;
        return acc;
      }, {} as Record<string, { total: number; count: number }>);

      // Enhance courses with rating data
      let enhancedCourses = courses.map(course => ({
        ...course,
        averageRating: courseRatings[course.id] 
          ? courseRatings[course.id].total / courseRatings[course.id].count 
          : 0,
        reviewCount: courseRatings[course.id]?.count || 0
      }));

      // Apply client-side filters
      let filteredCourses = enhancedCourses;

      // Apply favorites filter
      if (filters.favoritesOnly && user) {
        filteredCourses = filteredCourses.filter(course => favorites.includes(course.id));
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
          } catch (error) {
            console.error(`Error parsing opening hours for ${course.name}:`, error);
            return false;
          }
        });
      }

      // Apply rating filter
      if (filters.minRating > 0) {
        filteredCourses = filteredCourses.filter(course => 
          course.averageRating >= filters.minRating
        );
      }

      console.log(`Optimized: Filtered courses count: ${filteredCourses.length}`);
      
      return {
        courses: filteredCourses,
        reviews: reviews
      };
    },
    // Aggressive caching for course data
    staleTime: 10 * 60 * 1000, // 10 minutes for courses
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return {
    courses: coursesData.courses,
    isLoading,
    currentTime,
    totalReviews: coursesData.reviews.length
  };
};