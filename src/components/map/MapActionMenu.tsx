import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, Target, Trophy, Swords } from "lucide-react";
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

  const handleAction = (route: string) => {
    setIsOpen(false);
    setTimeout(() => navigate(route), 150);
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[5] bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Action items */}
      <AnimatePresence>
        {isOpen && (
          <div 
            className="absolute bottom-28 right-4 z-10 flex flex-col gap-3 items-end"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.route}
                initial={{ opacity: 0, x: 50, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.8 }}
                transition={{ 
                  duration: 0.25,
                  delay: index * 0.05,
                  ease: [0.23, 1, 0.32, 1]
                }}
                onClick={() => handleAction(action.route)}
                className="flex items-center gap-3 bg-background/95 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-4 min-w-[260px] hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-foreground">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main action button - bottom right */}
      <div 
        className="absolute bottom-6 right-4 z-10" 
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <motion.button
          onClick={toggleMenu}
          whileTap={{ scale: 0.9 }}
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="h-14 w-14 rounded-full bg-primary shadow-xl shadow-primary/40 flex items-center justify-center"
        >
          <Plus className="w-7 h-7 text-primary-foreground" />
        </motion.button>
      </div>
    </>
  );
};
