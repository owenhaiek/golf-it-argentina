
import { useAuth } from "@/contexts/AuthContext";
import ProfileCard from "./ProfileCard";
import RecentRounds from "./RecentRounds";

interface ProfileContentProps {
  profile: any;
  profileLoading: boolean;
  rounds: any[];
  roundsLoading: boolean;
  deletingRoundId: string | null;
  handleDeleteRound: (roundId: string) => void;
}

const ProfileContent = ({
  profile,
  profileLoading,
  rounds,
  roundsLoading,
  deletingRoundId,
  handleDeleteRound
}: ProfileContentProps) => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-6 pb-6 px-0">
      <div className="w-full">
        <ProfileCard user={user} profile={profile} profileLoading={profileLoading} />
      </div>
      
      <div className="w-full pb-20">
        <RecentRounds 
          rounds={rounds} 
          roundsLoading={roundsLoading} 
          onDeleteRound={handleDeleteRound}
          deletingRoundId={deletingRoundId}
        />
      </div>
    </div>
  );
};

export default ProfileContent;
