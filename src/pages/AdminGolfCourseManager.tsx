
import React from "react";
import { AdminGolfCourseForm } from "@/components/admin/golf-course/AdminGolfCourseForm";

export interface GolfCourseTemplate {
  id?: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  website?: string;
  holes: number;
  par?: number;
  image_url?: string;
  image_gallery?: string;
  established_year?: number;
  type?: string;
  latitude?: number;
  longitude?: number;
  opening_hours?: Array<{
    isOpen: boolean;
    open: string;
    close: string;
  }>;
  hole_pars?: number[];
  hole_handicaps?: number[];
}

const AdminGolfCourseManager = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Gestor de Campos de Golf</h1>
        <p className="text-muted-foreground">
          Administra los campos de golf en tu sistema
        </p>
      </div>
      
      <AdminGolfCourseForm />
    </div>
  );
};

export default AdminGolfCourseManager;
