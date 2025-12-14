
import { X, MapPin, Phone, Globe, Flag, Navigation, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  if (!course) return null;

  const defaultImageUrl = 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  
  const handleDirections = () => {
    const query = encodeURIComponent(`${course.name}, ${[course.address, course.city, course.state].filter(Boolean).join(', ')}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleViewCourse = () => {
    navigate(`/course/${course.id}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - tap to close */}
          <motion.div
            className="fixed inset-0 z-[200]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Slide-up bottom sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[250] bg-background border-t border-border shadow-2xl max-w-lg mx-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ 
              type: "spring", 
              damping: 30, 
              stiffness: 400,
            }}
            style={{ 
              paddingBottom: 'env(safe-area-inset-bottom, 16px)',
              borderRadius: '20px 20px 0 0'
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Header row with image, info, and close */}
            <div className="px-4 pb-3">
              <div className="flex gap-3">
                {/* Course thumbnail */}
                <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden">
                  <img 
                    src={course.image_url || defaultImageUrl}
                    alt={course.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = defaultImageUrl;
                    }}
                  />
                </div>
                
                {/* Course info */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold text-foreground leading-tight line-clamp-2">
                    {course.name}
                  </h2>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      <Flag className="w-3 h-3 mr-1" />
                      {course.holes}H{course.par && ` • P${course.par}`}
                    </Badge>
                  </div>
                  
                  {(course.address || course.city) && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="line-clamp-1">
                        {[course.city, course.state].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Close button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full h-8 w-8 flex-shrink-0 hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action buttons row - compact icons */}
            <div className="px-4 pb-4">
              <div className="flex gap-2">
                {/* View Course - primary action */}
                <Button 
                  className="flex-1 h-10 bg-primary hover:bg-primary/90"
                  onClick={handleViewCourse}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Campo
                </Button>

                {/* Secondary actions - icon only */}
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-10 w-10"
                  onClick={handleDirections}
                  title="Direcciones"
                >
                  <Navigation className="w-4 h-4" />
                </Button>
                
                {course.phone && (
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => window.open(`tel:${course.phone}`, '_blank')}
                    title="Llamar"
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                )}
                
                {course.website && (
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => window.open(course.website, '_blank')}
                    title="Sitio web"
                  >
                    <Globe className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
