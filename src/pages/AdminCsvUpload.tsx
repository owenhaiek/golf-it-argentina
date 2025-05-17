
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check, Search, Save, PlusCircle } from "lucide-react";

interface GolfCourse {
  id?: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  holes: number;
  par: number;
  hole_pars: number[] | null;
  phone: string | null;
  website: string | null;
  image_url: string | null;
  opening_hours: OpeningHour[] | null;
}

interface OpeningHour {
  isOpen: boolean;
  open: string | null;
  close: string | null;
}

const AdminGolfCourseForm = () => {
  const [mode, setMode] = useState<"create" | "update">("create");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GolfCourse[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [formData, setFormData] = useState<GolfCourse>({
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    holes: 18,
    par: 72,
    hole_pars: Array(18).fill(4),
    phone: "",
    website: "",
    image_url: "",
    opening_hours: Array(7).fill({ isOpen: true, open: "08:00", close: "18:00" })
  });

  const { toast } = useToast();

  useEffect(() => {
    // Reset form when mode changes
    if (mode === "create") {
      setFormData({
        name: "",
        description: "",
        address: "",
        city: "",
        state: "",
        holes: 18,
        par: 72,
        hole_pars: Array(18).fill(4),
        phone: "",
        website: "",
        image_url: "",
        opening_hours: Array(7).fill({ isOpen: true, open: "08:00", close: "18:00" })
      });
    }
  }, [mode]);

  const handleInputChange = (field: keyof GolfCourse, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // If holes change, update hole_pars array
      if (field === "holes" && typeof value === "number") {
        const currentHolePars = prev.hole_pars || [];
        const newHolePars = Array(value).fill(4);
        
        // Preserve existing values where possible
        for (let i = 0; i < Math.min(currentHolePars.length, value); i++) {
          newHolePars[i] = currentHolePars[i];
        }
        
        updated.hole_pars = newHolePars;
      }
      
      return updated;
    });
  };

  const handleHoleParChange = (index: number, value: number) => {
    if (!formData.hole_pars) return;
    
    const newHolePars = [...formData.hole_pars];
    newHolePars[index] = value;
    setFormData(prev => ({ ...prev, hole_pars: newHolePars }));
  };

  const handleOpeningHourChange = (dayIndex: number, field: keyof OpeningHour, value: any) => {
    if (!formData.opening_hours) return;
    
    const newOpeningHours = [...formData.opening_hours];
    newOpeningHours[dayIndex] = { 
      ...newOpeningHours[dayIndex], 
      [field]: value 
    };
    
    setFormData(prev => ({ ...prev, opening_hours: newOpeningHours }));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("golf_courses")
        .select("*")
        .ilike("name", `%${searchQuery}%`)
        .order("name");
      
      if (error) throw error;
      
      setSearchResults(data || []);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Error searching courses:", error);
      toast({
        title: "Error",
        description: "No se pudieron buscar los campos de golf",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectCourseToUpdate = (course: GolfCourse) => {
    setFormData(course);
    setShowSearchResults(false);
    setMode("update");
  };

  const saveCourse = async () => {
    // Validation
    if (!formData.name) {
      toast({
        title: "Error",
        description: "El nombre del campo es obligatorio",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (mode === "create") {
        // Create new course
        const { data, error } = await supabase
          .from("golf_courses")
          .insert({
            name: formData.name,
            description: formData.description,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            holes: formData.holes,
            par: formData.par,
            hole_pars: formData.hole_pars,
            phone: formData.phone,
            website: formData.website,
            image_url: formData.image_url,
            opening_hours: formData.opening_hours
          })
          .select();
        
        if (error) throw error;
        
        toast({
          title: "Éxito",
          description: `Se ha creado el campo ${formData.name}`,
          variant: "default",
        });
      } else {
        // Update course
        const { data, error } = await supabase
          .from("golf_courses")
          .update({
            name: formData.name,
            description: formData.description,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            holes: formData.holes,
            par: formData.par,
            hole_pars: formData.hole_pars,
            phone: formData.phone,
            website: formData.website,
            image_url: formData.image_url,
            opening_hours: formData.opening_hours
          })
          .eq("id", formData.id)
          .select();
        
        if (error) throw error;
        
        toast({
          title: "Éxito",
          description: `Se ha actualizado el campo ${formData.name}`,
          variant: "default",
        });
      }
      
      // Reset form after create
      if (mode === "create") {
        setFormData({
          name: "",
          description: "",
          address: "",
          city: "",
          state: "",
          holes: 18,
          par: 72,
          hole_pars: Array(18).fill(4),
          phone: "",
          website: "",
          image_url: "",
          opening_hours: Array(7).fill({ isOpen: true, open: "08:00", close: "18:00" })
        });
      }
    } catch (error: any) {
      console.error("Error saving course:", error);
      toast({
        title: "Error",
        description: `No se pudo guardar el campo: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">Administración de Campos de Golf</h1>
        <p className="text-muted-foreground">
          Agrega nuevos campos de golf o actualiza la información de campos existentes.
        </p>
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as "create" | "update")} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Agregar Campo</TabsTrigger>
          <TabsTrigger value="update">Actualizar Campo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="mt-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Agregar nuevo campo de golf</h2>
            <div className="space-y-4">
              {/* Formulario de creación */}
              {renderFormFields()}
              
              <Button 
                onClick={saveCourse} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Guardando..." : "Guardar Campo de Golf"}
              </Button>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="update" className="mt-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Actualizar campo de golf</h2>
            
            <div className="flex gap-2 mb-6">
              <Input
                placeholder="Buscar campo por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>

            {formData.id ? (
              <div className="space-y-4">
                <div className="bg-primary/10 p-3 rounded-md mb-4">
                  <p className="font-medium">Editando: {formData.name}</p>
                </div>
                
                {/* Formulario de edición */}
                {renderFormFields()}
                
                <Button 
                  onClick={saveCourse} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "Actualizando..." : "Actualizar Campo"}
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Busca un campo de golf para actualizar su información
              </p>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo de resultados de búsqueda */}
      <Dialog open={showSearchResults} onOpenChange={setShowSearchResults}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resultados de búsqueda</DialogTitle>
            <DialogDescription>
              Selecciona el campo de golf que deseas actualizar
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-96 overflow-y-auto">
            {searchResults.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No se encontraron resultados</p>
            ) : (
              <div className="space-y-2">
                {searchResults.map(course => (
                  <div 
                    key={course.id} 
                    className="p-3 border rounded-md hover:bg-accent/10 cursor-pointer"
                    onClick={() => selectCourseToUpdate(course)}
                  >
                    <p className="font-medium">{course.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {course.address || 'Sin dirección'}, {course.city || ''} {course.state || ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  function renderFormFields() {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm font-medium">Nombre del campo*</label>
            <Input 
              value={formData.name || ''} 
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g. Club de Golf San Andrés"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Hoyos*</label>
            <Input 
              type="number" 
              value={formData.holes} 
              onChange={(e) => handleInputChange('holes', parseInt(e.target.value))}
              min={1}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Par*</label>
            <Input 
              type="number" 
              value={formData.par || ''} 
              onChange={(e) => handleInputChange('par', parseInt(e.target.value))}
              min={1}
            />
          </div>
          
          <div className="col-span-2">
            <label className="text-sm font-medium">Descripción</label>
            <Textarea 
              value={formData.description || ''} 
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descripción del campo de golf"
              rows={3}
            />
          </div>
          
          <div className="col-span-2">
            <label className="text-sm font-medium">Dirección</label>
            <Input 
              value={formData.address || ''} 
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Dirección completa"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Ciudad</label>
            <Input 
              value={formData.city || ''} 
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="Ciudad"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Estado/Provincia</label>
            <Input 
              value={formData.state || ''} 
              onChange={(e) => handleInputChange('state', e.target.value)}
              placeholder="Estado/Provincia"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Teléfono</label>
            <Input 
              value={formData.phone || ''} 
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Teléfono de contacto"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Sitio web</label>
            <Input 
              value={formData.website || ''} 
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://www.ejemplo.com"
            />
          </div>
          
          <div className="col-span-2">
            <label className="text-sm font-medium">URL de imagen</label>
            <Input 
              value={formData.image_url || ''} 
              onChange={(e) => handleInputChange('image_url', e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>
        </div>
        
        {/* Par por hoyo */}
        <div className="mt-4">
          <h3 className="text-md font-medium mb-2">Par por hoyo</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-9 gap-2">
            {formData.hole_pars?.map((par, index) => (
              <div key={index} className="flex flex-col">
                <label className="text-xs font-medium mb-1">Hoyo {index + 1}</label>
                <Input 
                  type="number" 
                  value={par} 
                  onChange={(e) => handleHoleParChange(index, parseInt(e.target.value))}
                  min={1}
                  max={6}
                  className="h-8 text-center"
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Horario de apertura */}
        <div className="mt-4">
          <h3 className="text-md font-medium mb-2">Horario de apertura</h3>
          <div className="space-y-2">
            {dayNames.map((day, index) => (
              <div key={index} className="flex items-center gap-2">
                <label className="w-20">{day}</label>
                
                <Select 
                  value={formData.opening_hours?.[index]?.isOpen ? "open" : "closed"}
                  onValueChange={(value) => handleOpeningHourChange(
                    index, 
                    'isOpen', 
                    value === "open"
                  )}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Abierto</SelectItem>
                    <SelectItem value="closed">Cerrado</SelectItem>
                  </SelectContent>
                </Select>
                
                {formData.opening_hours?.[index]?.isOpen && (
                  <>
                    <Input 
                      type="time" 
                      value={formData.opening_hours[index].open || "08:00"} 
                      onChange={(e) => handleOpeningHourChange(index, 'open', e.target.value)}
                      className="w-24"
                    />
                    <span>a</span>
                    <Input 
                      type="time" 
                      value={formData.opening_hours[index].close || "18:00"} 
                      onChange={(e) => handleOpeningHourChange(index, 'close', e.target.value)}
                      className="w-24"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }
};

export default AdminGolfCourseForm;
