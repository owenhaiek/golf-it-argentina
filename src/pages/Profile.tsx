
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileContent from "@/components/profile/ProfileContent";

const Profile = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to view your profile</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-shrink-0 p-4 bg-white border-b">
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6 pb-28">
          <ProfileHeader />
          <ProfileContent />
        </div>
      </ScrollArea>
    </div>
  );
};

export default Profile;
