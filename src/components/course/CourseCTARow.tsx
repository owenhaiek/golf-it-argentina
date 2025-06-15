
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Globe, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function CourseCTARow({ course, language, onLocationClick, onPhoneClick, onWebsiteClick }: any) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {course.address && (
        <Card 
          className="cursor-pointer hover:shadow-md transition-all duration-200 hover:bg-accent/10 border-2 hover:border-primary/20"
          onClick={onLocationClick}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm mb-1">{language === "en" ? "Get Directions" : "Obtener Direcciones"}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {[course.address, course.city, course.state].filter(Boolean).join(', ')}
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      )}

      {course.phone && (
        <Card 
          className="cursor-pointer hover:shadow-md transition-all duration-200 hover:bg-accent/10 border-2 hover:border-primary/20"
          onClick={onPhoneClick}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm mb-1">{language === "en" ? "Call Course" : "Llamar"}</p>
                <p className="text-xs text-muted-foreground">{course.phone}</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      )}

      {course.website && (
        <Card 
          className="cursor-pointer hover:shadow-md transition-all duration-200 hover:bg-accent/10 border-2 hover:border-primary/20"
          onClick={onWebsiteClick}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm mb-1">{language === "en" ? "Visit Website" : "Visitar Web"}</p>
                <p className="text-xs text-muted-foreground truncate">Website</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
