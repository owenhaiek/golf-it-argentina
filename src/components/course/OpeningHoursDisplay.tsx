import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ChevronDown } from "lucide-react";
import { OpeningHours, getCurrentDayIndex } from "@/utils/openingHours";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface OpeningHoursDisplayProps {
  openingHours: OpeningHours | null;
}

const OpeningHoursDisplay = ({ openingHours }: OpeningHoursDisplayProps) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
  // Day names array matching our opening hours array (0=Monday, 6=Sunday)
  const dayNames = [
    t("course", "monday"),    // Index 0 = Monday
    t("course", "tuesday"),   // Index 1 = Tuesday
    t("course", "wednesday"), // Index 2 = Wednesday
    t("course", "thursday"),  // Index 3 = Thursday
    t("course", "friday"),    // Index 4 = Friday
    t("course", "saturday"),  // Index 5 = Saturday
    t("course", "sunday")     // Index 6 = Sunday
  ];

  if (!openingHours || !Array.isArray(openingHours)) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar size={16} />
            <span className="text-sm">{t("course", "hoursNotAvailable")}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentDayIndex = getCurrentDayIndex();
  
  const getDayStatus = (day: any) => {
    return day && 
      day.isOpen === true && 
      day.open && 
      day.close && 
      day.open.trim() !== '' && 
      day.close.trim() !== '' &&
      day.open !== 'null' &&
      day.close !== 'null';
  };

  const currentDay = openingHours[currentDayIndex];
  const isDayOpen = getDayStatus(currentDay);

  return (
    <Card>
      <CardContent className="p-3">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-primary" />
              <span className="text-sm font-medium">{t("course", "openingHours")}</span>
            </div>
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <span>{isOpen ? t("course", "hide") : t("course", "viewAll")}</span>
                <ChevronDown 
                  size={14} 
                  className={cn(
                    "transition-transform duration-200",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
            </CollapsibleTrigger>
          </div>
          
          {/* Today's hours - always visible */}
          <div className="mt-2 flex justify-between items-center text-sm py-1.5 px-2 rounded bg-primary/10">
            <span className="text-primary font-medium">
              {t("course", "today")}
            </span>
            <span className="text-primary font-medium">
              {isDayOpen 
                ? `${currentDay.open} - ${currentDay.close}`
                : t("course", "closed")
              }
            </span>
          </div>

          {/* Other days - collapsible */}
          <CollapsibleContent className="mt-2 space-y-1">
            {openingHours.map((day, index) => {
              if (index === currentDayIndex) return null; // Skip today
              
              const dayName = dayNames[index];
              const isDayOpen = getDayStatus(day);
              
              return (
                <div 
                  key={index}
                  className="flex justify-between items-center text-sm py-1.5 px-2"
                >
                  <span className="text-muted-foreground">
                    {dayName}
                  </span>
                  <span className="text-foreground">
                    {isDayOpen 
                      ? `${day.open} - ${day.close}`
                      : t("course", "closed")
                    }
                  </span>
                </div>
              );
            })}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default OpeningHoursDisplay;
