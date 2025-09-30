import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCoursePlayersCount = (courseId: string) => {
  return useQuery({
    queryKey: ['course-players-count', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rounds')
        .select('user_id')
        .eq('course_id', courseId);

      if (error) throw error;

      // Count unique users
      const uniqueUsers = new Set(data?.map(round => round.user_id) || []);
      return uniqueUsers.size;
    },
  });
};
