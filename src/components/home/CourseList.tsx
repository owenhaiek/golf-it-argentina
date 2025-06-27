
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import CourseCard from "./CourseCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Filter } from "lucide-react";
import FilterPanel from "../FilterPanel";
import ActiveFilterBadges from "./ActiveFilterBadges";

interface FilterOptions {
  location: string;
  holes: string;
  isOpen: boolean;
  favoritesOnly: boolean;
}

interface CourseListProps {
  courses: any[];
  isLoading: boolean;
  currentTime: Date;
  handleResetFilters: () => void;
}

const CourseList = ({
  courses = [],
  isLoading,
  currentTime,
  handleResetFilters
}: CourseListProps) => {
  // Memoize loading skeleton to prevent unnecessary re-renders
  const loadingSkeleton = useMemo(() => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
          <div className="bg-gray-200 rounded h-4 mb-2"></div>
          <div className="bg-gray-200 rounded h-4 w-2/3"></div>
        </div>
      ))}
    </div>
  ), []);

  // Memoize empty state to prevent unnecessary re-renders
  const emptyState = useMemo(() => (
    <div className="text-center py-12">
      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">No courses found</h3>
      <p className="text-muted-foreground">
        No golf courses available at the moment
      </p>
    </div>
  ), []);

  if (isLoading) {
    return loadingSkeleton;
  }

  return (
    <div className="space-y-6">
      {/* Course Grid - Updated for 4 columns on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {courses.map(course => (
          <CourseCard 
            key={course.id} 
            course={course} 
            currentTime={currentTime} 
          />
        ))}
      </div>

      {courses.length === 0 && !isLoading && emptyState}
    </div>
  );
};

export default CourseList;
