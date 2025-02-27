
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Trash2, LogOut } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newHandicap, setNewHandicap] = useState<string>("");
  const [deletingRoundId, setDeletingRoundId] = useState<string | null>(null);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Update form fields when profile data changes
  useEffect(() => {
    if (profile) {
      setNewUsername(profile.username || "");
      setNewFullName(profile.full_name || "");
      setNewHandicap(profile.handicap?.toString() || "");
    }
  }, [profile]);

  const { data: rounds, isLoading: roundsLoading } = useQuery({
    queryKey: ['rounds', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rounds')
        .select(`
          *,
          golf_courses (
            name,
            hole_pars,
            holes
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const deleteRound = useMutation({
    mutationFn: async (roundId: string) => {
      setDeletingRoundId(roundId);
      const { error } = await supabase
        .from('rounds')
        .delete()
        .eq('id', roundId)
        .eq('user_id', user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['rounds', user?.id] 
      });
      toast({
        title: "Round deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Delete round error:', error);
      toast({
        title: "Error deleting round",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setDeletingRoundId(null);
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (formData: FormData) => {
      let avatarUrl = profile?.avatar_url;

      if (formData.has('avatar')) {
        const avatarFile = formData.get('avatar') as File;
        if (avatarFile.size > 0) {
          const fileExt = avatarFile.name.split('.').pop();
          const filePath = `${user?.id}/${Math.random()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

          avatarUrl = publicUrl;
        }
      }

      const updateData = {
        username: newUsername,
        full_name: newFullName,
        handicap: newHandicap ? parseFloat(newHandicap) : null,
        avatar_url: avatarUrl,
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['profile', user?.id] 
      });
      setIsEditing(false);
      toast({
        title: "Profile updated successfully",
      });
    },
    onError: (error) => {
      console.error('Update profile error:', error);
      toast({
        title: "Error updating profile",
        variant: "destructive",
      });
    },
  });

  const handleAvatarClick = () => {
    if (!isEditing) return;
    document.getElementById('avatar-upload')?.click();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateProfile.mutate(formData);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleDeleteRound = async (roundId: string) => {
    if (window.confirm('Are you sure you want to delete this round?')) {
      try {
        await deleteRound.mutateAsync(roundId);
      } catch (error) {
        console.error('Error deleting round:', error);
      }
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error logging out",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged out successfully",
      });
      navigate('/auth');
    }
  };

  if (profileLoading || roundsLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-6 w-1/3 bg-secondary/20 rounded" />
      <div className="h-64 bg-secondary/20 rounded-lg" />
    </div>;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader className="text-center pb-2">
            <div className="relative w-20 h-20 mx-auto">
              <Avatar 
                className="w-20 h-20 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleAvatarClick}
              >
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>{profile?.full_name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <input
                  id="avatar-upload"
                  type="file"
                  name="avatar"
                  accept="image/*"
                  className="hidden"
                />
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-4 mt-4">
                <Input
                  placeholder="Username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
                <Input
                  placeholder="Full Name"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                />
                <Input
                  placeholder="Handicap"
                  type="number"
                  step="0.1"
                  value={newHandicap}
                  onChange={(e) => setNewHandicap(e.target.value)}
                />
              </div>
            ) : (
              <>
                <CardTitle className="mt-4">{profile?.full_name || 'Anonymous'}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {profile?.handicap ? `Handicap: ${profile.handicap}` : 'No handicap set'}
                </p>
              </>
            )}
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {isEditing ? (
              <div className="space-x-2">
                <Button type="submit">Save</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="space-x-2">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handleEditClick}
                  className="hover:bg-green-600/10 hover:text-green-600 transition-colors"
                >
                  Edit Profile
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="text-red-600 hover:bg-red-600/10 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Rounds</CardTitle>
        </CardHeader>
        <CardContent>
          {rounds && rounds.length > 0 ? (
            <div className="space-y-4">
              {rounds.map((round) => {
                const totalPar = round.golf_courses.hole_pars
                  ?.slice(0, round.golf_courses.holes)
                  .reduce((a, b) => a + b, 0) || 0;
                
                const vsParScore = round.score - totalPar;
                const isDeleting = deletingRoundId === round.id;
                
                return (
                  <div 
                    key={round.id} 
                    className="flex justify-between items-start p-3 bg-secondary/10 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{round.golf_courses.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(round.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="text-right space-y-1">
                        <div className="text-lg font-bold">
                          Score: {round.score}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Course Par: {totalPar}
                        </p>
                        <p className={`text-sm ${vsParScore <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {vsParScore <= 0 ? '' : '+' }{vsParScore} vs Par
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:bg-red-600/10 transition-colors"
                        onClick={() => handleDeleteRound(round.id)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              No rounds recorded yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
