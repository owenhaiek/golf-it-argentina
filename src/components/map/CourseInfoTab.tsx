import { useState, useMemo } from "react";
import { X, MapPin, Phone, Globe, Flag, Navigation, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence, useDragControls, PanInfo } from "framer-motion";
import { useNavigate } from "react-router-dom";
import StarRating from "@/components/ui/StarRating";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CourseInfoTabProps {
  course: {
    id: string;
    name: string;
    holes: number;
    par?: number;
    image_url?: string;
    image_gallery?: string;
    address?: string;
    city?: string;
    state?: string;
    phone?: string;
    website?: string;
    latitude?: number;
    longitude?: number;
    is_open?: boolean;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  userLocation?: { lat: number; lng: number } | null;
}

// Calculate distance between two points (Haversine formula)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const CourseInfoTab = ({ course, isOpen, onClose, userLocation }: CourseInfoTabProps) => {
  const navigate = useNavigate();
  const dragControls = useDragControls();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Calculate distance to course if user location is available
  const distanceToUser = useMemo(() => {
    if (!userLocation || !course?.latitude || !course?.longitude) return null;
    const dist = calculateDistance(userLocation.lat, userLocation.lng, course.latitude, course.longitude);
    return dist;
  }, [userLocation, course?.latitude, course?.longitude]);

  // Fetch average rating for this course
  const { data: ratingData } = useQuery({
    queryKey: ['course-rating', course?.id],
    queryFn: async () => {
      if (!course?.id) return { average: 0, count: 0 };
      
      const { data, error } = await supabase
        .from('course_reviews')
        .select('rating')
        .eq('course_id', course.id);
      
      if (error) throw error;
      
      if (!data || data.length === 0) return { average: 0, count: 0 };
      
      const sum = data.reduce((acc, review) => acc + review.rating, 0);
      return { 
        average: sum / data.length,
        count: data.length
      };
    },
    enabled: !!course?.id,
  });

  if (!course) return null;

  const defaultImageUrl = 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  
  // Build images array from image_url and image_gallery
  const buildImagesArray = (): string[] => {
    const images: string[] = [];
    
    if (course.image_url) {
      images.push(course.image_url);
    }
    
    if (course.image_gallery) {
      try {
        const galleryImages = course.image_gallery.split(',').map(url => url.trim()).filter(Boolean);
        galleryImages.forEach(img => {
          if (!images.includes(img)) {
            images.push(img);
          }
        });
      } catch (e) {
        console.warn('Failed to parse image gallery');
      }
    }
    
    return images.length > 0 ? images : [defaultImageUrl];
  };

  const images = buildImagesArray();
  
  const handleDirections = () => {
    const query = encodeURIComponent(`${course.name}, ${[course.address, course.city, course.state].filter(Boolean).join(', ')}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleViewCourse = () => {
    navigate(`/course/${course.id}`);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 80 || info.velocity.y > 500) {
      onClose();
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Handle image swipe
  const handleImageDragEnd = (_: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold) {
      nextImage();
    } else if (info.offset.x > threshold) {
      prevImage();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[200]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Bottom sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[250] bg-background border-t border-border shadow-2xl max-w-lg mx-auto touch-none"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            style={{ 
              borderRadius: '24px 24px 0 0',
              paddingBottom: 'env(safe-area-inset-bottom, 16px)'
            }}
          >
            {/* Image Carousel - full width, touching top edge */}
            <div className="relative w-full h-48 sm:h-56 overflow-hidden rounded-t-3xl">
              {/* Drag handle overlay */}
              <div 
                className="absolute top-0 left-0 right-0 z-20 flex justify-center pt-3 pb-6 cursor-grab active:cursor-grabbing bg-gradient-to-b from-black/30 to-transparent"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="w-12 h-1.5 bg-white/60 rounded-full" />
              </div>

              {/* Close button - floating */}
              <Button
                variant="secondary"
                size="icon"
                onClick={onClose}
                className="absolute top-3 right-3 z-20 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-md"
              >
                <X className="h-4 w-4" />
              </Button>

              <AnimatePresence mode="popLayout" initial={false}>
                <motion.img
                  key={currentImageIndex}
                  src={images[currentImageIndex]}
                  alt={course.name}
                  className="absolute inset-0 w-full h-full object-cover cursor-grab active:cursor-grabbing"
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={handleImageDragEnd}
                  onError={(e) => {
                    e.currentTarget.src = defaultImageUrl;
                  }}
                />
              </AnimatePresence>

              {/* Carousel controls */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/70 backdrop-blur-sm shadow-md hover:bg-background/90"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/70 backdrop-blur-sm shadow-md hover:bg-background/90"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  {/* Dots indicator */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          idx === currentImageIndex 
                            ? 'bg-white w-4' 
                            : 'bg-white/50 hover:bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Badge overlay */}
              <div className="absolute bottom-2 left-2 z-10 flex gap-1.5">
                <Badge variant="secondary" className="text-xs bg-background/80 backdrop-blur-sm border-0">
                  <Flag className="w-3 h-3 mr-1" />
                  {course.holes}H{course.par && ` • Par ${course.par}`}
                </Badge>
                {/* Status Badge */}
                <Badge 
                  className={`text-xs backdrop-blur-sm border-0 ${
                    course.is_open !== false
                      ? 'bg-green-500/90 text-white hover:bg-green-500' 
                      : 'bg-red-500/90 text-white hover:bg-red-500'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${course.is_open !== false ? 'bg-white animate-pulse' : 'bg-white/80'}`} />
                  {course.is_open !== false ? 'Abierto' : 'Cerrado'}
                </Badge>
              </div>
            </div>

            {/* Course Info */}
            <div className="px-4 pt-4 pb-2">
              <h2 className="text-lg font-bold text-foreground leading-tight line-clamp-2">
                {course.name}
              </h2>
              
              {/* Star Rating */}
              {ratingData && ratingData.count > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <StarRating rating={ratingData.average} size="md" showRating={true} />
                  <span className="text-xs text-muted-foreground">
                    ({ratingData.count} {ratingData.count === 1 ? 'reseña' : 'reseñas'})
                  </span>
                </div>
              )}
              {ratingData && ratingData.count === 0 && (
                <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                  <StarRating rating={0} size="sm" showRating={false} />
                  <span className="text-xs">Sin reseñas aún</span>
                </div>
              )}
              
              {(course.address || course.city) && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1.5">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="line-clamp-1">
                    {[course.city, course.state].filter(Boolean).join(', ')}
                  </span>
                  {distanceToUser !== null && (
                    <span className="ml-auto flex items-center gap-1 text-xs font-medium text-primary">
                      <Navigation className="w-3 h-3" />
                      {distanceToUser < 1 
                        ? `${Math.round(distanceToUser * 1000)}m` 
                        : `${distanceToUser.toFixed(1)} km`}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="px-4 pb-4 pt-2">
              <div className="flex gap-2">
                {/* Primary: View Course */}
                <Button 
                  className="flex-1 h-11 rounded-full bg-primary hover:bg-primary/90"
                  onClick={handleViewCourse}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Campo
                </Button>

                {/* Icon buttons */}
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-11 w-11 rounded-full"
                  onClick={handleDirections}
                  title="Direcciones"
                >
                  <Navigation className="w-5 h-5" />
                </Button>
                
                {course.phone && (
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-11 w-11 rounded-full"
                    onClick={() => window.open(`tel:${course.phone}`, '_blank')}
                    title="Llamar"
                  >
                    <Phone className="w-5 h-5" />
                  </Button>
                )}
                
                {course.website && (
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-11 w-11 rounded-full"
                    onClick={() => window.open(course.website, '_blank')}
                    title="Sitio web"
                  >
                    <Globe className="w-5 h-5" />
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
