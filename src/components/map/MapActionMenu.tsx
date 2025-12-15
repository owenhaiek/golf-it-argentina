import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Target, Trophy, Swords } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

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

  const handleAction = useCallback((route: string) => {
    setIsOpen(false);
    requestAnimationFrame(() => {
      setTimeout(() => navigate(route), 100);
    });
  }, [navigate]);

  const toggleMenu = useCallback(() => setIsOpen(prev => !prev), []);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence mode="sync">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed inset-0 z-[5] bg-black/40 backdrop-blur-[2px] will-change-[opacity]"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Action items */}
      <AnimatePresence mode="sync">
        {isOpen && (
          <motion.div 
            className="absolute bottom-28 right-4 z-10 flex flex-col gap-2.5 items-end will-change-transform"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.route}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ 
                  duration: 0.2,
                  delay: index * 0.03,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                onClick={() => handleAction(action.route)}
                className="flex items-center gap-3 bg-background/95 backdrop-blur-md shadow-2xl rounded-2xl p-3.5 min-w-[250px] active:scale-[0.97] transition-transform duration-100 will-change-transform"
              >
                <div className={`w-11 h-11 ${action.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-foreground text-sm">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main action button */}
      <div 
        className="absolute bottom-6 right-4 z-10" 
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <motion.button
          onClick={toggleMenu}
          whileTap={{ scale: 0.92 }}
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ 
            rotate: { duration: 0.15, ease: "easeOut" },
            scale: { duration: 0.1 }
          }}
          className="h-14 w-14 rounded-full bg-primary shadow-xl shadow-primary/40 flex items-center justify-center will-change-transform"
        >
          <Plus className="w-7 h-7 text-primary-foreground" />
        </motion.button>
      </div>
    </>
  );
};
