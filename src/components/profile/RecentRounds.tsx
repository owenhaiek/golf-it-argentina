
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import RoundCard from "./rounds/RoundCard";
import EmptyRoundsList from "./rounds/EmptyRoundsList";
import LoadingRoundsList from "./rounds/LoadingRoundsList";
import { RecentRoundsProps } from "./rounds/types";

const RecentRounds = ({
  rounds,
  roundsLoading,
  onDeleteRound,
  deletingRoundId
}: RecentRoundsProps) => {
  const { t } = useLanguage();

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
