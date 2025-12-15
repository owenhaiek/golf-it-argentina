import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, Target, Trophy, Swords } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface MapActionMenuProps {
  onOpenChange?: (isOpen: boolean) => void;
}

export const MapActionMenu = ({ onOpenChange }: MapActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  const actions = [
    {
      icon: Target,
      label: t('profile', 'addRound'),
      description: t('addRound', 'selectCourse'),
      route: '/add-round',
      color: 'bg-primary'
    },
    {
      icon: Trophy,
      label: t('tournaments', 'createTournament'),
      description: t('tournaments', 'tournamentDetails'),
      route: '/create-tournament',
      color: 'bg-amber-500'
    },
    {
      icon: Swords,
      label: t('matches', 'challengeFriend'),
      description: t('matches', 'matchDetails'),
      route: '/create-match',
      color: 'bg-blue-500'
    }
  ];

  const handleAction = (route: string) => {
    setIsOpen(false);
    navigate(route);
  };

  return (
    <>
      {/* Backdrop with blur - rendered first for proper z-index */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[5] bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Action items - slide up from button */}
      <AnimatePresence>
        {isOpen && (
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-10 flex flex-col gap-3 items-center" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            {actions.map((action, index) => (
              <motion.button
                key={action.route}
                initial={{ opacity: 0, y: 40 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { 
                    delay: index * 0.05, 
                    duration: 0.25,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  y: 20,
                  transition: { 
                    delay: (actions.length - 1 - index) * 0.03,
                    duration: 0.15
                  }
                }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAction(action.route)}
                className="flex items-center gap-4 bg-background/95 backdrop-blur-sm border shadow-xl rounded-2xl p-5 hover:bg-muted/50 active:bg-muted transition-colors min-w-[300px]"
              >
                <div className={`w-14 h-14 ${action.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <action.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-lg">{action.label}</p>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main action button - centered bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          animate={{ 
            rotate: isOpen ? 45 : 0
          }}
          whileTap={{ scale: 1.1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90 shadow-xl shadow-primary/40 active:shadow-primary/20 flex items-center justify-center"
        >
          {isOpen ? (
            <X className="w-7 h-7 text-primary-foreground" />
          ) : (
            <Plus className="w-7 h-7 text-primary-foreground" />
          )}
        </motion.button>
      </div>
    </>
  );
};
