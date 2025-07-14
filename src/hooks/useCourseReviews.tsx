
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCourseReviews = (courseId: string | undefined) => {
  return useQuery({
    queryKey: ['course-reviews', courseId],
    queryFn: async () => {
      if (!courseId) return [];
      
      console.log("Fetching reviews for course:", courseId);
      
      // Parallel queries for better performance
      const [reviewsResult, profilesResult] = await Promise.all([
        supabase
          .from('course_reviews')
          .select(`
            id,
            course_id,
            user_id,
            rating,
            comment,
            created_at
          `)
          .eq('course_id', courseId)
          .order('created_at', { ascending: false }),
        
        // Fetch all profiles that might be needed (optimistic fetch)
        supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .limit(100) // Cache common profiles
      ]);

      if (reviewsResult.error) {
        console.error("Error fetching reviews:", reviewsResult.error);
        throw reviewsResult.error;
      }

      const reviews = reviewsResult.data || [];
      const allProfiles = profilesResult.data || [];

      if (reviews.length === 0) {
        return [];
      }

      // Merge reviews with profiles using cached profiles
      const reviewsWithProfiles = reviews.map(review => ({
        ...review,
        profiles: allProfiles.find(profile => profile.id === review.user_id) || null
      }));

      console.log("Reviews fetched successfully:", reviewsWithProfiles.length);
      return reviewsWithProfiles;
    },
    enabled: !!courseId,
    // Optimized caching for reviews
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};
