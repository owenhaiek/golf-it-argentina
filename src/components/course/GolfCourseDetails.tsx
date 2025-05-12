
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Globe, Info, Clock } from "lucide-react";
import { formatOpeningHours, OpeningHours, isOpenNow } from "@/utils/openingHours";

export interface GolfCourse {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  website: string;
  description: string;
  holes: number;
  par: number;
  image_url: string;
  opening_hours: OpeningHours | null;
}

export interface GolfCourseDetailsProps {
  course: GolfCourse;
}

export function GolfCourseDetails({ course }: GolfCourseDetailsProps) {
  return (
    <Card className="bg-card shadow-sm">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold">{course.name}</h3>
          <Badge variant={isOpenNow(course.opening_hours) ? "secondary" : "destructive"}>
            {isOpenNow(course.opening_hours) ? "Open" : "Closed"}
          </Badge>
        </div>
        
        <p className="text-muted-foreground text-sm">{course.description}</p>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{course.address}, {course.city}, {course.state}</span>
          </div>
          
          {course.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${course.phone}`} className="hover:underline">{course.phone}</a>
            </div>
          )}
          
          {course.website && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <a href={course.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {course.website.replace(/(^\w+:|^)\/\//, '')}
              </a>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span>{course.holes} holes, par {course.par}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formatOpeningHours(course.opening_hours)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
