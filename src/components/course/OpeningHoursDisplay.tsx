
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { OpeningHours, getDayName, getCurrentDayIndex } from "@/utils/openingHours";
import { cn } from "@/lib/utils";

interface OpeningHoursDisplayProps {
  openingHours: OpeningHours | null;
}

const OpeningHoursDisplay = ({ openingHours }: OpeningHoursDisplayProps) => {
  if (!openingHours || !Array.isArray(openingHours)) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar size={16} />
            <span className="text-sm">Hours not available</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentDayIndex = getCurrentDayIndex();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={16} className="text-primary" />
          <span className="text-sm font-medium">Opening Hours</span>
        </div>
        <div className="space-y-2">
          {openingHours.map((day, index) => {
            const isToday = index === currentDayIndex;
            const dayName = getDayName(index);
            
            // Improved validation logic for determining if a day is open
            const isDayOpen = day && 
              day.isOpen === true && 
              day.open && 
              day.close && 
              day.open.trim() !== '' && 
              day.close.trim() !== '' &&
              day.open !== 'null' &&
              day.close !== 'null';
            
            return (
              <div 
                key={index}
                className={cn(
                  "flex justify-between items-center text-sm py-1",
                  isToday && "bg-primary/10 px-2 rounded font-medium"
                )}
              >
                <span className={cn(
                  "text-muted-foreground",
                  isToday && "text-primary font-medium"
                )}>
                  {dayName}
                </span>
                <span className={cn(
                  "text-foreground",
                  isToday && "text-primary font-medium"
                )}>
                  {isDayOpen 
                    ? `${day.open} - ${day.close}`
                    : "Closed"
                  }
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default OpeningHoursDisplay;
