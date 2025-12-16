import { useState } from "react";
import { Clock, ChevronDown } from "lucide-react";
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
    t("course", "monday"),
    t("course", "tuesday"),
    t("course", "wednesday"),
    t("course", "thursday"),
    t("course", "friday"),
    t("course", "saturday"),
    t("course", "sunday")
  ];

  if (!openingHours || !Array.isArray(openingHours)) {
    return (
      <div className="bg-zinc-900 rounded-2xl p-4">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Clock className="h-5 w-5 text-amber-400" />
          </div>
          <span className="text-sm">{t("course", "hoursNotAvailable")}</span>
        </div>
      </div>
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
    <div className="bg-zinc-900 rounded-2xl overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center gap-4 hover:bg-zinc-800/50 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-white text-sm">{t("course", "openingHours")}</p>
                <span className={cn(
                  "text-[10px] font-medium px-2 py-0.5 rounded-full",
                  isDayOpen 
                    ? "bg-emerald-500/20 text-emerald-400" 
                    : "bg-red-500/20 text-red-400"
                )}>
                  {isDayOpen ? "Abierto" : "Cerrado"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("course", "today")}: {isDayOpen 
                  ? `${currentDay.open} - ${currentDay.close}`
                  : t("course", "closed")
                }
              </p>
            </div>
            <ChevronDown 
              className={cn(
                "h-5 w-5 text-zinc-600 transition-transform duration-200 flex-shrink-0",
                isOpen && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 pt-0">
            <div className="bg-zinc-800/50 rounded-xl overflow-hidden">
              {openingHours.map((day, index) => {
                const dayName = dayNames[index];
                const isDayOpenStatus = getDayStatus(day);
                const isToday = index === currentDayIndex;
                
                return (
                  <div 
                    key={index}
                    className={cn(
                      "flex justify-between items-center py-3 px-4 text-sm",
                      index !== openingHours.length - 1 && "border-b border-zinc-700/50",
                      isToday && "bg-emerald-500/10"
                    )}
                  >
                    <span className={cn(
                      "font-medium",
                      isToday ? "text-emerald-400" : "text-zinc-400"
                    )}>
                      {dayName}
                      {isToday && <span className="ml-2 text-[10px] opacity-70">(Hoy)</span>}
                    </span>
                    <span className={cn(
                      isDayOpenStatus ? "text-white" : "text-zinc-500"
                    )}>
                      {isDayOpenStatus 
                        ? `${day.open} - ${day.close}`
                        : t("course", "closed")
                      }
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default OpeningHoursDisplay;