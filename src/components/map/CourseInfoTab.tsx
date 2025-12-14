
import { X, MapPin, Phone, Globe, Flag, Navigation, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence, useDragControls, PanInfo } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

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
  const dragControls = useDragControls();
  const constraintsRef = useRef(null);

  if (!course) return null;

  const defaultImageUrl = 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  
  const handleDirections = () => {
    const query = encodeURIComponent(`${course.name}, ${[course.address, course.city, course.state].filter(Boolean).join(', ')}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleViewCourse = () => {
    navigate(`/course/${course.id}`);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    // Close if dragged down more than 80px or with enough velocity
    if (info.offset.y > 80 || info.velocity.y > 500) {
      onClose();
    }
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
          
          {/* Slide-up bottom sheet with drag support */}
          <motion.div
            ref={constraintsRef}
            className="fixed bottom-0 left-0 right-0 z-[250] bg-background border-t border-border shadow-2xl max-w-lg mx-auto touch-none"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            transition={{ 
              type: "spring", 
              damping: 30, 
              stiffness: 400,
            }}
            style={{ 
              borderRadius: '20px 20px 0 0',
              paddingBottom: 'max(env(safe-area-inset-bottom), 16px)'
            }}
          >
            {/* Drag handle - larger touch target */}
            <div 
              className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="w-12 h-1.5 bg-muted-foreground/40 rounded-full" />
            </div>

            {/* Content container with fixed height */}
            <div className="px-4 pb-4">
              {/* Header row with image, info, and close */}
              <div className="flex gap-3 mb-3">
                {/* Course thumbnail */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden">
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
                <div className="flex-1 min-w-0 py-0.5">
                  <h2 className="text-sm sm:text-base font-bold text-foreground leading-tight line-clamp-2">
                    {course.name}
                  </h2>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      <Flag className="w-3 h-3 mr-1" />
                      {course.holes}H{course.par && ` • P${course.par}`}
                    </Badge>
                  </div>
                  
                  {(course.address || course.city) && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
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

              {/* Action buttons row - compact */}
              <div className="flex gap-2">
                {/* View Course - primary action */}
                <Button 
                  className="flex-1 h-9 bg-primary hover:bg-primary/90 text-sm"
                  onClick={handleViewCourse}
                >
                  <Eye className="w-4 h-4 mr-1.5" />
                  Ver Campo
                </Button>

                {/* Secondary actions - icon only */}
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-9 w-9"
                  onClick={handleDirections}
                  title="Direcciones"
                >
                  <Navigation className="w-4 h-4" />
                </Button>
                
                {course.phone && (
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-9 w-9"
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
                    className="h-9 w-9"
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
