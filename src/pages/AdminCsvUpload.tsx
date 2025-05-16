
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { UploadCloud, FileText, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface CSVGolfCourse {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  holes: number;
  par: number;
  hole_pars: number[];
  phone?: string;
  website?: string;
  image_url?: string;
}

const AdminCsvUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<{
    success: number;
    failed: number;
    details: string[];
  } | null>(null);
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
              image_url: course.image_url || null
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

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">Admin: CSV Golf Course Upload</h1>
        <p className="text-muted-foreground">
          Upload a CSV file to bulk import golf courses. This page is for administrators only.
        </p>
      </div>

      <Card className="p-6">
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
              <Button
                variant="outline"
                className="mt-4"
                type="button"
                as="span"
              >
                Select CSV File
              </Button>
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
    </div>
  );
};

export default AdminCsvUpload;
