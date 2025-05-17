
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AddGolfCourses = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const { toast } = useToast();

  const addSpecifiedGolfCourses = async () => {
    try {
      // Check if Buenos Aires Golf Club exists
      const { data: existingBA } = await supabase
        .from("golf_courses")
        .select("id")
        .eq("name", "Buenos Aires Golf Club")
        .maybeSingle();

      // Define the golf courses
      const golfCourses = [
        {
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
        },
        {
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
        }
      ];

      // Insert or update Buenos Aires Golf Club
      if (existingBA) {
        await supabase
          .from("golf_courses")
          .update({
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
          })
          .eq("id", existingBA.id);
      } else {
        golfCourses.push({
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
      }

      // Insert all courses that need to be inserted
      const { error } = await supabase
        .from("golf_courses")
        .insert(golfCourses);

      if (error) {
        console.error("Error inserting golf courses:", error);
        return {
          success: false,
          message: `Error adding courses: ${error.message}`
        };
      }

      return {
        success: true,
        message: `Successfully added ${golfCourses.length} golf courses${existingBA ? " and updated 1 existing course" : ""}.`
      };
    } catch (e) {
      console.error("Error in addSpecifiedGolfCourses:", e);
      return {
        success: false,
        message: `An error occurred: ${(e as Error).message}`
      };
    }
  };

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
