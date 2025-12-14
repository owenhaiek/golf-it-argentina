import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, Target, Trophy, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export const MapActionMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

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
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            onClick={() => setIsOpen(!isOpen)}
            size="icon"
            className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-primary-foreground" />
            ) : (
              <Plus className="w-6 h-6 text-primary-foreground" />
            )}
          </Button>
        </motion.div>
      </div>

      {/* Action items - slide up from button */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[5] bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Action buttons - centered above the main button */}
            <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 flex flex-col gap-3 items-center" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
              {actions.map((action, index) => (
                <motion.div
                  key={action.route}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: { delay: index * 0.05 }
                  }}
                  exit={{ 
                    opacity: 0, 
                    y: 10, 
                    scale: 0.9,
                    transition: { delay: (actions.length - index) * 0.03 }
                  }}
                >
                  <button
                    onClick={() => handleAction(action.route)}
                    className="flex items-center gap-4 bg-background/95 backdrop-blur-sm border shadow-lg rounded-2xl p-4 hover:bg-muted/50 active:scale-[0.98] transition-all min-w-[280px]"
                  >
                    <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-base">{action.label}</p>
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
