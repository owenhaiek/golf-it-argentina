
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { isCurrentlyOpen } from "@/utils/openingHours";

type FilterOptions = {
  holes: string;
  location: string;
  isOpen: boolean;
};

export const useGolfCourses = (search: string, filters: FilterOptions) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const {
    data: courses,
    isLoading
  } = useQuery({
    queryKey: ['courses', search, filters, currentTime],
    queryFn: async () => {
      let query = supabase.from('golf_courses').select('*').order('name');
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      if (filters.holes) {
        query = query.eq('holes', parseInt(filters.holes));
      }
      if (filters.location) {
        query = query.or(`city.ilike.%${filters.location}%,state.ilike.%${filters.location}%`);
      }
      const { data, error } = await query;
      if (error) throw error;

      if (filters.isOpen) {
        return data.filter(course => {
          try {
            const openingHours = course.opening_hours ? JSON.parse(course.opening_hours) : null;
            return isCurrentlyOpen(openingHours);
          } catch (error) {
            console.error("Error parsing opening hours:", error);
            return false;
          }
        });
      }
      return data;
    }
  });

  return {
    courses,
    isLoading,
    currentTime
  };
};
