
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Trash2, LogOut } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    handicap: "",
  });
  const [deletingRoundId, setDeletingRoundId] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Profile Query
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user?.id)
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }
    },
    enabled: !!user?.id,
  });

  // Rounds Query
  const { data: rounds, isLoading: roundsLoading } = useQuery({
    queryKey: ['rounds', user?.id],
    queryFn: async () => {
      try {
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
      } catch (error) {
        console.error("Error fetching rounds:", error);
        throw error;
      }
    },
    enabled: !!user?.id,
  });

  // Initialize form data when entering edit mode
  useEffect(() => {
    if (isEditing && profile) {
      // Only set initial values when entering edit mode
      setFormData({
        username: profile.username || "",
        fullName: profile.full_name || "",
        handicap: profile.handicap?.toString() || "",
      });
    }
  }, [isEditing, profile]);

  // Profile Update Mutation
  const updateProfile = useMutation({
    mutationFn: async () => {
      let avatarUrl = profile?.avatar_url;

      // Handle avatar upload if a new file is provided
      if (avatarFile) {
        try {
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
        } catch (error) {
          console.error("Error uploading avatar:", error);
          throw error;
        }
      }

      // Update profile data
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            username: formData.username,
            full_name: formData.fullName,
            handicap: formData.handicap ? parseFloat(formData.handicap) : null,
            avatar_url: avatarUrl,
          })
          .eq('id', user?.id);

        if (error) throw error;
      } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      setIsEditing(false);
      setAvatarFile(null);
      toast({
        title: "Profile updated successfully",
      });
    },
    onError: (error) => {
      console.error('Profile update error:', error);
      toast({
        title: "Error updating profile",
        variant: "destructive",
      });
    },
  });

  // Round Deletion Mutation
  const deleteRound = useMutation({
    mutationFn: async (roundId: string) => {
      const { error } = await supabase
        .from('rounds')
        .delete()
        .eq('id', roundId)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      return roundId;
    },
    onSuccess: (deletedRoundId) => {
      // Update the local cache immediately to remove the deleted round
      queryClient.setQueryData(['rounds', user?.id], (oldData: any[]) => {
        if (!oldData) return [];
        return oldData.filter(round => round.id !== deletedRoundId);
      });
      
      // Also invalidate the query to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['rounds', user?.id] });
      
      toast({
        title: "Round deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Round deletion error:', error);
      toast({
        title: "Error deleting round",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setDeletingRoundId(null);
    },
  });

  // Handle starting edit mode
  const handleEditClick = () => {
    setIsEditing(true);
    // Initial form data will be set by useEffect
  };

  // Handle form changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle avatar file change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  // Handle profile update submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateProfile.mutate();
  };

  // Handle round deletion
  const handleDeleteRound = (roundId: string) => {
    if (window.confirm('Are you sure you want to delete this round?')) {
      setDeletingRoundId(roundId);
      deleteRound.mutate(roundId);
    }
  };

  const handleLogout = async () => {
    try {
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
    } catch (error) {
      console.error("Error during logout:", error);
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
                onClick={() => isEditing && document.getElementById('avatar-upload')?.click()}
              >
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>{profile?.full_name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <input
                  id="avatar-upload"
                  name="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-4 mt-4">
                <Input
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleInputChange}
                />
                <Input
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
                <Input
                  name="handicap"
                  placeholder="Handicap"
                  type="number"
                  step="0.1"
                  value={formData.handicap}
                  onChange={handleInputChange}
                />
              </div>
            ) : (
              <>
                <CardTitle className="mt-4">{profile?.full_name || 'Anonymous'}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {profile?.username ? `@${profile.username}` : ''}
                </p>
                <p className="text-sm text-muted-foreground">
                  {profile?.handicap ? `Handicap: ${profile.handicap}` : 'No handicap set'}
                </p>
              </>
            )}
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {isEditing ? (
              <div className="space-x-2">
                <Button 
                  type="submit" 
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : 'Save'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  disabled={updateProfile.isPending}
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
                        disabled={isDeleting || deleteRound.isPending}
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
