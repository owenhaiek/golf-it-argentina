
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { UploadCloud, FileText, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CSVGolfCourse {
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  holes: number;
  par: number;
  hole_pars?: number[];
  phone?: string;
  website?: string;
  image_url?: string;
  opening_hours?: any;
}

const AdminCsvUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<{
    success: number;
    failed: number;
    details: string[];
  } | null>(null);
  const [manualCourse, setManualCourse] = useState<CSVGolfCourse>({
    name: "",
    holes: 18,
    par: 72,
    hole_pars: Array(18).fill(4), // Default par 4 for each hole
    opening_hours: [
      { isOpen: true, open: "08:00", close: "18:00" }, // Monday
      { isOpen: true, open: "08:00", close: "18:00" }, // Tuesday
      { isOpen: true, open: "08:00", close: "18:00" }, // Wednesday
      { isOpen: true, open: "08:00", close: "18:00" }, // Thursday
      { isOpen: true, open: "08:00", close: "18:00" }, // Friday
      { isOpen: true, open: "08:00", close: "18:00" }, // Saturday
      { isOpen: true, open: "08:00", close: "18:00" }  // Sunday
    ]
  });
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResults(null);
    }
  };

  const parseCSV = (text: string): CSVGolfCourse[] => {
    const lines = text.split("\n");
    const headers = lines[0].split(",").map(h => h.trim());
    
    const courses: CSVGolfCourse[] = [];
    const errors: string[] = [];

    // Process rows starting from index 1 (skipping headers)
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Skip empty lines
      
      const values = lines[i].split(",").map(v => v.trim());
      
      try {
        const course: any = {};
        headers.forEach((header, index) => {
          if (header === "hole_pars") {
            // Parse hole_pars as array of numbers
            try {
              course[header] = values[index]
                ? values[index].split(";").map(Number)
                : [];
            } catch (e) {
              throw new Error(`Invalid hole_pars format at line ${i+1}`);
            }
          } else if (header === "holes" || header === "par") {
            course[header] = parseInt(values[index]);
            if (isNaN(course[header])) {
              throw new Error(`Invalid ${header} value at line ${i+1}`);
            }
          } else if (header === "opening_hours") {
            try {
              course[header] = values[index] ? JSON.parse(values[index]) : null;
            } catch (e) {
              // Default opening hours (all days open 8am-6pm)
              course[header] = Array(7).fill({ isOpen: true, open: "08:00", close: "18:00" });
            }
          } else {
            course[header] = values[index];
          }
        });
        
        // Validate required fields
        if (!course.name) throw new Error(`Missing name at line ${i+1}`);
        if (!course.holes) course.holes = 18; // Default to 18 holes
        
        courses.push(course as CSVGolfCourse);
      } catch (error) {
        errors.push((error as Error).message);
      }
    }
    
    if (errors.length > 0) {
      console.error("CSV parsing errors:", errors);
    }
    
    return courses;
  };

  const uploadCourses = async () => {
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      const text = await file.text();
      const courses = parseCSV(text);
      
      const results = {
        success: 0,
        failed: 0,
        details: [] as string[]
      };
      
      // Process each course
      for (const course of courses) {
        try {
          const { data, error } = await supabase
            .from("golf_courses")
            .insert({
              name: course.name,
              description: course.description || null,
              address: course.address || null,
              city: course.city || null,
              state: course.state || null,
              holes: course.holes,
              par: course.par || null,
              hole_pars: course.hole_pars || null,
              phone: course.phone || null,
              website: course.website || null,
              image_url: course.image_url || null,
              opening_hours: course.opening_hours || null
            });
          
          if (error) {
            results.failed++;
            results.details.push(`Error adding ${course.name}: ${error.message}`);
          } else {
            results.success++;
            results.details.push(`Success: Added ${course.name}`);
          }
        } catch (e) {
          results.failed++;
          results.details.push(`Error processing ${course.name}: ${(e as Error).message}`);
        }
      }
      
      setResults(results);
      
      if (results.success > 0) {
        toast({
          title: "Upload Complete",
          description: `Successfully added ${results.success} courses. Failed: ${results.failed}`,
          variant: results.failed > 0 ? "default" : "default",
        });
      } else if (results.failed > 0) {
        toast({
          title: "Upload Failed",
          description: `Failed to add any courses. Check the error log.`,
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error("CSV upload error:", e);
      toast({
        title: "Error",
        description: "Failed to process CSV file. Check the format and try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleManualCourseChange = (field: keyof CSVGolfCourse, value: any) => {
    setManualCourse(prev => ({ ...prev, [field]: value }));
  };

  const addManualCourse = async () => {
    setIsUploading(true);
    
    try {
      const { data, error } = await supabase.from("golf_courses").insert({
        name: manualCourse.name,
        description: manualCourse.description || null,
        address: manualCourse.address || null,
        city: manualCourse.city || null,
        state: manualCourse.state || null,
        holes: manualCourse.holes,
        par: manualCourse.par || null,
        hole_pars: manualCourse.hole_pars || Array(manualCourse.holes).fill(4),
        phone: manualCourse.phone || null,
        website: manualCourse.website || null,
        image_url: manualCourse.image_url || null,
        opening_hours: manualCourse.opening_hours || null
      });

      if (error) {
        toast({
          title: "Error",
          description: `Failed to add course: ${error.message}`,
          variant: "destructive",
        });
        console.error("Error adding course:", error);
      } else {
        toast({
          title: "Success",
          description: `Added ${manualCourse.name} to the database`,
          variant: "default",
        });
        
        // Reset the form
        setManualCourse({
          name: "",
          holes: 18,
          par: 72,
          hole_pars: Array(18).fill(4),
          opening_hours: Array(7).fill({ isOpen: true, open: "08:00", close: "18:00" })
        });
      }
    } catch (e) {
      console.error("Error adding course:", e);
      toast({
        title: "Error",
        description: `Something went wrong: ${(e as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">Admin: Golf Course Management</h1>
        <p className="text-muted-foreground">
          Upload a CSV file to bulk import golf courses or add courses individually.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* CSV Upload Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">CSV Upload</h2>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 text-center">
              <div className="flex flex-col items-center">
                {file ? (
                  <>
                    <FileText className="h-10 w-10 text-primary mb-2" />
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      Drag and drop or click to upload your CSV file
                    </p>
                  </>
                )}
              </div>

              <Input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload">
                <div className="inline-block">
                  <Button
                    variant="outline"
                    className="mt-4"
                    type="button"
                    onClick={() => document.getElementById('csv-upload')?.click()}
                  >
                    Select CSV File
                  </Button>
                </div>
              </label>
            </div>

            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">CSV Format:</p>
              <code className="bg-muted p-2 rounded block overflow-x-auto">
                name,description,address,city,state,holes,par,hole_pars,phone,website,image_url
              </code>
              <p className="mt-2">
                Note: <span className="font-semibold">hole_pars</span> should be 
                semicolon-separated values, e.g., <code>4;5;3;4;5</code>
              </p>
            </div>

            <Button 
              onClick={uploadCourses} 
              disabled={!file || isUploading}
              className="w-full"
            >
              {isUploading ? "Processing..." : "Upload and Process"}
            </Button>
          </div>
        </Card>

        {/* Manual Course Addition */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Add Single Course</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium">Course Name*</label>
                <Input 
                  value={manualCourse.name} 
                  onChange={(e) => handleManualCourseChange('name', e.target.value)}
                  placeholder="e.g. Olivos Golf Club"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Holes*</label>
                <Input 
                  type="number" 
                  value={manualCourse.holes} 
                  onChange={(e) => handleManualCourseChange('holes', parseInt(e.target.value))}
                  min={1}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Par*</label>
                <Input 
                  type="number" 
                  value={manualCourse.par} 
                  onChange={(e) => handleManualCourseChange('par', parseInt(e.target.value))}
                  min={1}
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Address</label>
                <Input 
                  value={manualCourse.address || ''} 
                  onChange={(e) => handleManualCourseChange('address', e.target.value)}
                  placeholder="Full address"
                />
              </div>
              <div>
                <label className="text-sm font-medium">City</label>
                <Input 
                  value={manualCourse.city || ''} 
                  onChange={(e) => handleManualCourseChange('city', e.target.value)}
                  placeholder="City"
                />
              </div>
              <div>
                <label className="text-sm font-medium">State</label>
                <Input 
                  value={manualCourse.state || ''} 
                  onChange={(e) => handleManualCourseChange('state', e.target.value)}
                  placeholder="State/Province"
                />
              </div>
            </div>
            
            <Button 
              onClick={addManualCourse} 
              disabled={!manualCourse.name || isUploading}
              className="w-full"
            >
              {isUploading ? "Adding..." : "Add Course"}
            </Button>
          </div>
        </Card>
      </div>

      {/* Results Section */}
      {results && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Upload Results</h2>
          
          <div className="flex gap-4 mb-4">
            <div className="bg-primary/10 p-3 rounded-lg flex items-center gap-2">
              <Check className="text-primary" size={18} />
              <div>
                <p className="text-sm font-medium">Success</p>
                <p className="text-2xl font-bold">{results.success}</p>
              </div>
            </div>
            
            <div className="bg-destructive/10 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="text-destructive" size={18} />
              <div>
                <p className="text-sm font-medium">Failed</p>
                <p className="text-2xl font-bold">{results.failed}</p>
              </div>
            </div>
          </div>
          
          <div className="border rounded-md overflow-hidden">
            <div className="max-h-60 overflow-y-auto">
              {results.details.map((detail, index) => (
                <div 
                  key={index} 
                  className={`px-4 py-2 text-sm ${
                    detail.startsWith("Success") 
                      ? "bg-primary/5" 
                      : "bg-destructive/5"
                  } ${index % 2 === 0 ? "bg-opacity-50" : ""}`}
                >
                  {detail}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
      
      {/* Table of courses */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Course Addition</h2>
        <p className="mb-4">Use this pre-filled data to add the courses you specified:</p>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Holes</TableHead>
              <TableHead>Par</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Olivos Golf Club</TableCell>
              <TableCell>27</TableCell>
              <TableCell>72</TableCell>
              <TableCell>Ruta Panamericana Ramal Pilar, Km 40.5, Olivos</TableCell>
              <TableCell>
                <Button onClick={() => {
                  setManualCourse({
                    name: "Olivos Golf Club",
                    holes: 27,
                    par: 72,
                    address: "Ruta Panamericana Ramal Pilar, Km 40.5, Olivos",
                    state: "Buenos Aires",
                    hole_pars: Array(27).fill(4),
                    opening_hours: [
                      { isOpen: false, open: null, close: null }, // Monday - Closed
                      { isOpen: true, open: "08:00", close: "18:00" }, // Tuesday
                      { isOpen: true, open: "08:00", close: "18:00" }, // Wednesday
                      { isOpen: true, open: "08:00", close: "18:00" }, // Thursday
                      { isOpen: true, open: "08:00", close: "18:00" }, // Friday
                      { isOpen: true, open: "08:00", close: "18:00" }, // Saturday
                      { isOpen: true, open: "08:00", close: "18:00" }  // Sunday
                    ]
                  });
                }}>Load Data</Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Buenos Aires Golf Club</TableCell>
              <TableCell>27</TableCell>
              <TableCell>72</TableCell>
              <TableCell>Av. Campos Salles 1275, San Miguel</TableCell>
              <TableCell>
                <Button onClick={() => {
                  setManualCourse({
                    name: "Buenos Aires Golf Club",
                    holes: 27,
                    par: 72,
                    address: "Av. Campos Salles 1275, San Miguel",
                    state: "Buenos Aires",
                    hole_pars: Array(27).fill(4),
                    opening_hours: [
                      { isOpen: false, open: null, close: null }, // Monday - Closed
                      { isOpen: true, open: "08:00", close: "18:00" }, // Tuesday
                      { isOpen: true, open: "08:00", close: "18:00" }, // Wednesday
                      { isOpen: true, open: "08:00", close: "18:00" }, // Thursday
                      { isOpen: true, open: "08:00", close: "18:00" }, // Friday
                      { isOpen: true, open: "08:00", close: "18:00" }, // Saturday
                      { isOpen: true, open: "08:00", close: "18:00" }  // Sunday
                    ]
                  });
                }}>Load Data</Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Jockey Club Argentino (Colorada Y Azul)</TableCell>
              <TableCell>36</TableCell>
              <TableCell>72</TableCell>
              <TableCell>Av. Márquez 1702, San Isidro</TableCell>
              <TableCell>
                <Button onClick={() => {
                  setManualCourse({
                    name: "Jockey Club Argentino (Colorada Y Azul)",
                    holes: 36,
                    par: 72,
                    address: "Av. Márquez 1702, San Isidro",
                    state: "Buenos Aires",
                    hole_pars: Array(36).fill(4),
                    opening_hours: [
                      { isOpen: false, open: null, close: null }, // Monday - Closed
                      { isOpen: true, open: "08:00", close: "18:00" }, // Tuesday
                      { isOpen: true, open: "08:00", close: "18:00" }, // Wednesday
                      { isOpen: false, open: null, close: null }, // Thursday - Closed
                      { isOpen: false, open: null, close: null }, // Friday - Closed
                      { isOpen: false, open: null, close: null }, // Saturday - Closed
                      { isOpen: false, open: null, close: null }  // Sunday - Closed
                    ]
                  });
                }}>Load Data</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AdminCsvUpload;
