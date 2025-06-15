
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FavoriteButton } from "@/components/ui/FavoriteButton";

interface CourseCardProps {
  course: {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
    holes: number;
    par: number | null;
    image_url: string | null;
    image_gallery: string | null;
  };
}

export const CourseCard = ({ course }: CourseCardProps) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const defaultImageUrl = 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-card border-border group">
      <CardHeader className="p-0">
        <div className="relative h-48 bg-muted">
          <img
            src={imageError ? defaultImageUrl : (course.image_url || defaultImageUrl)}
            alt={course.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {course.name}
          </h3>
          <FavoriteButton courseId={course.id} />
        </div>
        
        {(course.city || course.state) && (
          <div className="flex items-center text-muted-foreground text-sm mb-3">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">
              {[course.city, course.state].filter(Boolean).join(", ")}
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="text-xs">
            {course.holes} holes
          </Badge>
          {course.par && (
            <Badge variant="outline" className="text-xs">
              Par {course.par}
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => navigate(`/course/${course.id}`)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

// Also export as default for backward compatibility
export default CourseCard;
