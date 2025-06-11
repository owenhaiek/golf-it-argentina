import { useState } from "react";
import { Check, ChevronsUpDown, Search, MapPin, Clock, Star } from "lucide-react";
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
}

interface CourseSearchProps {
  courses: Course[];
  isLoading: boolean;
  selectedCourse: string;
  onSelectCourse: (courseId: string) => void;
}

const CourseSearch = ({ courses, isLoading, selectedCourse, onSelectCourse }: CourseSearchProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Search size={20} />
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
              className="w-full justify-between h-auto min-h-[60px] p-4"
            >
              {selectedCourse
                ? courses?.find((course) => course.id === selectedCourse)?.name
                : "Select golf course..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Search golf courses..." />
              <CommandList>
                <CommandEmpty>No golf course found.</CommandEmpty>
                <CommandGroup>
                  {courses?.map((course) => (
                    <CommandItem
                      key={course.id}
                      value={course.name}
                      onSelect={() => {
                        onSelectCourse(course.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCourse === course.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {course.name}
                      <Badge variant="secondary" className="ml-auto">
                        {course.holes} Holes
                      </Badge>
                    </CommandItem>
                  ))}
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
