
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Database } from "@/integrations/supabase/types";
import { AlertCircle, FileUp, Check, X, ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

type GolfCourse = Database["public"]["Tables"]["golf_courses"]["Row"];
type ParsedCourse = {
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  holes: number;
  par?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  website?: string | null;
  image_url?: string | null;
};

type ImportStatus = "idle" | "parsing" | "validating" | "ready" | "importing" | "complete" | "error";

const ImportCourses = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedCourse[]>([]);
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [importResults, setImportResults] = useState<{added: number, updated: number, errors: number}>({
    added: 0,
    updated: 0,
    errors: 0
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const parseCSV = (content: string) => {
    try {
      setStatus("parsing");
      
      // Split by newlines
      const lines = content.split(/\r?\n/).filter(line => line.trim());
      if (lines.length < 2) {
        throw new Error("El archivo CSV está vacío o no contiene datos suficientes");
      }
      
      // Get headers
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const requiredFields = ['name', 'holes'];
      for (const field of requiredFields) {
        if (!headers.includes(field)) {
          throw new Error(`El CSV debe contener la columna '${field}'`);
        }
      }

      // Parse data rows
      const parsedRows: ParsedCourse[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(',');
        if (values.length !== headers.length) {
          throw new Error(`La línea ${i + 1} tiene un número incorrecto de columnas`);
        }
        
        const parsedRow: any = {};
        
        // Map values to field names from headers
        headers.forEach((header, index) => {
          let value = values[index]?.trim();
          
          // Skip empty values
          if (!value) {
            parsedRow[header] = null;
            return;
          }
          
          // Convert types based on field
          if (header === 'holes' || header === 'par') {
            const numValue = parseInt(value, 10);
            parsedRow[header] = isNaN(numValue) ? null : numValue;
          } else if (header === 'latitude' || header === 'longitude') {
            const numValue = parseFloat(value);
            parsedRow[header] = isNaN(numValue) ? null : numValue;
          } else {
            parsedRow[header] = value;
          }
        });
        
        // Ensure required fields exist
        if (!parsedRow.name || !parsedRow.holes) {
          throw new Error(`La línea ${i + 1} no contiene los campos requeridos`);
        }
        
        parsedRows.push(parsedRow as ParsedCourse);
      }
      
      setParsedData(parsedRows);
      setStatus("validating");
      
      // Basic validation
      if (parsedRows.length === 0) {
        throw new Error("No se encontraron datos válidos en el CSV");
      }
      
      // Set ready for import
      setStatus("ready");
      return parsedRows;
    } catch (error: any) {
      setErrorMessage(error.message || "Error al analizar el archivo CSV");
      setStatus("error");
      return [];
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setCsvFile(file);
    setErrorMessage("");
    setStatus("idle");
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      parseCSV(content);
    };
    
    reader.onerror = () => {
      setErrorMessage("Error al leer el archivo");
      setStatus("error");
    };
    
    reader.readAsText(file);
  };

  const importCourses = async () => {
    if (parsedData.length === 0) return;
    
    setStatus("importing");
    const results = { added: 0, updated: 0, errors: 0 };
    
    try {
      // Get existing courses to check which ones to update
      const { data: existingCourses, error: fetchError } = await supabase
        .from('golf_courses')
        .select('id, name')
        .order('name');
        
      if (fetchError) throw fetchError;
      
      const existingCourseMap = new Map(
        existingCourses?.map(course => [course.name.toLowerCase(), course.id]) || []
      );
      
      // Process each course
      for (const course of parsedData) {
        try {
          const courseName = course.name.toLowerCase();
          const existingId = existingCourseMap.get(courseName);
          
          if (existingId) {
            // Update existing course
            const { error: updateError } = await supabase
              .from('golf_courses')
              .update({
                address: course.address,
                city: course.city,
                state: course.state,
                holes: course.holes,
                par: course.par,
                image_url: course.image_url,
                phone: course.phone,
                website: course.website,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existingId);
            
            if (updateError) throw updateError;
            results.updated++;
          } else {
            // Add new course
            const { error: insertError } = await supabase
              .from('golf_courses')
              .insert([{
                name: course.name,
                address: course.address,
                city: course.city,
                state: course.state,
                holes: course.holes,
                par: course.par,
                image_url: course.image_url,
                phone: course.phone,
                website: course.website,
              }]);
            
            if (insertError) throw insertError;
            results.added++;
          }
        } catch (error) {
          console.error("Error importing course:", course.name, error);
          results.errors++;
        }
      }
      
      setImportResults(results);
      setStatus("complete");
      
      toast({
        title: "Importación completada",
        description: `${results.added} canchas añadidas, ${results.updated} actualizadas, ${results.errors} errores`,
        variant: results.errors > 0 ? "destructive" : "default"
      });
    } catch (error: any) {
      console.error("Import error:", error);
      setErrorMessage(error.message || "Error durante la importación");
      setStatus("error");
    }
  };

  const resetForm = () => {
    setCsvFile(null);
    setParsedData([]);
    setStatus("idle");
    setErrorMessage("");
    setImportResults({ added: 0, updated: 0, errors: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)} 
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Importar Canchas de Golf</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Importación desde CSV</CardTitle>
          <CardDescription>
            Sube un archivo CSV con la información de las canchas de golf. 
            El archivo debe incluir al menos las columnas 'name' y 'holes'.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={status === "importing"}
                className="flex-1"
              />
              {csvFile && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resetForm}
                  disabled={status === "importing"}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reiniciar
                </Button>
              )}
            </div>

            {status === "idle" && !csvFile && (
              <div className="bg-muted p-8 rounded-md flex flex-col items-center justify-center text-center">
                <FileUp className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Sube un archivo CSV para comenzar la importación
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Formato esperado: name, address, city, state, holes, par, latitude, longitude, phone, website, image_url
                </p>
              </div>
            )}

            {status === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {(status === "validating" || status === "ready") && parsedData.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Vista previa de datos</h3>
                  <Badge variant="outline">{parsedData.length} canchas encontradas</Badge>
                </div>
                <div className="border rounded-md max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Ciudad</TableHead>
                        <TableHead>Hoyos</TableHead>
                        <TableHead>Par</TableHead>
                        <TableHead>Coordenadas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedData.slice(0, 10).map((course, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{course.name}</TableCell>
                          <TableCell>{course.city || "-"}</TableCell>
                          <TableCell>{course.holes}</TableCell>
                          <TableCell>{course.par || "-"}</TableCell>
                          <TableCell>
                            {course.latitude && course.longitude 
                              ? `${course.latitude.toFixed(6)}, ${course.longitude.toFixed(6)}`
                              : "-"
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {parsedData.length > 10 && (
                  <p className="text-xs text-muted-foreground text-right">
                    Mostrando 10 de {parsedData.length} canchas
                  </p>
                )}
              </>
            )}

            {status === "complete" && (
              <Alert className={importResults.errors > 0 ? "border-yellow-500" : "border-green-500"}>
                <Check className="h-4 w-4" />
                <AlertTitle>Importación completada</AlertTitle>
                <AlertDescription>
                  <div className="flex flex-col gap-1 mt-1">
                    <div>Canchas añadidas: <span className="font-medium">{importResults.added}</span></div>
                    <div>Canchas actualizadas: <span className="font-medium">{importResults.updated}</span></div>
                    {importResults.errors > 0 && (
                      <div className="text-yellow-600">Errores: <span className="font-medium">{importResults.errors}</span></div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end gap-2 border-t p-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/courses-map')}
          >
            Ver mapa de canchas
          </Button>
          <Button
            variant="default"
            disabled={status !== "ready" || parsedData.length === 0}
            onClick={importCourses}
          >
            {status === "importing" ? "Importando..." : "Importar datos"}
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-8">
        <Separator className="my-4" />
        <h2 className="text-xl font-semibold mb-4">Formato del archivo CSV</h2>
        <div className="bg-muted rounded-md p-6 space-y-4">
          <div>
            <h3 className="font-medium mb-1">Columnas requeridas:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><code className="font-mono bg-muted-foreground/20 px-1 rounded">name</code>: Nombre de la cancha (texto)</li>
              <li><code className="font-mono bg-muted-foreground/20 px-1 rounded">holes</code>: Número de hoyos (número)</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">Columnas opcionales:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><code className="font-mono bg-muted-foreground/20 px-1 rounded">address</code>: Dirección (texto)</li>
              <li><code className="font-mono bg-muted-foreground/20 px-1 rounded">city</code>: Ciudad (texto)</li>
              <li><code className="font-mono bg-muted-foreground/20 px-1 rounded">state</code>: Provincia/Estado (texto)</li>
              <li><code className="font-mono bg-muted-foreground/20 px-1 rounded">par</code>: Par de la cancha (número)</li>
              <li><code className="font-mono bg-muted-foreground/20 px-1 rounded">latitude</code>: Latitud (número decimal)</li>
              <li><code className="font-mono bg-muted-foreground/20 px-1 rounded">longitude</code>: Longitud (número decimal)</li>
              <li><code className="font-mono bg-muted-foreground/20 px-1 rounded">phone</code>: Teléfono (texto)</li>
              <li><code className="font-mono bg-muted-foreground/20 px-1 rounded">website</code>: Sitio web (texto)</li>
              <li><code className="font-mono bg-muted-foreground/20 px-1 rounded">image_url</code>: URL de imagen (texto)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-1">Ejemplo de formato:</h3>
            <pre className="bg-background p-3 rounded border overflow-x-auto text-xs">
              name,address,city,state,holes,par,latitude,longitude,phone,website,image_url
              <br />
              Golf Club Buenos Aires,Calle Principal 123,Buenos Aires,BA,18,72,-34.6037,-58.3816,123456789,https://example.com,https://example.com/image.jpg
              <br />
              Córdoba Golf Club,Av. Golf 456,Córdoba,CO,9,36,-31.4201,-64.1888,123456789,https://example.com,https://example.com/image2.jpg
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportCourses;
