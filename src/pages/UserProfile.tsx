
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Trophy, Flag, Plus, Minus, Check, TrendingUp, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }

      return data;
    },
    enabled: !!userId,
  });

  const { data: recentRounds, isLoading: roundsLoading } = useQuery({
    queryKey: ["userRounds", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      console.log("Fetching rounds for user:", userId);
      
      const { data, error } = await supabase
        .from("rounds")
        .select(`
          *,
          golf_courses (
            name,
            par,
            image_url
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching rounds:", error);
        throw error;
      }

      console.log("Fetched rounds:", data);
      return data || [];
    },
    enabled: !!userId,
  });

  const handleBack = () => navigate(-1);

  if (profileLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-2xl font-bold text-foreground mb-2">User Not Found</h1>
        <p className="text-muted-foreground mb-4">The user profile you're looking for doesn't exist.</p>
        <Button onClick={handleBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("common", "back")}
        </Button>
      </div>
    );
  }

  // Calculate stats safely
  const totalRoundsPlayed = recentRounds?.length || 0;
  
  // Calculate best over/under par score
  const bestScore = totalRoundsPlayed > 0
    ? (() => {
        const parDifferences = recentRounds.map(round => {
          const coursePar = round.golf_courses?.par || 72;
          return round.score - coursePar;
        });
        const bestDiff = Math.min(...parDifferences);
        
        if (bestDiff < 0) {
          return `${Math.abs(bestDiff)} under par`;
        } else if (bestDiff > 0) {
          return `${bestDiff} over par`;
        } else {
          return "Even par";
        }
      })()
    : "N/A";

  const lastPlayedCourse = recentRounds?.[0]?.golf_courses?.name || "N/A";
  const lastPlayedDate = recentRounds?.[0]?.created_at
    ? new Date(recentRounds[0].created_at).toLocaleDateString()
    : "N/A";

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 bg-background border-b border-border">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common", "back")}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="container p-4 max-w-xl mx-auto pb-20 space-y-6">
          {/* Profile Card */}
          <Card className="bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-20 w-20 border-2 border-primary">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback>
                    {(profile.username?.charAt(0) || profile.full_name?.charAt(0) || "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{profile.full_name || "Anonymous User"}</h1>
                  <p className="text-muted-foreground">@{profile.username || "user"}</p>
                  {profile.handicap !== null && (
                    <div className="mt-2 bg-primary/10 text-primary rounded-full px-3 py-1 text-sm inline-block">
                      {t("profile", "handicap")}: {profile.handicap}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-accent/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      Total Rounds
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalRoundsPlayed}</div>
                    <p className="text-sm text-muted-foreground">Rounds Played</p>
                  </CardContent>
                </Card>

                <Card className="bg-accent/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      Best Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold">{bestScore}</div>
                    <p className="text-sm text-muted-foreground">vs Par</p>
                  </CardContent>
                </Card>

                <Card className="bg-accent/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Last Played
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold">{lastPlayedDate}</div>
                    <p className="text-sm text-muted-foreground truncate">{lastPlayedCourse}</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Recent Rounds */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                {t("profile", "recentRounds")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {roundsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : !recentRounds || recentRounds.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground text-lg mb-2">No rounds recorded yet</p>
                  <p className="text-sm text-muted-foreground">This player hasn't recorded any golf rounds</p>
                </div>
              ) : (
                recentRounds.map((round) => {
                  const coursePar = round.golf_courses?.par || 72;
                  const scoreDiff = round.score - coursePar;
                  
                  let scoreStatus;
                  let scoreColor;
                  let ScoreIcon;
                  
                  if (scoreDiff < 0) {
                    scoreStatus = `${Math.abs(scoreDiff)} ${t("profile", "underPar")}`;
                    scoreColor = "text-green-600";
                    ScoreIcon = Minus;
                  } else if (scoreDiff > 0) {
                    scoreStatus = `${scoreDiff} ${t("profile", "overPar")}`;
                    scoreColor = "text-red-600";
                    ScoreIcon = Plus;
                  } else {
                    scoreStatus = t("profile", "atPar");
                    scoreColor = "text-blue-600";
                    ScoreIcon = Check;
                  }
                  
                  return (
                    <div key={round.id} className="border rounded-lg overflow-hidden">
                      {/* Course Image */}
                      {round.golf_courses?.image_url && (
                        <div className="relative h-24 sm:h-32 md:h-40">
                          <img 
                            src={round.golf_courses.image_url} 
                            alt={round.golf_courses.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>
                      )}
                      
                      <div className="p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{round.golf_courses?.name || "Unknown Course"}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(round.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{round.score}</p>
                            <div className={`flex items-center justify-end gap-1 ${scoreColor}`}>
                              <ScoreIcon className="h-3 w-3" />
                              <span className="text-sm">{scoreStatus}</span>
                            </div>
                          </div>
                        </div>
                        {round.notes && (
                          <>
                            <Separator className="my-2" />
                            <p className="text-sm">{round.notes}</p>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
