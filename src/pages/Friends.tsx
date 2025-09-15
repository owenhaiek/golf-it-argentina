import { ScrollArea } from "@/components/ui/scroll-area";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { FriendsSection } from "@/components/profile/FriendsSection";
import { FriendSuggestions } from "@/components/profile/FriendSuggestions";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Friends = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/profile");
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-shrink-0 p-4 bg-background border-b border-border sticky top-0 z-40 touch-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">{t("profile", "friends")}</h1>
          </div>
          <DarkModeToggle />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6 pb-28">
          <FriendsSection />
          <FriendSuggestions />
        </div>
      </ScrollArea>
    </div>
  );
};

export default Friends;