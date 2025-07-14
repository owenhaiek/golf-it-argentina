import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Hook for prefetching critical data in the background
export const useDataPrefetch = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch courses and reviews data
    const prefetchData = async () => {
      // Prefetch basic course data
      queryClient.prefetchQuery({
        queryKey: ['golf-courses-prefetch'],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('golf_courses')
            .select('id, name, city, image_url, opening_hours, holes, par')
            .order('name')
            .limit(20); // Prefetch first 20 courses

          if (error) throw error;
          return data;
        },
        staleTime: 15 * 60 * 1000, // 15 minutes
      });

      // Prefetch reviews summary
      queryClient.prefetchQuery({
        queryKey: ['reviews-summary-prefetch'],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('course_reviews')
            .select('course_id, rating');

          if (error) throw error;
          return data;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
      });
    };

    // Start prefetching after a short delay to not block initial render
    const timer = setTimeout(prefetchData, 100);
    return () => clearTimeout(timer);
  }, [queryClient]);

  // Prefetch specific course data when hovering over course cards
  const prefetchCourseDetails = (courseId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['course-details', courseId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('golf_courses')
          .select('*')
          .eq('id', courseId)
          .single();

        if (error) throw error;
        return data;
      },
      staleTime: 15 * 60 * 1000,
    });

    // Also prefetch course reviews
    queryClient.prefetchQuery({
      queryKey: ['course-reviews', courseId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('course_reviews')
          .select('*')
          .eq('course_id', courseId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  return { prefetchCourseDetails };
};