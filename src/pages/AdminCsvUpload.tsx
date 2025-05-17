
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
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
    image_url?: string;
    description?: string;
    city?: string;
    phone?: string;
    website?: string;
    hole_pars?: number[];
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
    city: "",
    description: "",
    image_url: "",
    phone: "",
    website: "",
    opening_hours: [
      { isOpen: false, open: null, close: null }, // Monday
      { isOpen: true, open: "08:00", close: "18:00" }, // Tuesday
      { isOpen: true, open: "08:00", close: "18:00" }, // Wednesday
      { isOpen: true, open: "08:00", close: "18:00" }, // Thursday
      { isOpen: true, open: "08:00", close: "18:00" }, // Friday
      { isOpen: true, open: "08:00", close: "18:00" }, // Saturday
      { isOpen: true, open: "08:00", close: "18:00" }  // Sunday
    ] as OpeningHours,
    hole_pars: Array(18).fill(4)
  });

  // Initialize form with course data if editing
  useEffect(() => {
    if (initialCourse) {
      console.log("Initializing form with course data:", initialCourse);
      
      // Create default hole_pars array if not provided
      const hole_pars = initialCourse.hole_pars || Array(initialCourse.holes || 18).fill(4);
      
      setFormData({
        name: initialCourse.name || "",
        holes: initialCourse.holes || 18,
        par: initialCourse.par || 72,
        address: initialCourse.address || "",
        state: initialCourse.state || "",
        city: initialCourse.city || "",
        description: initialCourse.description || "",
        image_url: initialCourse.image_url || "",
        phone: initialCourse.phone || "",
        website: initialCourse.website || "",
        opening_hours: initialCourse.opening_hours || formData.opening_hours,
        hole_pars: hole_pars
      });
    } else {
      // Set default hole_pars for a new course
      setFormData(prev => ({
        ...prev,
        hole_pars: Array(prev.holes).fill(4)
      }));
    }
  }, [initialCourse]);

  // Update hole_pars array when number of holes changes
  useEffect(() => {
    const currentHolePars = [...formData.hole_pars];
    const newHolePars = Array(formData.holes).fill(4);
    
    // Preserve existing values for holes that are still in range
    for (let i = 0; i < Math.min(currentHolePars.length, formData.holes); i++) {
      newHolePars[i] = currentHolePars[i];
    }
    
    setFormData(prev => ({
      ...prev,
      hole_pars: newHolePars,
      // Recalculate total par based on hole pars
      par: newHolePars.reduce((sum, par) => sum + par, 0)
    }));
  }, [formData.holes]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle number inputs
    if ((e.target as HTMLInputElement).type === 'number') {
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

  const handleHoleParChange = (holeIndex: number, value: number) => {
    const newHolePars = [...formData.hole_pars];
    newHolePars[holeIndex] = value;
    
    setFormData({
      ...formData,
      hole_pars: newHolePars,
      // Update total par based on individual hole pars
      par: newHolePars.reduce((sum, par) => sum + par, 0)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!formData.name) {
        throw new Error("El nombre del campo es obligatorio");
      }
      
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
            city: formData.city,
            description: formData.description,
            image_url: formData.image_url,
            phone: formData.phone,
            website: formData.website,
            hole_pars: formData.hole_pars,
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
            city: formData.city,
            description: formData.description,
            image_url: formData.image_url,
            phone: formData.phone,
            website: formData.website,
            hole_pars: formData.hole_pars,
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
            state: "",
            city: "",
            description: "",
            image_url: "",
            phone: "",
            website: "",
            hole_pars: Array(formData.holes).fill(4)
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

            <div className="grid gap-2">
              <Label htmlFor="image_url">URL de Imagen</Label>
              <Input 
                id="image_url"
                name="image_url"
                placeholder="URL de la imagen del campo"
                value={formData.image_url}
                onChange={handleInputChange}
              />
              {formData.image_url && (
                <div className="mt-2 p-2 border rounded">
                  <img 
                    src={formData.image_url} 
                    alt="Vista previa del campo" 
                    className="w-full max-h-40 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Error+de+imagen';
                    }}
                  />
                </div>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea 
                id="description"
                name="description"
                placeholder="Descripción del campo"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
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
                <Label htmlFor="par">Par Total (calculado)</Label>
                <Input 
                  id="par"
                  name="par"
                  type="number"
                  min="30"
                  max="100"
                  value={formData.par}
                  disabled
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Par por Hoyo</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {formData.hole_pars.map((par, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm font-medium w-8">#{index+1}</span>
                    <Input 
                      type="number"
                      min="3"
                      max="6"
                      value={par}
                      onChange={(e) => handleHoleParChange(index, parseInt(e.target.value) || 4)}
                      className="w-16"
                    />
                  </div>
                ))}
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input 
                  id="city"
                  name="city"
                  placeholder="Ciudad"
                  value={formData.city}
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
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input 
                  id="phone"
                  name="phone"
                  placeholder="Teléfono del campo"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="website">Sitio Web</Label>
                <Input 
                  id="website"
                  name="website"
                  placeholder="URL del sitio web"
                  value={formData.website}
                  onChange={handleInputChange}
                />
              </div>
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
