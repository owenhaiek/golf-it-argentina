
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminGolfCourseForm from "./AdminCsvUpload"; // Usamos el mismo archivo pero ahora tiene un componente diferente
import QuickAddGolfCourses from "@/components/admin/QuickAddGolfCourses";

interface GolfCourseTemplate {
  name: string;
  holes: number;
  par: number;
  address: string;
  state: string;
  opening_hours: any[];
}

const AdminGolfCourseManager = () => {
  const [activeTab, setActiveTab] = useState("form");

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">Panel de Administración de Campos de Golf</h1>
        <p className="text-muted-foreground">
          Administra la información de los campos de golf en el sistema.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form">Formulario Completo</TabsTrigger>
          <TabsTrigger value="quick">Adición Rápida</TabsTrigger>
        </TabsList>
        
        <TabsContent value="form" className="mt-4">
          <AdminGolfCourseForm />
        </TabsContent>
        
        <TabsContent value="quick" className="mt-4">
          <QuickAddGolfCourses />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminGolfCourseManager;
