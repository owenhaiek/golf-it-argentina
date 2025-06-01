
import { User, Loader } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProfileHeaderProps {
  isLoading: boolean;
}

const ProfileHeader = ({ isLoading }: ProfileHeaderProps) => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center mb-6 gap-2 px-4">
      <User className="text-primary h-6 w-6" />
      <h1 className="text-2xl font-bold text-primary">{t("profile", "title")}</h1>
      {isLoading && (
        <div className="ml-auto">
          <Loader className="h-5 w-5 text-primary animate-spin" />
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;
