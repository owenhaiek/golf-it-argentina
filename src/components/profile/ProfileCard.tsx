
import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, LogOut, Edit3, Check, X, Camera, User, Hash, Settings, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useFriendsData } from "@/hooks/useFriendsData";

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

const ProfileCard = ({
  user,
  profile,
  profileLoading
}: ProfileCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { friends, receivedRequests } = useFriendsData();
  const friendsCount = friends.length;
  const pendingCount = receivedRequests.length;
  const handleScrollToFriends = () => {
    const el = document.getElementById('friends-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    fullName: ""
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        fullName: profile.full_name || ""
      });
    }
  }, [profile]);

  useEffect(() => {
    if (isEditing && profile) {
      setFormData({
        username: profile.username || "",
        fullName: profile.full_name || ""
      });
      setAvatarFile(null);
      setAvatarPreview(profile.avatar_url || null);
    }
  }, [isEditing, profile]);

  useEffect(() => {
    if (avatarFile) {
      const url = URL.createObjectURL(avatarFile);
      setAvatarPreview(url);

      return () => URL.revokeObjectURL(url);
    }
  }, [avatarFile]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      let avatarUrl = profile?.avatar_url;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
        const filePath = `${user.id}/${fileName}.${fileExt}`;
        const {
          error: uploadError
        } = await supabase.storage.from('avatars').upload(filePath, avatarFile);
        if (uploadError) {
          console.error("Avatar upload failed:", uploadError);
          throw uploadError;
        }
        const {
          data: {
            publicUrl
          }
        } = supabase.storage.from('avatars').getPublicUrl(filePath);
        avatarUrl = publicUrl;
      }

      const {
        error: updateError
      } = await supabase.from('profiles').update({
        username: formData.username.trim(),
        full_name: formData.fullName.trim(),
        avatar_url: avatarUrl
      }).eq('id', user.id);
      if (updateError) {
        console.error("Profile update failed:", updateError);
        throw updateError;
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['profile', user?.id]
      });
      setIsEditing(false);
      toast({
        title: t("profile", "profileUpdateSuccess")
      });
    },
    onError: error => {
      console.error('Profile update error:', error);
      toast({
        title: t("profile", "profileUpdateError"),
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  });

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(profile?.avatar_url || null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateProfileMutation.mutate();
  };

  const handleLogout = async () => {
    try {
      console.log("Initiating logout process");
      await signOut();
      toast({
        title: t("profile", "logoutSuccess")
      });
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: t("profile", "logoutError"),
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const handleGoToSettings = () => {
    navigate('/settings');
  };

  if (profileLoading) {
    return <Card className="border-0 shadow-md bg-gradient-to-br from-white to-muted dark:bg-black dark:from-black dark:to-gray-900 h-full">
        <CardHeader className="flex items-center justify-center pb-0">
          <div className="w-24 h-24 rounded-full bg-muted animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-4 mt-6">
          <div className="h-6 w-3/4 mx-auto bg-muted animate-pulse rounded" />
          <div className="h-4 w-1/2 mx-auto bg-muted animate-pulse rounded" />
          <div className="h-10 w-2/3 mx-auto bg-muted animate-pulse rounded-full mt-8" />
        </CardContent>
      </Card>;
  }

  return <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-white to-muted dark:bg-black dark:from-black dark:to-gray-900 h-full">
      <CardHeader className="relative pb-0 text-center">
        {!isEditing && <div className="absolute right-4 top-4 flex gap-2">
            <Button variant="ghost" size="icon" onClick={handleScrollToFriends} className="text-black dark:text-white hover:bg-primary/10 rounded-full relative">
              <Users className="h-5 w-5" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] leading-4 text-center">
                  {pendingCount}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleGoToSettings} className="text-black dark:text-white hover:bg-primary/10 rounded-full">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleEditClick} className="text-black dark:text-white hover:bg-primary/10 rounded-full">
              <Edit3 className="h-5 w-5" />
            </Button>
          </div>}
        
        <div className="relative w-28 h-28 mx-auto mb-2">
          <div className={`relative w-28 h-28 rounded-full ${isEditing ? 'ring-2 ring-primary ring-offset-2 cursor-pointer' : ''} transition-all duration-200`} onClick={handleAvatarClick}>
            <Avatar className="w-28 h-28 border-4 border-white shadow-md hover:opacity-95 transition-opacity">
              <AvatarImage src={avatarPreview || profile?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            {isEditing && <input ref={fileInputRef} id="avatar-upload" name="avatar" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />}
            
            {isEditing && <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full text-white">
                <Camera className="h-6 w-6" />
              </div>}
          </div>
        </div>
        
        {isEditing ? <form id="profile-form" onSubmit={handleSubmit} className="space-y-4 mt-6 px-4">
            <div>
              <label htmlFor="fullName" className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1 text-left">
                <User className="h-4 w-4" /> {t("profile", "fullName")}
              </label>
              <Input id="fullName" name="fullName" placeholder={t("profile", "fullName")} value={formData.fullName} onChange={handleInputChange} className="border-primary/20 focus:border-primary" />
            </div>
            
            <div>
              <label htmlFor="username" className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1 text-left">
                <Hash className="h-4 w-4" /> {t("profile", "username")}
              </label>
              <Input id="username" name="username" placeholder={t("profile", "username")} value={formData.username} onChange={handleInputChange} className="border-primary/20 focus:border-primary" />
            </div>
          </form> : <div className="mt-4">
            <CardTitle className="text-2xl font-bold text-black dark:text-white">
              {profile?.full_name || t("profile", "anonymous")}
            </CardTitle>
            {profile?.username && <p className="text-sm text-black dark:text-white mb-2">
                @{profile.username}
              </p>}
            <div className="flex items-center justify-center mt-3">
              <span className="text-sm font-medium inline-flex items-center gap-1 bg-secondary/10 text-black dark:text-white px-4 py-1.5 rounded-full">
                {profile?.handicap !== null && profile?.handicap !== undefined ? `${t("profile", "handicap")}: ${profile.handicap}` : t("profile", "noHandicapYet")}
              </span>
            </div>
          </div>}
      </CardHeader>
      
      <CardContent className="text-center pt-6 pb-6">
        {isEditing ? <div className="flex justify-center space-x-3 mt-4">
            <Button type="submit" form="profile-form" disabled={updateProfileMutation.isPending} className="px-[16px]">
              {updateProfileMutation.isPending ? <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("profile", "saving")}
                </> : <>
                  <Check className="mr-2 h-4 w-4" />
                  {t("profile", "saveChanges")}
                </>}
            </Button>
            <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={updateProfileMutation.isPending} className="px-6">
              <X className="mr-2 h-4 w-4" />
              {t("common", "cancel")}
            </Button>
          </div> : <div className="mt-6">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors border border-red-200">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("profile", "logout")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("profile", "logout")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("profile", "logoutConfirm")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common", "cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>
                    {t("profile", "logout")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>}
      </CardContent>
    </Card>;
};

export default ProfileCard;
