
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, LogOut, Edit3, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileData {
  username?: string;
  full_name?: string;
  avatar_url?: string;
  handicap?: number | null;
}

interface ProfileCardProps {
  user: any;
  profile: ProfileData;
  profileLoading: boolean;
}

const ProfileCard = ({ user, profile, profileLoading }: ProfileCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // UI state
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    handicap: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Initialize form data when profile data changes or when entering edit mode
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        fullName: profile.full_name || "",
        handicap: profile.handicap?.toString() || "",
      });
      
      // Reset avatar preview to current avatar
      if (!avatarFile) {
        setAvatarPreview(profile.avatar_url || null);
      }
    }
  }, [profile, isEditing]);

  // Create temporary URL for avatar preview when file changes
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
        // Use current timestamp and random string to ensure unique filename
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
      // Invalidate and refetch profile data to ensure UI is updated
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      
      // Reset state
      setIsEditing(false);
      
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

  // Handle starting edit mode
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Handle canceling edit mode
  const handleCancelEdit = () => {
    setIsEditing(false);
    setAvatarFile(null);
    // Reset avatar preview to profile avatar
    setAvatarPreview(profile?.avatar_url || null);
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
  if (profileLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-1/3 bg-secondary/20 rounded" />
        <div className="h-64 bg-secondary/20 rounded-lg" />
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-white to-muted">
      <CardHeader className="relative pb-0 text-center">
        <div className="absolute right-4 top-4 flex gap-2">
          {!isEditing ? (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleEditClick}
              className="text-primary hover:bg-primary/10 rounded-full"
            >
              <Edit3 className="h-5 w-5" />
            </Button>
          ) : null}
        </div>
        
        <div className="relative w-24 h-24 mx-auto mb-2">
          {/* Avatar with preview support */}
          <div className={`relative w-24 h-24 rounded-full ${isEditing ? 'ring-2 ring-primary ring-offset-2' : ''} transition-all duration-200`}>
            <Avatar 
              className="w-24 h-24 cursor-pointer hover:opacity-80 transition-opacity border-4 border-white shadow-md"
              onClick={() => isEditing && document.getElementById('avatar-upload')?.click()}
            >
              <AvatarImage src={avatarPreview || profile?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
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
            {isEditing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full text-white text-xs font-medium">
                Change Photo
              </div>
            )}
          </div>
        </div>
        
        {/* Profile Information or Edit Form */}
        {isEditing ? (
          <form id="profile-form" onSubmit={handleSubmit} className="space-y-4 mt-4 px-4">
            <div>
              <label htmlFor="username" className="text-sm font-medium text-muted-foreground block mb-1 text-left">
                Username
              </label>
              <Input
                id="username"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                className="border-primary/20 focus:border-primary"
              />
            </div>
            
            <div>
              <label htmlFor="fullName" className="text-sm font-medium text-muted-foreground block mb-1 text-left">
                Full Name
              </label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleInputChange}
                className="border-primary/20 focus:border-primary"
              />
            </div>
            
            <div>
              <label htmlFor="handicap" className="text-sm font-medium text-muted-foreground block mb-1 text-left">
                Handicap
              </label>
              <Input
                id="handicap"
                name="handicap"
                placeholder="Handicap (optional)"
                type="number"
                step="0.1"
                value={formData.handicap}
                onChange={handleInputChange}
                className="border-primary/20 focus:border-primary"
              />
            </div>
          </form>
        ) : (
          <div className="mt-2">
            <CardTitle className="text-2xl font-bold text-primary">
              {profile?.full_name || 'Anonymous'}
            </CardTitle>
            {profile?.username && (
              <p className="text-sm text-muted-foreground mb-1">
                @{profile.username}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1 inline-block bg-secondary/10 px-3 py-1 rounded-full">
              {profile?.handicap !== null && profile?.handicap !== undefined 
                ? `Handicap: ${profile.handicap}` 
                : 'No handicap set'}
            </p>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="text-center pt-4 pb-6">
        {isEditing ? (
          <div className="flex justify-center space-x-3 mt-4">
            <Button 
              type="submit"
              form="profile-form"
              disabled={updateProfileMutation.isPending}
              className="px-6"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancelEdit}
              disabled={updateProfileMutation.isPending}
              className="px-6"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        ) : (
          <div className="mt-4">
            <Button 
              variant="outline" 
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
  );
};

export default ProfileCard;
