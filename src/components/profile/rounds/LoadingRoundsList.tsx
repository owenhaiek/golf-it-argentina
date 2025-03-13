
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const LoadingRoundsList = () => {
  const { t } = useLanguage();
  
  return (
    <Card className="border-0 shadow-md h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary">{t("profile", "yourRecentRounds")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-secondary/10 rounded-lg animate-pulse" />)}
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingRoundsList;
