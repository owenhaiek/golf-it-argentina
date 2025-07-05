import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";

export const DarkModeToggle = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { language, t } = useLanguage();
  const { toast } = useToast();

  const handleToggle = () => {
    toggleDarkMode();
    
    toast({
      title: !darkMode 
        ? t("settings", "darkMode") + " " + (language === "en" ? "enabled" : "activado")
        : t("settings", "darkMode") + " " + (language === "en" ? "disabled" : "desactivado"),
      description: !darkMode 
        ? (language === "en" ? "The app will now use a dark theme" : "La aplicación ahora usará un tema oscuro") 
        : (language === "en" ? "The app will now use a light theme" : "La aplicación ahora usará un tema claro"),
    });
  };

  return (
    <div className="flex items-center gap-3 bg-muted/50 rounded-full p-2 hover-scale">
      <Sun size={16} className={`transition-colors ${!darkMode ? 'text-primary' : 'text-muted-foreground'}`} />
      <Switch 
        checked={darkMode} 
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-primary"
      />
      <Moon size={16} className={`transition-colors ${darkMode ? 'text-primary' : 'text-muted-foreground'}`} />
    </div>
  );
};