
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Trophy, Calendar, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import RoundCard from "./rounds/RoundCard";
import LoadingRoundsList from "./rounds/LoadingRoundsList";
import EmptyRoundsList from "./rounds/EmptyRoundsList";

const RecentRounds = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: rounds, isLoading } = useQuery({
    queryKey: ['rounds', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('rounds')
        .select(`
          *,
          golf_courses (
            name,
            par,
            holes,
            hole_pars,
            image_url,
            address,
            city,
            state
          )
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(5);

      if (error) {
        console.error("Rounds fetch error:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return <LoadingRoundsList />;
  }

  if (!rounds || rounds.length === 0) {
    return <EmptyRoundsList />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Rounds</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y">
          {rounds.map((round) => (
            <RoundCard key={round.id} round={round} />
          ))}
        </ul>
        {rounds.length > 5 && (
          <div className="p-4">
            <Button variant="link">View All Rounds</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentRounds;
