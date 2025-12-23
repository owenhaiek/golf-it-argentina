import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useGolfCourses } from "@/hooks/useGolfCourses";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Match } from "@/hooks/useTournamentsAndMatches";
import { Swords, Calendar, MapPin, Flag, Check, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EditMatchDialogProps {
  match: Match;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditMatchDialog = ({ match, open, onOpenChange, onSuccess }: EditMatchDialogProps) => {
  const { user } = useAuth();
  const { courses: golfCourses, isLoading: coursesLoading } = useGolfCourses("", {
    location: "",
    holes: "",
    favoritesOnly: false,
    isOpen: false,
    minRating: 0
  });
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [courseSearch, setCourseSearch] = useState("");
  const [showCourseSelector, setShowCourseSelector] = useState(false);
  
  const [formData, setFormData] = useState({
    name: match?.name || "",
    course_id: match?.course_id || "",
    match_date: match?.match_date || "",
    match_time: "",
    match_type: match?.match_type || "stroke_play",
    stakes: match?.stakes || "",
  });

  useEffect(() => {
    if (match) {
      setFormData({
        name: match.name || "",
        course_id: match.course_id || "",
        match_date: match.match_date || "",
        match_time: "",
        match_type: match.match_type || "stroke_play",
        stakes: match.stakes || "",
      });
    }
  }, [match]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedCourse = golfCourses.find(c => c.id === formData.course_id);
  const filteredCourses = golfCourses.filter(course => 
    course.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
    course.city?.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!user?.id) return;

    if (!formData.name || !formData.course_id || !formData.match_date) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('matches')
        .update({
          name: formData.name,
          course_id: formData.course_id,
          match_date: formData.match_date,
          match_type: formData.match_type,
          stakes: formData.stakes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', match.id)
        .eq('creator_id', user.id);

      if (error) throw error;

      toast({
        title: "Partido actualizado",
        description: "El partido ha sido actualizado exitosamente.",
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating match:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el partido. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !!formData.name && !!formData.course_id && !!formData.match_date;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 bg-background border-border/50 max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
              <Swords className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Editar Partido</DialogTitle>
              <p className="text-xs text-muted-foreground">Modifica los detalles del match</p>
            </div>
          </div>
        </div>
        
        <ScrollArea className="flex-1 max-h-[60vh]">
          <div className="p-4 space-y-4">
            {/* Course Selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-500" />
                Campo de Golf
              </Label>
              
              <AnimatePresence mode="wait">
                {showCourseSelector ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar campo..."
                        value={courseSearch}
                        onChange={(e) => setCourseSearch(e.target.value)}
                        className="pl-10 h-10 rounded-xl bg-muted/50 border-0 focus-visible:ring-red-500"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCourseSelector(false)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="max-h-48 overflow-y-auto space-y-2 rounded-xl bg-muted/30 p-2">
                      {coursesLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin h-6 w-6 border-2 border-red-500 border-t-transparent rounded-full" />
                        </div>
                      ) : filteredCourses.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-4">No se encontraron campos</p>
                      ) : (
                        filteredCourses.slice(0, 10).map((course) => (
                          <motion.div
                            key={course.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              handleInputChange("course_id", course.id);
                              setShowCourseSelector(false);
                              setCourseSearch("");
                            }}
                            className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${
                              formData.course_id === course.id
                                ? 'bg-red-500/10 ring-1 ring-red-500/30'
                                : 'hover:bg-muted/50'
                            }`}
                          >
                            <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              {course.image_url ? (
                                <img src={course.image_url} alt={course.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Flag className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{course.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{course.city || 'Argentina'}</p>
                            </div>
                            {formData.course_id === course.id && (
                              <Check className="h-4 w-4 text-red-500 flex-shrink-0" />
                            )}
                          </motion.div>
                        ))
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setShowCourseSelector(true)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                  >
                    {selectedCourse ? (
                      <>
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {selectedCourse.image_url ? (
                            <img src={selectedCourse.image_url} alt={selectedCourse.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Flag className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{selectedCourse.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{selectedCourse.city || 'Argentina'}</p>
                        </div>
                        <Check className="h-4 w-4 text-red-500 flex-shrink-0" />
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">Seleccionar campo...</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Match Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Nombre del Partido</Label>
              <Input
                placeholder="Ej: Desafío del fin de semana"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-red-500"
              />
            </div>
            
            {/* Date and Time */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-red-500" />
                Fecha y Hora
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={formData.match_date}
                  onChange={(e) => handleInputChange('match_date', e.target.value)}
                  className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-red-500"
                />
                <Input
                  type="time"
                  value={formData.match_time}
                  onChange={(e) => handleInputChange('match_time', e.target.value)}
                  className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-red-500"
                  placeholder="Hora"
                />
              </div>
            </div>

            {/* Match Format */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Formato</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "stroke_play", label: "Stroke Play", desc: "Menor puntaje total gana" },
                  { value: "match_play", label: "Match Play", desc: "Gana más hoyos" }
                ].map((type) => (
                  <motion.div
                    key={type.value}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleInputChange("match_type", type.value)}
                    className={`p-3 rounded-xl cursor-pointer transition-all ${
                      formData.match_type === type.value
                        ? 'bg-red-500/10 ring-1 ring-red-500/30'
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    <p className="font-medium text-sm">{type.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{type.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Stakes */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Apuesta (Opcional)</Label>
              <Input
                value={formData.stakes}
                onChange={(e) => handleInputChange('stakes', e.target.value)}
                placeholder="Ej: Cena, $20, Prestigio"
                className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-red-500"
              />
            </div>
          </div>
        </ScrollArea>
        
        {/* Footer Buttons */}
        <div className="p-4 border-t border-border/50 bg-background">
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 rounded-xl"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !canSubmit}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Guardando
                </div>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};