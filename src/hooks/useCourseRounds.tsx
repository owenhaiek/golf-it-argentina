
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCourseRounds = (courseId: string | undefined) => {
  return useQuery({
    queryKey: ['course-rounds', courseId],
    queryFn: async () => {
      if (!courseId) return [];
      const { data, error } = await supabase
        .from('rounds')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq('course_id', courseId)
        .order('score', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!courseId,
  });
};
