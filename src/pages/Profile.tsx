
import { useProfileData } from "@/hooks/useProfileData";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileContent from "@/components/profile/ProfileContent";

const Profile = () => {
  const {
    profile,
    profileLoading,
    rounds,
    roundsLoading,
    deletingRoundId,
    handleDeleteRound,
    isLoading
  } = useProfileData();

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn">
      <ProfileHeader isLoading={isLoading} />
      <ProfileContent
        profile={profile}
        profileLoading={profileLoading}
        rounds={rounds}
        roundsLoading={roundsLoading}
        deletingRoundId={deletingRoundId}
        handleDeleteRound={handleDeleteRound}
      />
    </div>
  );
};

export default Profile;
