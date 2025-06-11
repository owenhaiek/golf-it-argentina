import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileQueries } from "@/hooks/useProfileQueries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, User, Trophy, Calendar, Settings, LogOut } from "lucide-react";
import { format } from "date-fns";
import ProfileEditDialog from "./ProfileEditDialog";

const ProfileHeader = () => {
  const { user } = useAuth();
  const { profile, totalRounds, averageScore } = useProfileQueries();
  const [open, setOpen] = useState(false);

  return (
    <Card className="bg-card">
      <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
        <Avatar className="h-24 w-24 md:h-32 md:w-32 border-2 border-primary">
          <AvatarImage src={profile?.avatar_url} alt={profile?.username} />
          <AvatarFallback>{profile?.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2 text-center md:text-left">
          <div className="text-2xl font-bold">{profile?.full_name || profile?.username || "N/A"}</div>
          <p className="text-muted-foreground">
            @{profile?.username || "username"}
          </p>
          {profile?.handicap !== null && profile?.handicap !== undefined && (
            <Badge variant="secondary">
              Handicap: {profile?.handicap}
            </Badge>
          )}
        </div>

        <div className="space-y-2 md:space-y-0 md:space-x-2 flex flex-col md:flex-row">
          <Button variant="outline" onClick={() => setOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </CardContent>

      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-t">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">{profile?.full_name || "N/A"}</div>
            <div className="text-xs text-muted-foreground">Full Name</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">{totalRounds || 0}</div>
            <div className="text-xs text-muted-foreground">Total Rounds</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">{averageScore || 0}</div>
            <div className="text-xs text-muted-foreground">Avg. Score</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">
              {profile?.updated_at ? format(new Date(profile.updated_at), "MMM d, yyyy") : "N/A"}
            </div>
            <div className="text-xs text-muted-foreground">Last Updated</div>
          </div>
        </div>
      </CardContent>

      <ProfileEditDialog open={open} setOpen={setOpen} />
    </Card>
  );
};

export default ProfileHeader;
