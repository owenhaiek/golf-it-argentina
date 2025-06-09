
import { X, MapPin, Phone, Globe, Flag, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface CourseInfoTabProps {
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
    latitude?: number;
    longitude?: number;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CourseInfoTab = ({ course, isOpen, onClose }: CourseInfoTabProps) => {
  if (!course) return null;

  const defaultImageUrl = 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  
  const handleDirections = () => {
    const query = encodeURIComponent(`${course.name}, ${[course.address, course.city, course.state].filter(Boolean).join(', ')}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/20 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Slide-down tab */}
          <motion.div
            className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-lg"
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 500,
              duration: 0.3 
            }}
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
          >
            <div className="max-w-md mx-auto bg-white">
              {/* Header with close button */}
              <div className="flex justify-end p-2 bg-white">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="rounded-full h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Course image */}
              <div className="relative h-48 mx-4 mb-4 rounded-lg overflow-hidden">
                <img 
                  src={course.image_url || defaultImageUrl}
                  alt={course.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = defaultImageUrl;
                  }}
                />
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="text-xs">
                    <Flag className="w-3 h-3 mr-1" />
                    {course.holes} holes
                    {course.par && ` • Par ${course.par}`}
                  </Badge>
                </div>
              </div>

              {/* Course info */}
              <div className="px-4 pb-4 space-y-4 bg-white">
                <div>
                  <h2 className="text-xl font-bold text-foreground leading-tight">
                    {course.name}
                  </h2>
                  
                  {(course.address || course.city) && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">
                        {[course.address, course.city, course.state].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  {course.phone && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => window.open(`tel:${course.phone}`, '_blank')}
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
                      onClick={() => window.open(course.website, '_blank')}
                    >
                      <Globe className="w-4 h-4 mr-1" />
                      Website
                    </Button>
                  )}
                </div>

                {/* Directions button */}
                <Button 
                  className="w-full"
                  onClick={handleDirections}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
