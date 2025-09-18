
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import AddRoundDialog from "@/components/rounds/AddRoundDialog";

const AddRound = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const preselectedCourseId = searchParams.get('courseId');

  // Open dialog when page loads
  useEffect(() => {
    setIsDialogOpen(true);
  }, []);

  // Handle dialog close - navigate back
  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      navigate('/profile');
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-shrink-0 p-4 bg-background border-b">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-foreground">{t("addRound", "title") || "Add Round"}</h1>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Ready to add your round?</h2>
          <Button onClick={() => setIsDialogOpen(true)}>
            Start Adding Round
          </Button>
        </div>
      </div>

      <AddRoundDialog 
        open={isDialogOpen} 
        onOpenChange={handleDialogClose}
        preselectedCourseId={preselectedCourseId}
      />
    </div>
  );
};

export default AddRound;
