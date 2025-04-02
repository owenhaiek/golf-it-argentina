import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Globe, Flag, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import ReservationForm from "@/components/course/ReservationForm";

const Course = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('golf_courses')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    }
  });

  const isGolfCourseOpen = (openHours: string | null): boolean => {
    if (!openHours) return false;
    
    try {
      const today = currentTime.getDay(); // 0 = Sunday, 1 = Monday, ...
      const hours = JSON.parse(openHours);
      
      if (!hours[today] || !hours[today].isOpen) return false;
      
      const { open, close } = hours[today];
      if (!open || !close) return false;
      
      const currentHour = currentTime.getHours();
      const currentMinute = currentTime.getMinutes();
      
      const [openHour, openMinute] = open.split(':').map(Number);
      const [closeHour, closeMinute] = close.split(':').map(Number);
      
      const currentTotalMinutes = currentHour * 60 + currentMinute;
      const openTotalMinutes = openHour * 60 + openMinute;
      const closeTotalMinutes = closeHour * 60 + closeMinute;
      
      return currentTotalMinutes >= openTotalMinutes && currentTotalMinutes < closeTotalMinutes;
    } catch (error) {
      console.error("Error parsing opening hours:", error);
      return false;
    }
  };

  const formatOpeningHours = (openHours: string | null): React.ReactNode => {
    if (!openHours) return <span className="text-muted-foreground">{t("course", "hoursNotAvailable")}</span>;
    
    try {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const hours = JSON.parse(openHours);
      const today = currentTime.getDay();
      
      return (
        <div className="space-y-1 mt-1">
          {days.map((day, index) => {
            const dayInfo = hours[index];
            const isToday = index === today;
            
            if (!dayInfo) {
              return (
                <div key={day} className={`flex justify-between text-xs ${isToday ? 'font-semibold' : ''}`}>
                  <span>{day}{isToday ? ' (Today)' : ''}</span>
                  <span className="text-muted-foreground">{t("course", "hoursNotAvailable")}</span>
                </div>
              );
            }
            
            if (!dayInfo.isOpen) {
              return (
                <div key={day} className={`flex justify-between text-xs ${isToday ? 'font-semibold' : ''}`}>
                  <span>{day}{isToday ? ' (Today)' : ''}</span>
                  <span className="text-muted-foreground">{t("course", "closed")}</span>
                </div>
              );
            }
            
            return (
              <div key={day} className={`flex justify-between text-xs ${isToday ? 'font-semibold' : ''}`}>
                <span>{day}{isToday ? ' (Today)' : ''}</span>
                <span>{dayInfo.open} - {dayInfo.close}</span>
              </div>
            );
          })}
        </div>
      );
    } catch (error) {
      console.error("Error formatting opening hours:", error);
      return <span className="text-muted-foreground">{t("course", "hoursNotAvailable")}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-1/3 bg-secondary/20 rounded" />
        <div className="h-64 bg-secondary/20 rounded-none" />
        <div className="space-y-2">
          <div className="h-4 w-2/3 bg-secondary/20 rounded" />
          <div className="h-4 w-1/2 bg-secondary/20 rounded" />
        </div>
      </div>
    );
  }

  if (!course) {
    return <div className="text-center">Course not found</div>;
  }

  const isOpen = isGolfCourseOpen(course.opening_hours);

  return (
    <div className="space-y-6 -mx-4">
      <div className="flex items-center justify-between px-4">
        <h1 className="text-2xl font-bold text-left">{course.name}</h1>
        <div>
          <ReservationForm courseId={course.id} courseName={course.name} />
        </div>
      </div>
      
      {course.image_url ? (
        <img 
          src={course.image_url} 
          alt={course.name} 
          className="w-full h-64 object-cover" 
        />
      ) : (
        <div className="w-full h-64 bg-secondary/20 flex items-center justify-center text-muted-foreground">
          No image available
        </div>
      )}

      <Card className="border-0 shadow-none mx-4">
        <CardContent className="p-4 space-y-6">
          {course.description && (
            <div className="space-y-1">
              <h3 className="font-semibold text-base">{t("course", "about")}</h3>
              <p className="text-sm text-muted-foreground">{course.description}</p>
            </div>
          )}

          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <Flag className="text-primary mt-1" size={18} />
              <div>
                <h3 className="font-semibold text-sm">{t("course", "courseDetails")}</h3>
                <p className="text-xs text-muted-foreground">
                  {course.holes} {t("course", "holes")} {course.par && `• ${t("course", "par")} ${course.par}`}
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <Clock className={`mt-1 ${isOpen ? 'text-green-600' : 'text-amber-600'}`} size={18} />
              <div>
                <h3 className="font-semibold text-sm flex items-center gap-1">
                  {t("course", "hours")}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${isOpen ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {isOpen ? t("course", "open") : t("course", "closed")}
                  </span>
                </h3>
                {formatOpeningHours(course.opening_hours)}
              </div>
            </li>

            {course.address && (
              <li className="flex items-start gap-3">
                <MapPin className="text-primary mt-1" size={18} />
                <div>
                  <h3 className="font-semibold text-sm">{t("course", "location")}</h3>
                  <p className="text-xs text-muted-foreground">
                    {[course.address, course.city, course.state].filter(Boolean).join(', ')}
                  </p>
                </div>
              </li>
            )}

            {course.phone && (
              <li className="flex items-start gap-3">
                <Phone className="text-primary mt-1" size={18} />
                <div>
                  <h3 className="font-semibold text-sm">{t("course", "contact")}</h3>
                  <p className="text-xs text-muted-foreground">{course.phone}</p>
                </div>
              </li>
            )}

            {course.website && (
              <li className="flex items-start gap-3">
                <Globe className="text-primary mt-1" size={18} />
                <div>
                  <h3 className="font-semibold text-sm">{t("course", "website")}</h3>
                  <a 
                    href={course.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-primary hover:underline"
                  >
                    {t("course", "visitWebsite")}
                  </a>
                </div>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Course;
