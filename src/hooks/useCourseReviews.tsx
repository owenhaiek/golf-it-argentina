
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCourseReviews = (courseId: string | undefined) => {
  return useQuery({
    queryKey: ['course-reviews', courseId],
    queryFn: async () => {
      if (!courseId) return [];
      
      console.log("Fetching reviews for course:", courseId);
      
      const { data: reviews, error } = await supabase
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
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching reviews:", error);
        throw error;
      }

      // Now fetch profiles for each review separately
      if (!reviews || reviews.length === 0) {
        return [];
      }

      const userIds = [...new Set(reviews.map(review => review.user_id))];
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        // Continue without profiles rather than failing completely
      }

      // Merge reviews with profiles
      const reviewsWithProfiles = reviews.map(review => ({
        ...review,
        profiles: profiles?.find(profile => profile.id === review.user_id) || null
      }));

      console.log("Reviews fetched successfully:", reviewsWithProfiles.length);
      return reviewsWithProfiles;
    },
    enabled: !!courseId,
  });
};
