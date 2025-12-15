import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFriendsData } from "@/hooks/useFriendsData";
import { useGolfCourses } from "@/hooks/useGolfCourses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Swords, User, Calendar, MapPin, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const CreateMatch = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { friends } = useFriendsData();
  const { courses, isLoading: coursesLoading } = useGolfCourses("", {
    location: "",
    holes: "",
    favoritesOnly: false,
    isOpen: false,
    minRating: 0
  });
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    name: "",
    opponentId: "",
    courseId: "",
    matchDate: "",
    matchType: "stroke_play",
    stakes: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    if (!formData.name || !formData.opponentId || !formData.courseId || !formData.matchDate) {
      toast.error(t("matches", "fillRequiredFields"));
      return;
    }

    // Check if match date is not in the past
    const selectedDate = new Date(formData.matchDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast.error(t("matches", "matchDatePast"));
      return;
    }
    
    // Determine if this is a same-day match
    const isSameDayMatch = selectedDate.getTime() === today.getTime();

    setIsLoading(true);
    
    try {
      const { data: match, error } = await supabase
        .from('matches')
        .insert({
          name: formData.name,
          creator_id: user.id,
          opponent_id: formData.opponentId,
          course_id: formData.courseId,
          match_date: formData.matchDate,
          match_type: formData.matchType,
          stakes: formData.stakes || null,
          status: isSameDayMatch ? 'accepted' : 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      if (isSameDayMatch) {
        toast.success("Match created and ready to play! Head to Friends > Matches > Active to start scoring.");
      } else {
        toast.success(t("matches", "matchChallengeSent"));
      }
      navigate("/friends");
    } catch (error: any) {
      console.error("Error creating match:", error);
      toast.error(t("matches", "failedToCreate"));
    } finally {
      setIsLoading(false);
    }
  };

  const selectedOpponent = friends.find(friend => friend.id === formData.opponentId);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 bg-background border-b border-border">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-10 w-10 p-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Swords className="h-6 w-6 text-red-500" />
            <h1 className="text-2xl font-bold">{t("matches", "challengeFriend")}</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6 pb-20">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Match Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {t("matches", "matchDetails")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">{t("matches", "matchNameRequired")}</Label>
                <Input
                  id="name"
                  placeholder={t("matches", "matchNamePlaceholder")}
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="matchDate">{t("matches", "matchDateRequired")}</Label>
                <Input
                  id="matchDate"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.matchDate}
                  onChange={(e) => handleInputChange("matchDate", e.target.value)}
                />
                {formData.matchDate && new Date(formData.matchDate).toDateString() === new Date().toDateString() && (
                  <p className="text-sm text-primary mt-1">
                    ⚡ This match will start immediately and be ready for scoring!
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="course">{t("matches", "golfCourseRequired")}</Label>
                <Select
                  value={formData.courseId}
                  onValueChange={(value) => handleInputChange("courseId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("matches", "selectGolfCourse")} />
                  </SelectTrigger>
                  <SelectContent>
                    {coursesLoading ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">{t("matches", "loadingCourses")}</div>
                    ) : courses.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">{t("matches", "noCoursesAvailable")}</div>
                    ) : (
                      courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {course.name}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t("matches", "matchFormatRequired")}</Label>
                <RadioGroup
                  value={formData.matchType}
                  onValueChange={(value) => handleInputChange("matchType", value)}
                  className="flex gap-6 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="stroke_play" id="stroke_play" />
                    <Label htmlFor="stroke_play">{t("matches", "strokePlay")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="match_play" id="match_play" />
                    <Label htmlFor="match_play">{t("matches", "matchPlay")}</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="stakes">{t("matches", "stakesOptional")}</Label>
                <Input
                  id="stakes"
                  placeholder={t("matches", "stakesPlaceholder")}
                  value={formData.stakes}
                  onChange={(e) => handleInputChange("stakes", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Opponent Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Choose Your Opponent
              </CardTitle>
            </CardHeader>
            <CardContent>
              {friends.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{t("matches", "noFriendsAvailable")}</p>
                  <p className="text-sm">{t("matches", "addFriendsToChallenge")}</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                        formData.opponentId === friend.id
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'hover:bg-accent/50'
                      }`}
                      onClick={() => handleInputChange("opponentId", friend.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={friend.avatar_url} />
                          <AvatarFallback>
                            {friend.full_name?.charAt(0) || friend.username?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {friend.full_name || friend.username || 'Unknown User'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            @{friend.username || 'user'}
                          </p>
                        </div>
                      </div>
                      <RadioGroup value={formData.opponentId}>
                        <RadioGroupItem value={friend.id} />
                      </RadioGroup>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Match Preview */}
          {selectedOpponent && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-primary">{t("matches", "matchPreview")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <Avatar className="h-16 w-16 mx-auto mb-2 ring-2 ring-primary/20">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {user?.user_metadata?.full_name?.charAt(0) || 'Y'}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-medium">{t("matches", "you")}</p>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <Swords className="h-8 w-8 text-primary mb-1" />
                    <span className="text-sm font-medium text-primary">{t("matches", "versus")}</span>
                  </div>
                  
                  <div className="text-center">
                    <Avatar className="h-16 w-16 mx-auto mb-2 ring-2 ring-primary/20">
                      <AvatarImage src={selectedOpponent.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {selectedOpponent.full_name?.charAt(0) || selectedOpponent.username?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-medium">
                      {selectedOpponent.full_name || selectedOpponent.username}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Challenge Button */}
          <Button
            onClick={handleSubmit}
            disabled={
              isLoading || 
              !formData.name || 
              !formData.opponentId || 
              !formData.courseId || 
              !formData.matchDate
            }
            className="w-full h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
          >
            {isLoading 
              ? t("matches", "sendingChallenge") 
              : formData.matchDate && new Date(formData.matchDate).toDateString() === new Date().toDateString()
                ? "Create Match & Start Playing"
                : t("matches", "sendChallenge")
            }
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateMatch;