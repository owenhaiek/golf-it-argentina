
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

const ImportGolfCourses = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'importing' | 'completed' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [results, setResults] = useState<{
    total: number;
    inserted: number;
    updated: number;
    errors: number;
  }>({ total: 0, inserted: 0, updated: 0, errors: 0 });

  const importGolfCourses = async () => {
    try {
      setStatus('importing');
      setImporting(true);
      setError(null);
      setProgress(10);
      
      let nextPageToken = null;
      let coursesProcessed = 0;
      let coursesInserted = 0;
      let coursesUpdated = 0;
      let errors = 0;
      
      do {
        setProgress((prev) => Math.min(prev + 10, 90));
        
        const { data, error } = await supabase.functions.invoke('fetch-argentina-golf-courses', {
          body: { 
            region: 'argentina',
            pageToken: nextPageToken,
            apiKey: apiKey || undefined // Only send if provided
          }
        });
        
        if (error) {
          console.error("Error invoking function:", error);
          setError(`Error fetching golf courses: ${error.message}`);
          setStatus('error');
          break;
        }
        
        if (!data.success) {
          console.error("Function returned error:", data.error);
          setError(`Function error: ${data.error}`);
          setStatus('error');
          break;
        }
        
        // Update counts
        coursesProcessed += data.coursesProcessed;
        coursesInserted += data.courses.filter((c: any) => c.action === 'inserted').length;
        coursesUpdated += data.courses.filter((c: any) => c.action === 'updated').length;
        errors += data.errors.length;
        
        setResults({
          total: coursesProcessed,
          inserted: coursesInserted,
          updated: coursesUpdated,
          errors: errors
        });
        
        // Update progress (scales based on whether there are more pages)
        if (!data.nextPageToken) {
          setProgress(100);
        } else {
          setProgress((prev) => Math.min(prev + 20, 90));
        }
        
        // Set the next page token for the next iteration
        nextPageToken = data.nextPageToken;
        
        // If this is the first batch, show a toast
        if (coursesProcessed <= data.coursesProcessed) {
          toast({
            title: "Import started",
            description: `Found ${data.coursesProcessed} golf courses in the first batch.`,
          });
        }
        
      } while (nextPageToken);
      
      // Final update
      setStatus('completed');
      toast({
        title: "Import completed",
        description: `Processed ${coursesProcessed} golf courses: ${coursesInserted} added, ${coursesUpdated} updated, ${errors} errors.`,
      });
      
    } catch (err) {
      console.error("Error during import:", err);
      setError(`Unexpected error: ${err.message}`);
      setStatus('error');
      toast({
        title: "Import failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleImport = async () => {
    setLoading(true);
    
    try {
      // Check if our user is authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to import golf courses.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      // Check if the function is accessible
      try {
        const { error: functionCheckError } = await supabase.functions.invoke('fetch-argentina-golf-courses', {
          body: { check: true }
        });

        if (functionCheckError) {
          toast({
            title: "Edge function not available",
            description: "The fetch-argentina-golf-courses function is not accessible. Please check your configuration.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      } catch (err) {
        toast({
          title: "Edge function not deployed",
          description: "The fetch-argentina-golf-courses function is not yet deployed. Please wait a few minutes and try again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      // Start the import process
      await importGolfCourses();
      
    } catch (err) {
      console.error("Error checking prerequisites:", err);
      toast({
        title: "Failed to start import",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Import Golf Courses from Argentina</CardTitle>
        <CardDescription>
          Import basic information (name, address, opening hours) for golf courses from Argentina using Google Maps data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="apiKey" className="text-sm font-medium">
            Google Maps API Key
          </label>
          <Input
            id="apiKey"
            type="text" 
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..." 
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Required if not set in edge function environment.
          </p>
        </div>

        {status === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {status === 'completed' && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Import Completed</AlertTitle>
            <AlertDescription className="text-green-700">
              Successfully processed {results.total} golf courses.
              <div className="mt-2">
                <div>Added: {results.inserted} courses</div>
                <div>Updated: {results.updated} courses</div>
                {results.errors > 0 && <div className="text-amber-700">Errors: {results.errors}</div>}
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {status === 'importing' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Importing golf courses...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Processed: {results.total} courses (Added: {results.inserted}, Updated: {results.updated}, Errors: {results.errors})
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleImport} 
          disabled={importing || loading || !apiKey}
          className="w-full"
        >
          {(importing || loading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {importing ? "Importing..." : loading ? "Checking..." : "Import Golf Courses"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ImportGolfCourses;
