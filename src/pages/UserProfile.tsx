
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Trophy, Flag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });

  const { data: recentRounds, isLoading: roundsLoading } = useQuery({
    queryKey: ["userRounds", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rounds")
        .select(`
          *,
          golf_courses (
            name,
            par
          )
        `)
        .eq("user_id", id)
        .order("date", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching rounds:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!id,
  });

  const handleBack = () => navigate(-1);

  if (profileLoading) {
    return <div className="p-4">Loading profile...</div>;
  }

  if (!profile) {
    return (
      <div className="p-4">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("common", "back")}
        </Button>
        <p>{t("profile", "userNotFound")}</p>
      </div>
    );
  }

  return (
    <div className="container p-4 max-w-xl mx-auto pb-20">
      <Button variant="ghost" onClick={handleBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("common", "back")}
      </Button>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback>
                {(profile.username?.charAt(0) || profile.full_name?.charAt(0) || "U").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{profile.full_name}</h1>
              <p className="text-muted-foreground">@{profile.username || "user"}</p>
              {profile.handicap !== null && (
                <div className="mt-2 bg-primary/10 text-primary rounded-full px-3 py-1 text-sm inline-block">
                  {t("profile", "handicap")}: {profile.handicap}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {t("profile", "recentRounds")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {roundsLoading ? (
            <p>{t("common", "loading")}...</p>
          ) : recentRounds.length === 0 ? (
            <p className="text-muted-foreground">{t("profile", "noRoundsYet")}</p>
          ) : (
            recentRounds.map((round) => (
              <div key={round.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{round.golf_courses.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(round.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{round.score}</p>
                    {round.golf_courses.par && (
                      <p className="text-sm">
                        {round.score - round.golf_courses.par > 0 
                          ? `+${round.score - round.golf_courses.par}` 
                          : round.score - round.golf_courses.par}
                      </p>
                    )}
                  </div>
                </div>
                {round.notes && (
                  <>
                    <Separator className="my-2" />
                    <p className="text-sm">{round.notes}</p>
                  </>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
