
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addSpecifiedGolfCourses } from "@/scripts/addGolfCourses";

const AddGolfCourses = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const { toast } = useToast();

  const handleAddCourses = async () => {
    setIsAdding(true);
    
    try {
      const result = await addSpecifiedGolfCourses();
      
      setResult(result);
      
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    } catch (e) {
      console.error("Error adding courses:", e);
      setResult({
        success: false,
        message: `An error occurred: ${(e as Error).message}`
      });
      
      toast({
        title: "Error",
        description: "Failed to add golf courses. See console for details.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">Add Golf Courses</h1>
        <p className="text-muted-foreground">
          Add the specified golf courses to the database.
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Golf Courses to Add</h2>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li>Olivos Golf Club (27 holes, par 72)</li>
          <li>Buenos Aires Golf Club (27 holes, par 72) - Will update if exists</li>
          <li>Jockey Club Argentino (36 holes, par 72)</li>
        </ul>
        
        <Button 
          onClick={handleAddCourses} 
          disabled={isAdding}
          className="w-full mb-4"
        >
          {isAdding ? "Adding..." : "Add All Courses"}
        </Button>
        
        {result && (
          <div className={`p-4 rounded-md ${
            result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
          }`}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <Check className="text-green-600" />
              ) : (
                <AlertCircle className="text-red-600" />
              )}
              <p className={result.success ? "text-green-800" : "text-red-800"}>
                {result.message}
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AddGolfCourses;
