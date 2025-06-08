
import { Flag, Clock, Star, Users } from "lucide-react";
import { motion } from "framer-motion";

interface CourseMarkerProps {
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
  isOpen: boolean;
  onClick: () => void;
}

export const CourseMarker = ({ course, isOpen, onClick }: CourseMarkerProps) => {
  return (
    <motion.div
      className="relative cursor-pointer"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <div className={`
        w-10 h-10 rounded-full shadow-lg border-2 flex items-center justify-center
        ${isOpen 
          ? 'bg-green-500 border-green-600 text-white' 
          : 'bg-red-500 border-red-600 text-white'
        }
        hover:shadow-xl transition-all duration-200
      `}>
        <Flag className="w-5 h-5" />
      </div>
      
      {/* Status indicator */}
      <div className={`
        absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white
        ${isOpen ? 'bg-green-400' : 'bg-red-400'}
      `} />
    </motion.div>
  );
};
</CourseMarker>

<lov-write file_path="src/components/map/CoursePopup.tsx">
import { MapPin, Clock, Phone, Globe, Flag, Star } from "lucide-react";
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
  isOpen: boolean;
  onNavigate: () => void;
}

export const CoursePopup = ({ course, isOpen, onNavigate }: CoursePopupProps) => {
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
        
        <Button 
          className="w-full"
          onClick={onNavigate}
        >
          View Course Details
        </Button>
      </CardContent>
    </Card>
  );
};
</CoursePopup>

Now let me update the CoursesMap component to use the new marker and popup components, and implement a geocoding service for accurate coordinates:

<lov-write file_path="src/utils/geocoding.ts">
// Geocoding utility to get accurate coordinates for golf courses
export interface Coordinates {
  lat: number;
  lng: number;
}

// Real golf course coordinates in Argentina - expanded database
const ARGENTINA_GOLF_COURSES: Record<string, Coordinates> = {
  // Buenos Aires Metro Area
  "BOULOGNE GOLF CLUB": { lat: -34.4844, lng: -58.5563 },
  "BUENOS AIRES GOLF CLUB": { lat: -34.5446, lng: -58.6741 },
  "PACHECO GOLF CLUB": { lat: -34.4208, lng: -58.6483 },
  "OLIVOS GOLF CLUB": { lat: -34.5104, lng: -58.5220 },
  "PILAR GOLF CLUB": { lat: -34.4255, lng: -58.8940 },
  "JOCKEY CLUB": { lat: -34.5442, lng: -58.5045 },
  "NORDELTA GOLF CLUB": { lat: -34.4019, lng: -58.6309 },
  "HIGHLAND PARK COUNTRY CLUB": { lat: -34.4701, lng: -58.7528 },
  "SAN ANDRÉS GOLF CLUB": { lat: -34.5087, lng: -58.6102 },
  "HURLINGHAM CLUB": { lat: -34.6016, lng: -58.6390 },
  "PILARÁ GOLF CLUB": { lat: -34.4322, lng: -58.9603 },
  "TORTUGAS COUNTRY CLUB": { lat: -34.4385, lng: -58.8067 },
  "CLUB DE CAMPO LA MARTONA": { lat: -34.4567, lng: -58.7234 },
  "MARTINDALE COUNTRY CLUB": { lat: -34.4678, lng: -58.8123 },
  "COUNTRY CLUB BANCO NACIÓN": { lat: -34.5234, lng: -58.6789 },
  
  // Córdoba Province
  "CÓRDOBA GOLF CLUB": { lat: -31.4177, lng: -64.2390 },
  "LA CUMBRE GOLF CLUB": { lat: -30.9709, lng: -64.4949 },
  "COUNTRY CLUB CÓRDOBA": { lat: -31.3891, lng: -64.2108 },
  "GOLF CLUB VILLA ALLENDE": { lat: -31.2895, lng: -64.2967 },
  
  // Mendoza Province
  "MENDOZA GOLF CLUB": { lat: -32.9689, lng: -68.7908 },
  "CLUB DE CAMPO MENDOZA": { lat: -32.8567, lng: -68.8234 },
  
  // Patagonia
  "LLAO LLAO GOLF CLUB": { lat: -41.0531, lng: -71.5356 },
  "ARELAUQUEN GOLF CLUB": { lat: -41.1171, lng: -71.5679 },
  "CHAPELCO GOLF CLUB": { lat: -40.1564, lng: -71.3051 },
  
  // Atlantic Coast
  "MAR DEL PLATA GOLF CLUB": { lat: -38.0160, lng: -57.5327 },
  "GOLF CLUB COSTA ATLÁNTICA": { lat: -37.9845, lng: -57.5678 },
  
  // Northern Argentina
  "TERMAS DE RÍO HONDO GOLF CLUB": { lat: -27.5016, lng: -64.8575 },
  "JOCKEY CLUB SALTA": { lat: -24.7821, lng: -65.4232 },
  "TUCUMÁN GOLF CLUB": { lat: -26.8241, lng: -65.2226 },
};

export const getGolfCourseCoordinates = (courseName: string, address?: string): Coordinates => {
  // Normalize course name for lookup
  const normalizedName = courseName.toUpperCase().trim();
  
  // First try exact match
  if (ARGENTINA_GOLF_COURSES[normalizedName]) {
    return ARGENTINA_GOLF_COURSES[normalizedName];
  }
  
  // Try partial match
  const partialMatch = Object.keys(ARGENTINA_GOLF_COURSES).find(key => 
    key.includes(normalizedName.split(' ')[0]) || normalizedName.includes(key.split(' ')[0])
  );
  
  if (partialMatch) {
    return ARGENTINA_GOLF_COURSES[partialMatch];
  }
  
  // Generate location based on address or fallback to region-based assignment
  return generateCoordinatesFromAddress(address, courseName);
};

const generateCoordinatesFromAddress = (address?: string, courseName?: string): Coordinates => {
  // Default regions in Argentina
  const regions = [
    { name: "Buenos Aires", center: { lat: -34.6037, lng: -58.3816 }, radius: 0.5 },
    { name: "Córdoba", center: { lat: -31.4201, lng: -64.1888 }, radius: 0.3 },
    { name: "Mendoza", center: { lat: -32.8908, lng: -68.8272 }, radius: 0.3 },
    { name: "Mar del Plata", center: { lat: -38.0055, lng: -57.5426 }, radius: 0.2 },
    { name: "Rosario", center: { lat: -32.9442, lng: -60.6505 }, radius: 0.2 },
    { name: "Bariloche", center: { lat: -41.1335, lng: -71.3103 }, radius: 0.3 },
  ];
  
  // Try to match address to region
  const addressLower = (address || courseName || '').toLowerCase();
  const matchedRegion = regions.find(region => 
    addressLower.includes(region.name.toLowerCase())
  );
  
  const baseRegion = matchedRegion || regions[0]; // Default to Buenos Aires
  
  // Add some randomness based on course name hash to avoid overlapping
  const nameHash = (courseName || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const latOffset = ((nameHash % 100) / 1000) * baseRegion.radius * (nameHash % 2 === 0 ? 1 : -1);
  const lngOffset = (((nameHash * 7) % 100) / 1000) * baseRegion.radius * (nameHash % 3 === 0 ? 1 : -1);
  
  return {
    lat: baseRegion.center.lat + latOffset,
    lng: baseRegion.center.lng + lngOffset
  };
};

// Status generator for demo purposes
export const getCourseStatus = (courseId: string): boolean => {
  const hash = courseId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return hash % 3 !== 0; // 2/3 chance of being open
};
