
import { useState } from "react";
import { Check, ChevronDown, Search, MapPin, Clock, Star, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Course {
  id: string;
  name: string;
  city?: string;
  state?: string;
  par?: number;
  holes: number;
  image_url?: string;
  address?: string;
}

interface CourseSearchProps {
  courses: Course[];
  isLoading: boolean;
  selectedCourse: string;
  onSelectCourse: (courseId: string) => void;
}

const CourseSearch = ({ courses, isLoading, selectedCourse, onSelectCourse }: CourseSearchProps) => {
  const [open, setOpen] = useState(false);

  const selectedCourseData = courses?.find((course) => course.id === selectedCourse);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Flag className="h-5 w-5 text-primary" />
          Select Golf Course
        </CardTitle>
        <CardDescription>
          Choose the course where you want to play
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between h-auto min-h-[80px] p-4 bg-background border-border hover:bg-accent"
            >
              {selectedCourseData ? (
                <div className="flex items-start gap-3 w-full text-left">
                  {selectedCourseData.image_url && (
                    <img 
                      src={selectedCourseData.image_url} 
                      alt={selectedCourseData.name}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">
                      {selectedCourseData.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">
                        {[selectedCourseData.city, selectedCourseData.state].filter(Boolean).join(', ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {selectedCourseData.holes} Holes
                      </Badge>
                      {selectedCourseData.par && (
                        <Badge variant="outline" className="text-xs">
                          Par {selectedCourseData.par}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Flag className="h-4 w-4" />
                  <span>Select golf course...</span>
                </div>
              )}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 bg-background border-border" align="start">
            <Command className="bg-background">
              <CommandInput placeholder="Search golf courses..." className="bg-background text-foreground" />
              <CommandList>
                <CommandEmpty className="text-muted-foreground p-4">No golf course found.</CommandEmpty>
                <CommandGroup>
                  <ScrollArea className="h-[300px]">
                    {courses?.map((course) => (
                      <CommandItem
                        key={course.id}
                        value={`${course.name} ${course.city} ${course.state}`}
                        onSelect={() => {
                          onSelectCourse(course.id);
                          setOpen(false);
                        }}
                        className="p-3 hover:bg-accent cursor-pointer"
                      >
                        <div className="flex items-start gap-3 w-full">
                          <Check
                            className={cn(
                              "mt-1 h-4 w-4 text-primary",
                              selectedCourse === course.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {course.image_url && (
                            <img 
                              src={course.image_url} 
                              alt={course.name}
                              className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground truncate">
                              {course.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">
                                {[course.city, course.state].filter(Boolean).join(', ')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {course.holes} Holes
                              </Badge>
                              {course.par && (
                                <Badge variant="outline" className="text-xs">
                                  Par {course.par}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </ScrollArea>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </CardContent>
    </Card>
  );
};

export default CourseSearch;
