import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Plus, Flag, Trophy, Swords, Crown, Lock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription } from "@/hooks/useSubscription";
import { motion, AnimatePresence } from "framer-motion";

export const AddMenu = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { isPremium, isLoading } = useSubscription();

  const handleAddRound = () => {
    setOpen(false);
    navigate('/add-round');
  };

  const handleCreateTournament = () => {
    setOpen(false);
    if (!isPremium) {
      // Redirect to subscription page if not premium
      navigate('/subscription');
      return;
    }
    navigate('/create-tournament');
  };

  const handleCreateMatch = () => {
    setOpen(false);
    navigate('/create-match');
  };

  const menuItems = [
    {
      onClick: handleAddRound,
      icon: Flag,
      title: t("addRound", "title"),
      subtitle: language === "en" ? "Record your golf round" : "Registra tu ronda de golf",
      gradient: "bg-primary hover:bg-primary/90",
      requiresPremium: false
    },
    {
      onClick: handleCreateTournament,
      icon: Trophy,
      title: language === "en" ? "Create Tournament" : "Crear Torneo",
      subtitle: isPremium 
        ? (language === "en" ? "Organize a tournament with friends" : "Organiza un torneo con amigos")
        : (language === "en" ? "Premium feature" : "Función premium"),
      gradient: isPremium 
        ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
        : "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700",
      requiresPremium: true
    },
    {
      onClick: handleCreateMatch,
      icon: Swords,
      title: language === "en" ? "Challenge Friend" : "Desafiar Amigo",
      subtitle: language === "en" ? "Start a head-to-head match" : "Iniciar un duelo uno a uno",
      gradient: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
      requiresPremium: false
    }
  ];

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button className="flex flex-col items-center justify-center gap-1 py-2 px-3 transition-all duration-200 min-h-[44px] rounded-md text-primary hover:bg-primary/10 active:scale-95 active:bg-primary/20 transform-gpu will-change-transform">
          <motion.div 
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Plus className="transition-all duration-200" size={22} />
          </motion.div>
          <span className="text-[9px] font-medium tracking-wider uppercase leading-tight transition-all duration-200">{t("common", "add")}</span>
        </button>
      </DrawerTrigger>
      <DrawerContent className="bg-background border-t border-white/10">
        <DrawerHeader className="text-center">
          <DrawerTitle className="text-xl font-bold text-foreground">
            {language === "en" ? "What would you like to add?" : "¿Qué te gustaría agregar?"}
          </DrawerTitle>
        </DrawerHeader>
        <div className="p-6 space-y-4 pb-8">
          <AnimatePresence>
            {menuItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.08,
                  ease: [0.23, 1, 0.32, 1]
                }}
              >
                <Button 
                  onClick={item.onClick}
                  className={`w-full h-16 ${item.gradient} text-white flex items-center justify-start gap-4 text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] relative`}
                >
                  <item.icon size={24} />
                  <div className="text-left flex-1">
                    <div className="font-semibold flex items-center gap-2">
                      {item.title}
                      {item.requiresPremium && !isPremium && (
                        <Crown size={14} className="text-amber-300" />
                      )}
                    </div>
                    <div className="text-sm opacity-90">{item.subtitle}</div>
                  </div>
                  {item.requiresPremium && !isPremium && (
                    <Lock size={18} className="opacity-70" />
                  )}
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
