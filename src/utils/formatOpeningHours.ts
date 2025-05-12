
import { OpeningHours } from "@/lib/supabase";

interface FormattedDay {
  day: string;
  hours: string;
}

export const formatOpeningHours = (openingHours: OpeningHours): FormattedDay[] => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  return days.map((day, index) => {
    const dayData = openingHours[index];
    let hours = 'Closed';
    
    if (dayData && dayData.isOpen) {
      const open = dayData.open || '00:00';
      const close = dayData.close || '23:59';
      hours = `${open} - ${close}`;
    }
    
    return {
      day,
      hours
    };
  });
};

export default formatOpeningHours;
