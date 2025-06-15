
import { MapPin, Clock, Phone, Globe, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CoursePopupProps {
  course: {
    id: string;
    name: string;
    holes: number;
    par?: number;
    image_url?: string;
    address?: string;
    city?: string;
    state?: string;
    phone?: string;
    website?: string;
  };
  isOpen?: boolean;
  onNavigate?: () => void;
}

export const CoursePopup = ({ course, isOpen = true, onNavigate }: CoursePopupProps) => {
  const defaultImageUrl = 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  
  return (
    <Card className="w-80 max-w-sm overflow-hidden">
      <div className="relative h-32 bg-muted">
        <img 
          src={course.image_url || defaultImageUrl}
          alt={course.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = defaultImageUrl;
          }}
        />
        <div className="absolute top-2 right-2">
          <Badge variant={isOpen ? "default" : "destructive"} className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {isOpen ? "Open" : "Closed"}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg leading-tight">{course.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Flag className="w-4 h-4" />
            <span>{course.holes} holes</span>
            {course.par && (
              <>
                <span>•</span>
                <span>Par {course.par}</span>
              </>
            )}
          </div>
        </div>
        
        {(course.address || course.city) && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">
              {[course.address, course.city, course.state].filter(Boolean).join(', ')}
            </span>
          </div>
        )}
        
        <div className="flex gap-2">
          {course.phone && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`tel:${course.phone}`, '_blank');
              }}
            >
              <Phone className="w-4 h-4 mr-1" />
              Call
            </Button>
          )}
          
          {course.website && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                window.open(course.website, '_blank');
              }}
            >
              <Globe className="w-4 h-4 mr-1" />
              Website
            </Button>
          )}
        </div>
        
        {onNavigate && (
          <Button 
            className="w-full"
            onClick={onNavigate}
          >
            View Course Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Also export as default for backward compatibility
export default CoursePopup;
