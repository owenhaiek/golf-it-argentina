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
      {/* Main action button - centered bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <motion.div
          animate={{ 
            rotate: isOpen ? 45 : 0,
            scale: isOpen ? 1.1 : 1
          }}
          transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
          whileTap={{ scale: 1.15 }}
        >
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90 shadow-xl shadow-primary/40 active:shadow-primary/20 transition-shadow flex items-center justify-center"
            style={{ aspectRatio: '1 / 1' }}
          >
            {isOpen ? (
              <X className="w-7 h-7 text-primary-foreground" />
            ) : (
              <Plus className="w-7 h-7 text-primary-foreground" />
            )}
          </button>
        </motion.div>
      </div>

      {/* Action items - slide up from button */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[5] bg-black/30 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Action buttons - centered above the main button */}
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-10 flex flex-col gap-3 items-center" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
              {actions.map((action, index) => (
                <motion.div
                  key={action.route}
                  initial={{ opacity: 0, y: 30, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: { delay: index * 0.06, type: "spring", stiffness: 300, damping: 24 }
                  }}
                  exit={{ 
                    opacity: 0, 
                    y: 20, 
                    scale: 0.9,
                    transition: { delay: (actions.length - index) * 0.03 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    onClick={() => handleAction(action.route)}
                    className="flex items-center gap-4 bg-background/95 backdrop-blur-sm border shadow-xl rounded-2xl p-5 hover:bg-muted/50 active:bg-muted transition-all min-w-[300px]"
                  >
                    <div className={`w-14 h-14 ${action.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <action.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-lg">{action.label}</p>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
