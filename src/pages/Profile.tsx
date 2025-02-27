
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
  // Core state and hooks
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [deletingRoundId, setDeletingRoundId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    handicap: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Profile Query - Fetch user profile data
  const { 
    data: profile, 
    isLoading: profileLoading,
    refetch: refetchProfile
  } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Profile fetch error:", error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  // Rounds Query - Fetch user's recent rounds
  const { 
    data: rounds, 
    isLoading: roundsLoading,
    refetch: refetchRounds
  } = useQuery({
    queryKey: ['rounds', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error("Rounds fetch error:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Initialize form data when entering edit mode
  useEffect(() => {
    if (isEditing && profile) {
      setFormData({
        username: profile.username || "",
        fullName: profile.full_name || "",
        handicap: profile.handicap?.toString() || "",
      });
      
      setAvatarPreview(profile.avatar_url || null);
      setAvatarFile(null); // Clear any previously selected file
    }
  }, [isEditing, profile]);

  // Create temporary URL for avatar preview
  useEffect(() => {
    if (avatarFile) {
      const url = URL.createObjectURL(avatarFile);
      setAvatarPreview(url);
      
      // Clean up the temporary URL when component unmounts or avatar changes
      return () => URL.revokeObjectURL(url);
    }
  }, [avatarFile]);

  // Profile Update Mutation
  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      
      let avatarUrl = profile?.avatar_url;

      // Step 1: Upload avatar if a new file is selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
        const filePath = `${user.id}/${fileName}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);

        if (uploadError) {
          console.error("Avatar upload failed:", uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatarUrl = publicUrl;
      }

      // Step 2: Update profile data
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: formData.username.trim(),
          full_name: formData.fullName.trim(),
          handicap: formData.handicap ? parseFloat(formData.handicap) : null,
          avatar_url: avatarUrl,
        })
        .eq('id', user.id);

      if (updateError) {
        console.error("Profile update failed:", updateError);
        throw updateError;
      }
      
      return true;
    },
    onSuccess: () => {
      // Explicitly refetch profile data
      refetchProfile();
      
      // Reset state
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      
      // Show success message
      toast({
        title: "Profile updated successfully",
      });
    },
    onError: (error) => {
      console.error('Profile update error:', error);
      toast({
        title: "Failed to update profile",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Round Deletion Mutation
  const deleteRoundMutation = useMutation({
    mutationFn: async (roundId: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from('rounds')
        .delete()
        .eq('id', roundId)
        .eq('user_id', user.id);

      if (error) {
        console.error("Round deletion failed:", error);
        throw error;
      }
      
      return roundId;
    },
    onSuccess: (deletedRoundId) => {
      // Explicitly refetch rounds data
      refetchRounds();
      
      // Show success message
      toast({
        title: "Round deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Round deletion error:', error);
      toast({
        title: "Failed to delete round",
        description: error instanceof Error ? error.message : "An unknown error occurred",
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
  };

  // Handle canceling edit mode
  const handleCancelEdit = () => {
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  // Handle profile update form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateProfileMutation.mutate();
  };

  // Handle round deletion
  const handleDeleteRound = (roundId: string) => {
    // Show confirmation dialog
    if (window.confirm('Are you sure you want to delete this round? This cannot be undone.')) {
      setDeletingRoundId(roundId);
      deleteRoundMutation.mutate(roundId);
    }
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Error logging out",
          description: error.message,
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
      toast({
        title: "Error logging out",
        variant: "destructive",
      });
    }
  };

  // Show loading state while data is being fetched
  if (profileLoading || roundsLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-1/3 bg-secondary/20 rounded" />
        <div className="h-64 bg-secondary/20 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader className="text-center pb-2">
          <div className="relative w-20 h-20 mx-auto">
            {/* Avatar with preview support */}
            <Avatar 
              className="w-20 h-20 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => isEditing && document.getElementById('avatar-upload')?.click()}
            >
              <AvatarImage src={avatarPreview || profile?.avatar_url} />
              <AvatarFallback>
                {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            {/* Hidden file input for avatar upload */}
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
            
            {/* Edit indicator */}
            {isEditing && avatarPreview && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full text-white text-xs">
                Click to change
              </div>
            )}
          </div>
          
          {/* Profile Information or Edit Form */}
          {isEditing ? (
            <form id="profile-form" onSubmit={handleSubmit} className="space-y-4 mt-4">
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
                placeholder="Handicap (optional)"
                type="number"
                step="0.1"
                value={formData.handicap}
                onChange={handleInputChange}
              />
            </form>
          ) : (
            <>
              <CardTitle className="mt-4">{profile?.full_name || 'Anonymous'}</CardTitle>
              {profile?.username && (
                <p className="text-sm text-muted-foreground mb-1">
                  @{profile.username}
                </p>
              )}
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
                form="profile-form"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : 'Save Changes'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancelEdit}
                disabled={updateProfileMutation.isPending}
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

      {/* Recent Rounds Card */}
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
                        disabled={isDeleting || deleteRoundMutation.isPending}
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
