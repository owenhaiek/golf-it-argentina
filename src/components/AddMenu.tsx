
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Plus, Flag, Trophy, Swords } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const AddMenu = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const handleAddRound = () => {
    setOpen(false);
    navigate('/add-round');
  };

  const handleCreateTournament = () => {
    setOpen(false);
    navigate('/create-tournament');
  };

  const handleCreateMatch = () => {
    setOpen(false);
    navigate('/create-match');
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button className="flex flex-col items-center justify-center gap-1 py-2 px-3 transition-all duration-200 min-h-[44px] rounded-md text-primary hover:bg-primary/10 active:scale-95 active:bg-primary/20 transform-gpu will-change-transform">
          <div className="transition-transform duration-200 group-hover:scale-110">
            <Plus className="transition-all duration-200" size={22} />
          </div>
          <span className="text-[9px] font-medium tracking-wider uppercase leading-tight transition-all duration-200">{t("common", "add")}</span>
        </button>
      </DrawerTrigger>
      <DrawerContent className="bg-white">
        <DrawerHeader className="text-center">
          <DrawerTitle className="text-xl font-bold text-gray-900">
            {language === "en" ? "What would you like to add?" : "¿Qué te gustaría agregar?"}
          </DrawerTitle>
        </DrawerHeader>
        <div className="p-6 space-y-4 pb-8">
          <Button 
            onClick={handleAddRound}
            className="w-full h-16 bg-primary hover:bg-primary/90 text-white flex items-center justify-start gap-4 text-lg"
          >
            <Flag size={24} />
            <div className="text-left">
              <div className="font-semibold">{t("addRound", "title")}</div>
              <div className="text-sm opacity-90">
                {language === "en" ? "Record your golf round" : "Registra tu ronda de golf"}
              </div>
            </div>
          </Button>
          
          <Button 
            onClick={handleCreateTournament}
            className="w-full h-16 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white flex items-center justify-start gap-4 text-lg"
          >
            <Trophy size={24} />
            <div className="text-left">
              <div className="font-semibold">
                {language === "en" ? "Create Tournament" : "Crear Torneo"}
              </div>
              <div className="text-sm opacity-90">
                {language === "en" ? "Organize a tournament with friends" : "Organiza un torneo con amigos"}
              </div>
            </div>
          </Button>
          
          <Button 
            onClick={handleCreateMatch}
            className="w-full h-16 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white flex items-center justify-start gap-4 text-lg"
          >
            <Swords size={24} />
            <div className="text-left">
              <div className="font-semibold">
                {language === "en" ? "Challenge Friend" : "Desafiar Amigo"}
              </div>
              <div className="text-sm opacity-90">
                {language === "en" ? "Start a head-to-head match" : "Iniciar un duelo uno a uno"}
              </div>
            </div>
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
