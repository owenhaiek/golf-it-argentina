
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import RoundCard from "./rounds/RoundCard";
import EmptyRoundsList from "./rounds/EmptyRoundsList";
import LoadingRoundsList from "./rounds/LoadingRoundsList";
import { RecentRoundsProps } from "./rounds/types";
import { useEffect } from "react";

const RecentRounds = ({
  rounds,
  roundsLoading,
  onDeleteRound,
  deletingRoundId
}: RecentRoundsProps) => {
  const { t } = useLanguage();

  // Add effect to add viewport meta tag for mobile devices
  useEffect(() => {
    // Check if the viewport meta tag already exists
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    
    // If it doesn't exist, create one
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.setAttribute('name', 'viewport');
      document.head.appendChild(viewportMeta);
    }
    
    // Set the content to hide browser navigation on mobile
    viewportMeta.setAttribute('content', 
      'width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no');
    
    // Also add a meta tag to set the mobile web app capable attribute
    let webAppMeta = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
    if (!webAppMeta) {
      webAppMeta = document.createElement('meta');
      webAppMeta.setAttribute('name', 'apple-mobile-web-app-capable');
      webAppMeta.setAttribute('content', 'yes');
      document.head.appendChild(webAppMeta);
    }
    
    return () => {
      // No cleanup needed as we want these meta tags to persist
    };
  }, []);

  if (roundsLoading) {
    return <LoadingRoundsList />;
  }

  return (
    <Card className="border-0 shadow-md overflow-hidden h-full">
      <CardHeader className="border-b border-muted/20 pb-4">
        <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
          <Trophy className="h-5 w-5 text-accent" />
          {t("profile", "yourRecentRounds")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 py-[6px]">
        {rounds && rounds.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 max-w-3xl mx-auto">
            <AnimatePresence>
              {rounds.map(round => (
                <RoundCard 
                  key={round.id} 
                  round={round}
                  onDeleteRound={onDeleteRound || (() => {})}
                  isDeleting={deletingRoundId === round.id}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyRoundsList />
        )}
      </CardContent>
    </Card>
  );
};

export default RecentRounds;
