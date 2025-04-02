
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { 
  GolfCourseInformation, 
  GolfCourseAbout, 
  GolfCourseFacilities, 
  GolfCourseAmenities 
} from "@/components/course/GolfCourseDetails";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsList, TabsTrigger, Tabs, TabsContent } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, CalendarIcon, Clock, MapPin, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { isOpenNow } from "@/utils/openingHours";
import ReservationForm from "@/components/course/ReservationForm";

type CourseParams = {
  id: string;
};

const Course = () => {
  const { id } = useParams<CourseParams>();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("about");
  
  // Fetch course data
  const { data: course, isLoading, error } = useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("golf_courses")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
  });

  useEffect(() => {
    if (error) {
      toast({
        title: language === "en" ? "Error" : "Error",
        description: language === "en" 
          ? "Failed to load course information" 
          : "Error al cargar la información del campo",
        variant: "destructive",
      });
    }
  }, [error, toast, language]);

  const handleBack = () => {
    navigate(-1);
  };

  const openNow = course?.opening_hours ? isOpenNow(course.opening_hours) : false;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl animate-fadeIn">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {language === "en" ? "Back" : "Atrás"}
        </Button>
        
        <div className="space-y-6">
          <AspectRatio ratio={16/9} className="bg-muted rounded-lg overflow-hidden">
            <Skeleton className="w-full h-full" />
          </AspectRatio>
          
          <div>
            <Skeleton className="h-8 w-2/3 mb-2" />
            <Skeleton className="h-4 w-1/3 mb-4" />
            <div className="flex gap-2 mb-6">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
          
          <Tabs defaultValue="about">
            <TabsList className="grid grid-cols-3 w-full">
              <Skeleton className="h-10 rounded-md" />
              <Skeleton className="h-10 rounded-md" />
              <Skeleton className="h-10 rounded-md" />
            </TabsList>
            <div className="mt-4">
              <Skeleton className="h-32 w-full mb-4" />
            </div>
          </Tabs>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {language === "en" ? "Back" : "Atrás"}
        </Button>
        
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <h2 className="text-xl font-semibold mb-2">
            {language === "en" ? "Course Not Found" : "Campo No Encontrado"}
          </h2>
          <p className="text-muted-foreground mb-4">
            {language === "en" 
              ? "The golf course you're looking for doesn't exist or has been removed." 
              : "El campo de golf que estás buscando no existe o ha sido eliminado."}
          </p>
          <Button onClick={() => navigate("/")}>
            {language === "en" ? "Go to Homepage" : "Ir a la Página Principal"}
          </Button>
        </div>
      </div>
    );
  }

  const courseLocation = course.city && course.state 
    ? `${course.city}, ${course.state}`
    : course.city || course.state || "";

  return (
    <div className="container mx-auto px-4 py-6 pb-24 max-w-4xl animate-fadeIn">
      <Button variant="ghost" onClick={handleBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        {language === "en" ? "Back" : "Atrás"}
      </Button>
      
      <AspectRatio ratio={16/9} className="bg-muted rounded-lg overflow-hidden mb-6">
        {course.image_url ? (
          <img
            src={course.image_url}
            alt={course.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-muted">
            <p className="text-muted-foreground">
              {language === "en" ? "No image available" : "Imagen no disponible"}
            </p>
          </div>
        )}
      </AspectRatio>
      
      <div className="mb-4">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold mb-2">{course.name}</h1>
          <Badge variant={openNow ? "default" : "secondary"}>
            {openNow 
              ? t("course", "openNow") 
              : t("course", "closed")}
          </Badge>
        </div>
        {courseLocation && (
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{courseLocation}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-1 text-sm">
          <Badge variant="outline">
            {course.holes} {t("course", "holes")}
          </Badge>
        </div>
        
        {course.par && (
          <div className="flex items-center gap-1 text-sm">
            <Badge variant="outline">
              {t("course", "par")} {course.par}
            </Badge>
          </div>
        )}
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center text-sm mb-2">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium">{t("course", "hours")}</span>
              </div>
              <GolfCourseInformation course={course} />
            </div>
            
            <div>
              <div className="flex items-center text-sm mb-2">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium">{t("course", "address")}</span>
              </div>
              <p className="text-sm">{course.address || "-"}</p>
              <p className="text-sm">{courseLocation || "-"}</p>
              
              {course.phone && (
                <>
                  <div className="flex items-center text-sm mt-4 mb-2">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">{t("course", "contact")}</span>
                  </div>
                  <p className="text-sm">{course.phone}</p>
                </>
              )}
              
              {course.website && (
                <>
                  <div className="flex items-center text-sm mt-4 mb-2">
                    <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">{t("course", "website")}</span>
                  </div>
                  <a 
                    href={course.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {course.website}
                  </a>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mb-6">
        <ReservationForm 
          courseId={course.id} 
          courseName={course.name} 
          courseLocation={courseLocation}
        />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="about">{language === "en" ? "About" : "Acerca de"}</TabsTrigger>
          <TabsTrigger value="facilities">{language === "en" ? "Facilities" : "Instalaciones"}</TabsTrigger>
          <TabsTrigger value="amenities">{language === "en" ? "Amenities" : "Amenidades"}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>{t("course", "description")}</CardTitle>
            </CardHeader>
            <CardContent>
              <GolfCourseAbout course={course} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="facilities">
          <Card>
            <CardHeader>
              <CardTitle>{language === "en" ? "Facilities" : "Instalaciones"}</CardTitle>
            </CardHeader>
            <CardContent>
              <GolfCourseFacilities course={course} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="amenities">
          <Card>
            <CardHeader>
              <CardTitle>{language === "en" ? "Amenities" : "Amenidades"}</CardTitle>
            </CardHeader>
            <CardContent>
              <GolfCourseAmenities course={course} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("course", "reviews")}</CardTitle>
          <CardDescription>
            {language === "en"
              ? "What golfers are saying about this course"
              : "Lo que los golfistas dicen sobre este campo"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">
              {language === "en"
                ? "No reviews yet. Be the first to review this course!"
                : "Aún no hay reseñas. ¡Sé el primero en reseñar este campo!"}
            </p>
            <Button className="mt-4">
              {language === "en" ? "Write a Review" : "Escribir una Reseña"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Missing Globe component needed by the course page
const Globe = (props) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" x2="22" y1="12" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
};

export default Course;
