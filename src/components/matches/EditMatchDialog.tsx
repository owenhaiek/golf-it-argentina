import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useGolfCourses } from "@/hooks/useGolfCourses";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Match } from "@/hooks/useTournamentsAndMatches";

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
  
  const [formData, setFormData] = useState({
    name: match?.name || "",
    course_id: match?.course_id || "",
    match_date: match?.match_date || "",
    match_type: match?.match_type || "stroke_play",
    stakes: match?.stakes || "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

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
        title: "Match Updated",
        description: "Match has been successfully updated.",
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating match:', error);
      toast({
        title: "Error",
        description: "Failed to update match. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Match</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Match Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="course">Golf Course</Label>
            <Select
              value={formData.course_id}
              onValueChange={(value) => handleInputChange('course_id', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {coursesLoading ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">Loading courses...</div>
                ) : (
                  golfCourses?.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name} - {course.city}, {course.state}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="match_date">Match Date</Label>
            <Input
              id="match_date"
              type="date"
              value={formData.match_date}
              onChange={(e) => handleInputChange('match_date', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="match_type">Match Format</Label>
            <Select
              value={formData.match_type}
              onValueChange={(value) => handleInputChange('match_type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stroke_play">Stroke Play</SelectItem>
                <SelectItem value="match_play">Match Play</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stakes">Stakes (Optional)</Label>
            <Input
              id="stakes"
              value={formData.stakes}
              onChange={(e) => handleInputChange('stakes', e.target.value)}
              placeholder="e.g., $20, Dinner, Bragging rights"
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Match"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};