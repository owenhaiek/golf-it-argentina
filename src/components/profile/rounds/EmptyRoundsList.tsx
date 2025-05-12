
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const EmptyRoundsList = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Trophy className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <p className="text-muted-foreground">{t("profile", "noRoundsRecorded")}</p>
      <Button className="mt-4" variant="outline" onClick={() => navigate('/add-round')}>
        {t("profile", "addFirstRound")}
      </Button>
    </div>
  );
};

export default EmptyRoundsList;
