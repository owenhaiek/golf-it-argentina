
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatOpeningHours, getDayName, OpeningHours } from "@/utils/openingHours";

// Types
type GolfCourse = {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  description?: string | null;
  phone?: string | null;
  website?: string | null;
  holes: number;
  par?: number | null;
  hole_pars?: number[] | null;
  opening_hours?: OpeningHours | null;
  image_url?: string | null;
};

interface GolfCourseComponentProps {
  course: GolfCourse;
}

// Opening hours information
export const GolfCourseInformation: React.FC<GolfCourseComponentProps> = ({ course }) => {
  const { language } = useLanguage();
  
  if (!course.opening_hours) {
    return (
      <p className="text-sm text-muted-foreground">
        {language === "en" ? "Hours not available" : "Horario no disponible"}
      </p>
    );
  }
  
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
  return (
    <ul className="text-sm space-y-1">
      {daysOfWeek.map((day, index) => (
        <li key={day} className="flex justify-between">
          <span>{language === "en" ? day : diasSemana[index]}:</span>
          <span>{formatOpeningHours(course.opening_hours, index)}</span>
        </li>
      ))}
    </ul>
  );
};

// About section
export const GolfCourseAbout: React.FC<GolfCourseComponentProps> = ({ course }) => {
  const { language } = useLanguage();
  
  if (!course.description) {
    return (
      <p className="text-muted-foreground">
        {language === "en" 
          ? "No description available for this course." 
          : "No hay descripción disponible para este campo."}
      </p>
    );
  }
  
  return <p>{course.description}</p>;
};

// Facilities section
export const GolfCourseFacilities: React.FC<GolfCourseComponentProps> = ({ course }) => {
  const { language } = useLanguage();
  
  // This is just a sample list of facilities - in a real app, this would come from the course data
  const facilities = [
    { id: 'driving_range', name: language === "en" ? "Driving Range" : "Campo de Práctica", available: Math.random() > 0.3 },
    { id: 'putting_green', name: language === "en" ? "Putting Green" : "Green de Práctica", available: Math.random() > 0.3 },
    { id: 'pro_shop', name: language === "en" ? "Pro Shop" : "Tienda Profesional", available: Math.random() > 0.3 },
    { id: 'golf_carts', name: language === "en" ? "Golf Carts" : "Carritos de Golf", available: Math.random() > 0.3 },
    { id: 'clubhouse', name: language === "en" ? "Clubhouse" : "Casa Club", available: Math.random() > 0.3 },
    { id: 'lessons', name: language === "en" ? "Golf Lessons" : "Clases de Golf", available: Math.random() > 0.3 },
  ];
  
  return (
    <ul className="grid grid-cols-2 gap-2">
      {facilities.map(facility => (
        <li key={facility.id} className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${facility.available ? 'bg-green-500' : 'bg-gray-300'}`}></span>
          <span className={facility.available ? '' : 'text-muted-foreground'}>{facility.name}</span>
        </li>
      ))}
    </ul>
  );
};

// Amenities section
export const GolfCourseAmenities: React.FC<GolfCourseComponentProps> = ({ course }) => {
  const { language } = useLanguage();
  
  // This is just a sample list of amenities - in a real app, this would come from the course data
  const amenities = [
    { id: 'restaurant', name: language === "en" ? "Restaurant" : "Restaurante", available: Math.random() > 0.3 },
    { id: 'bar', name: language === "en" ? "Bar" : "Bar", available: Math.random() > 0.3 },
    { id: 'lockers', name: language === "en" ? "Lockers" : "Vestuarios", available: Math.random() > 0.3 },
    { id: 'shower', name: language === "en" ? "Showers" : "Duchas", available: Math.random() > 0.3 },
    { id: 'wifi', name: "WiFi", available: Math.random() > 0.3 },
    { id: 'parking', name: language === "en" ? "Parking" : "Estacionamiento", available: Math.random() > 0.3 },
  ];
  
  return (
    <ul className="grid grid-cols-2 gap-2">
      {amenities.map(amenity => (
        <li key={amenity.id} className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${amenity.available ? 'bg-green-500' : 'bg-gray-300'}`}></span>
          <span className={amenity.available ? '' : 'text-muted-foreground'}>{amenity.name}</span>
        </li>
      ))}
    </ul>
  );
};
