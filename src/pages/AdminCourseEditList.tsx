import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Download, Upload, Loader2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AdminGolfCourseForm, GolfCourseTemplate } from "./AdminGolfCourseManager";
import AdminCourseList from "@/components/admin/CourseList";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const AdminCourseEditList = () => {
  const [selectedCourse, setSelectedCourse] = useState<GolfCourseTemplate | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEditCourse = (course: GolfCourseTemplate) => {
    setSelectedCourse(course);
    setShowAddForm(false);
  };

  const handleAddNewCourse = () => {
    setSelectedCourse(null);
    setShowAddForm(true);
  };

  const handleFormSuccess = () => {
    setSelectedCourse(null);
    setShowAddForm(false);
    toast({
      title: "Éxito",
      description: selectedCourse ? "Campo de golf actualizado exitosamente" : "Campo de golf creado exitosamente",
    });
    window.location.reload();
  };

  const handleCancelEdit = () => {
    setSelectedCourse(null);
    setShowAddForm(false);
  };

  // Export all courses to CSV
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase
        .from('golf_courses')
        .select('*')
        .order('name');

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No hay campos para exportar",
        });
        return;
      }

      // Define CSV headers
      const headers = [
        'id', 'name', 'city', 'state', 'address', 'phone', 'website',
        'holes', 'par', 'description', 'type', 'established_year',
        'latitude', 'longitude', 'image_url', 'image_gallery',
        'hole_pars', 'hole_handicaps', 'opening_hours'
      ];

      // Convert data to CSV format
      const csvRows = [headers.join(',')];
      
      data.forEach(course => {
        const row = headers.map(header => {
          let value = course[header as keyof typeof course];
          
          // Handle arrays and objects
          if (Array.isArray(value)) {
            value = JSON.stringify(value);
          } else if (typeof value === 'object' && value !== null) {
            value = JSON.stringify(value);
          }
          
          // Escape quotes and wrap in quotes if contains comma or quotes
          if (value === null || value === undefined) {
            return '';
          }
          
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        });
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');
      
      // Create and download file
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `campos_golf_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Exportación exitosa",
        description: `Se exportaron ${data.length} campos de golf`,
      });
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        variant: "destructive",
        title: "Error de exportación",
        description: error.message || "No se pudo exportar los campos",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Parse CSV content
  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;

      for (const char of lines[i]) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }

    return rows;
  };

  // Import from CSV
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    
    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length === 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "El archivo CSV está vacío o tiene formato incorrecto",
        });
        return;
      }

      let updated = 0;
      let errors = 0;

      for (const row of rows) {
        if (!row.id) continue;

        try {
          // Parse complex fields
          const updateData: Record<string, any> = {};
          
          // Simple text fields
          ['name', 'city', 'state', 'address', 'phone', 'website', 'description', 'type', 'image_url', 'image_gallery'].forEach(field => {
            if (row[field] !== undefined && row[field] !== '') {
              updateData[field] = row[field];
            }
          });

          // Numeric fields
          ['holes', 'par', 'established_year'].forEach(field => {
            if (row[field] !== undefined && row[field] !== '') {
              const num = parseInt(row[field], 10);
              if (!isNaN(num)) updateData[field] = num;
            }
          });

          // Decimal fields
          ['latitude', 'longitude'].forEach(field => {
            if (row[field] !== undefined && row[field] !== '') {
              const num = parseFloat(row[field]);
              if (!isNaN(num)) updateData[field] = num;
            }
          });

          // Array fields
          ['hole_pars', 'hole_handicaps'].forEach(field => {
            if (row[field] !== undefined && row[field] !== '') {
              try {
                updateData[field] = JSON.parse(row[field]);
              } catch {
                // Skip if invalid JSON
              }
            }
          });

          // JSON fields
          if (row.opening_hours && row.opening_hours !== '') {
            try {
              updateData.opening_hours = JSON.parse(row.opening_hours);
            } catch {
              // Skip if invalid JSON
            }
          }

          if (Object.keys(updateData).length > 0) {
            const { error } = await supabase
              .from('golf_courses')
              .update(updateData)
              .eq('id', row.id);

            if (error) {
              console.error(`Error updating ${row.name}:`, error);
              errors++;
            } else {
              updated++;
            }
          }
        } catch (err) {
          console.error(`Error processing row:`, err);
          errors++;
        }
      }

      toast({
        title: "Importación completada",
        description: `${updated} campos actualizados${errors > 0 ? `, ${errors} errores` : ''}`,
      });

      if (updated > 0) {
        window.location.reload();
      }
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        variant: "destructive",
        title: "Error de importación",
        description: error.message || "No se pudo importar el archivo",
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const isEditing = selectedCourse || showAddForm;

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/10 via-zinc-950 to-zinc-950 fixed" />
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleImport}
        className="hidden"
      />
      
      <div className="relative z-10 container mx-auto px-4 py-6">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 space-y-4"
        >
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => isEditing ? handleCancelEdit() : navigate('/admin')}
                className="shrink-0 bg-zinc-900/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl h-10 w-10"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                {isEditing 
                  ? (selectedCourse ? "Editar Campo" : "Nuevo Campo")
                  : "Gestionar Campos"
                }
              </h1>
            </div>
            
            {!isEditing && (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {/* Pending Managers button */}
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/pending-managers')}
                  className="flex items-center justify-center gap-2 bg-zinc-900/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Managers</span>
                </Button>
                
                {/* Export/Import buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex-1 sm:flex-none items-center justify-center gap-2 bg-zinc-900/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl"
                  >
                    {isExporting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">Exportar</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                    className="flex-1 sm:flex-none items-center justify-center gap-2 bg-zinc-900/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl"
                  >
                    {isImporting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">Importar</span>
                  </Button>
                </div>
                
                {/* Add button */}
                <Button
                  onClick={handleAddNewCourse}
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-900/30"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Campo
                </Button>
              </div>
            )}
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {isEditing ? (
            <AdminGolfCourseForm 
              initialCourse={selectedCourse || undefined} 
              onSubmitSuccess={handleFormSuccess}
            />
          ) : (
            <AdminCourseList onEditCourse={handleEditCourse} />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminCourseEditList;
