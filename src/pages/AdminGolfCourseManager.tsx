
import { useState, useEffect } from "react";
import AdminGolfCourseForm from "./AdminCsvUpload"; // Maintained for form functionality 
import QuickAddGolfCourses from "@/components/admin/QuickAddGolfCourses";
import CourseList from "@/components/admin/CourseList";
import ImportGolfCourses from "@/components/admin/ImportGolfCourses";
import { OpeningHours } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

// Define interface that matches what CourseList is expecting
export interface GolfCourseTemplate {
  id?: string;
  name: string;
  holes: number;
  par: number;
  address: string;
  state: string;
  city: string;
  description: string;
  phone: string;
  website: string;
  image_url: string;
  image_gallery: string;
  opening_hours: OpeningHours;
}

const AdminGolfCourseManager = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [courseToEdit, setCourseToEdit] = useState<GolfCourseTemplate | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  // Effect to reset course to edit if tab changes away from form
  useEffect(() => {
    if (activeTab !== "form" && courseToEdit) {
      setCourseToEdit(null);
    }
  }, [activeTab, courseToEdit]);

  // Add effect to add viewport meta tag for mobile devices
  useEffect(() => {
    // Check if the viewport meta tag already exists
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    
    // If it doesn't exist, create one
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.setAttribute('name', 'viewport');
      document.head.appendChild(viewportMeta);
    }
    
    // Set the content to hide browser navigation on mobile
    viewportMeta.setAttribute('content', 
      'width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no');
    
    // Also add a meta tag to set the mobile web app capable attribute
    let webAppMeta = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
    if (!webAppMeta) {
      webAppMeta = document.createElement('meta');
      webAppMeta.setAttribute('name', 'apple-mobile-web-app-capable');
      webAppMeta.setAttribute('content', 'yes');
      document.head.appendChild(webAppMeta);
    }
    
    return () => {
      // No cleanup needed as we want these meta tags to persist
    };
  }, []);

  const handleEditCourse = (course: GolfCourseTemplate) => {
    setCourseToEdit(course);
    setActiveTab("form");
  };

  const handleFormSubmitted = () => {
    setCourseToEdit(null);
    setActiveTab("list");
    toast({
      title: "Éxito",
      description: "Campo de golf guardado correctamente"
    });
    // Trigger list refresh
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">Panel de Administración de Campos de Golf</h1>
        <p className="text-muted-foreground">
          Administra la información de los campos de golf en el sistema.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button 
          onClick={() => {
            setCourseToEdit(null);
            setActiveTab("form");
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          Agregar Nuevo Campo
        </button>
        
        <button 
          onClick={() => {
            setActiveTab("list");
            setRefreshTrigger(prev => prev + 1); // Force refresh when switching to list
          }} 
          className={`px-4 py-2 rounded-md ${activeTab === "list" 
            ? "bg-blue-600 text-white" 
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
        >
          Ver Lista de Campos
        </button>
        
        <button 
          onClick={() => setActiveTab("quick")} 
          className={`px-4 py-2 rounded-md ${activeTab === "quick" 
            ? "bg-blue-600 text-white" 
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
        >
          Adición Rápida
        </button>
        
        <button 
          onClick={() => setActiveTab("import")} 
          className={`px-4 py-2 rounded-md ${activeTab === "import" 
            ? "bg-blue-600 text-white" 
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
        >
          Importar de Google Maps
        </button>
      </div>

      <div className="mt-4">
        {activeTab === "list" && (
          <CourseList 
            key={`course-list-${refreshTrigger}`} 
            onEditCourse={handleEditCourse} 
          />
        )}
        
        {activeTab === "form" && (
          <AdminGolfCourseForm 
            initialCourse={courseToEdit} 
            onSubmitSuccess={handleFormSubmitted} 
          />
        )}
        
        {activeTab === "quick" && (
          <QuickAddGolfCourses />
        )}
        
        {activeTab === "import" && (
          <ImportGolfCourses />
        )}
      </div>
    </div>
  );
};

export default AdminGolfCourseManager;
