
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { OpeningHours } from "@/lib/supabase";

interface AdminGolfCourseFormProps {
  initialCourse?: {
    id?: string;
    name: string;
    holes: number;
    par: number;
    address: string;
    state: string;
    opening_hours?: OpeningHours;
  } | null;
  onSubmitSuccess?: () => void;
}

const AdminGolfCourseForm = ({ initialCourse = null, onSubmitSuccess }: AdminGolfCourseFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = Boolean(initialCourse?.id);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    holes: 18,
    par: 72,
    address: "",
    state: "",
    opening_hours: [
      { isOpen: false, open: null, close: null }, // Monday
      { isOpen: true, open: "08:00", close: "18:00" }, // Tuesday
      { isOpen: true, open: "08:00", close: "18:00" }, // Wednesday
      { isOpen: true, open: "08:00", close: "18:00" }, // Thursday
      { isOpen: true, open: "08:00", close: "18:00" }, // Friday
      { isOpen: true, open: "08:00", close: "18:00" }, // Saturday
      { isOpen: true, open: "08:00", close: "18:00" }  // Sunday
    ] as OpeningHours
  });

  // Initialize form with course data if editing
  useEffect(() => {
    if (initialCourse) {
      setFormData({
        name: initialCourse.name || "",
        holes: initialCourse.holes || 18,
        par: initialCourse.par || 72,
        address: initialCourse.address || "",
        state: initialCourse.state || "",
        opening_hours: initialCourse.opening_hours || formData.opening_hours,
      });
    }
  }, [initialCourse]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    // Handle number inputs
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseInt(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!formData.name) {
        throw new Error("El nombre del campo es obligatorio");
      }

      // Generate default hole pars based on holes count
      const holePars = Array(formData.holes).fill(4);
      
      if (isEditMode && initialCourse?.id) {
        // Update existing golf course
        const { error } = await supabase
          .from("golf_courses")
          .update({
            name: formData.name,
            holes: formData.holes,
            par: formData.par,
            address: formData.address,
            state: formData.state,
            hole_pars: holePars,
            opening_hours: formData.opening_hours,
            updated_at: new Date().toISOString()
          })
          .eq("id", initialCourse.id);
          
        if (error) throw error;
        
        toast({
          title: "Campo actualizado",
          description: `${formData.name} ha sido actualizado correctamente`,
          variant: "default"
        });
      } else {
        // Create new golf course
        const { error } = await supabase
          .from("golf_courses")
          .insert({
            name: formData.name,
            holes: formData.holes,
            par: formData.par,
            address: formData.address,
            state: formData.state,
            hole_pars: holePars,
            opening_hours: formData.opening_hours
          });
          
        if (error) throw error;
        
        toast({
          title: "Campo agregado",
          description: `${formData.name} ha sido agregado correctamente`,
          variant: "default"
        });
        
        // Reset form after successful submission for new courses
        if (!isEditMode) {
          setFormData({
            ...formData,
            name: "",
            address: "",
            state: ""
          });
        }
      }
      
      // Call the success callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: `Error al ${isEditMode ? "actualizar" : "agregar"} campo`,
        description: error.message || "Ha ocurrido un error",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? "Editar Campo de Golf" : "Agregar Nuevo Campo de Golf"}</CardTitle>
        <CardDescription>
          Completa el formulario para {isEditMode ? "actualizar" : "agregar"} un campo de golf.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre del Campo *</Label>
              <Input 
                id="name"
                name="name"
                placeholder="Nombre del campo de golf"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="holes">Número de Hoyos</Label>
                <Input 
                  id="holes"
                  name="holes"
                  type="number"
                  min="9"
                  max="36"
                  value={formData.holes}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="par">Par Total</Label>
                <Input 
                  id="par"
                  name="par"
                  type="number"
                  min="30"
                  max="100"
                  value={formData.par}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="address">Dirección</Label>
              <Input 
                id="address"
                name="address"
                placeholder="Dirección del campo"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="state">Provincia/Estado</Label>
              <Input 
                id="state"
                name="state"
                placeholder="Provincia o estado"
                value={formData.state}
                onChange={handleInputChange}
              />
            </div>
            
            {/* Opening hours could be added here in a more complete form */}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? `${isEditMode ? "Actualizando" : "Agregando"}...` 
                : `${isEditMode ? "Actualizar" : "Agregar"} Campo`}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminGolfCourseForm;
