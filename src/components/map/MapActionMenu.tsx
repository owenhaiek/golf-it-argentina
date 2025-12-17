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
      color: 'bg-emerald-500',
      shadowColor: 'shadow-emerald-500/30'
    },
    {
      icon: Trophy,
      label: t('tournaments', 'createTournament'),
      description: t('tournaments', 'tournamentDetails'),
      route: '/create-tournament',
      color: 'bg-amber-500',
      shadowColor: 'shadow-amber-500/30'
    },
    {
      icon: Swords,
      label: t('matches', 'challengeFriend'),
      description: t('matches', 'matchDetails'),
      route: '/create-match',
      color: 'bg-blue-500',
      shadowColor: 'shadow-blue-500/30'
    }
  ];

  const handleAction = useCallback((route: string) => {
    setIsOpen(false);
    requestAnimationFrame(() => {
      setTimeout(() => navigate(route), 150);
    });
  }, [navigate]);

  const toggleMenu = useCallback(() => setIsOpen(prev => !prev), []);

  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.02,
      }
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.03,
        staggerDirection: -1,
      }
    }
  };

  // Animation variants for items
  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20, 
      scale: 0.8,
      filter: "blur(4px)"
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.8
      }
    },
    exit: { 
      opacity: 0, 
      y: 10, 
      scale: 0.9,
      filter: "blur(2px)",
      transition: {
        duration: 0.15,
        ease: "easeIn"
      }
    }
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence mode="sync">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[5] bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Action items */}
      <AnimatePresence mode="sync">
        {isOpen && (
          <motion.div 
            className="absolute bottom-28 right-4 z-10 flex flex-col gap-3 items-end"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.route}
                variants={itemVariants}
                onClick={() => handleAction(action.route)}
                whileHover={{ scale: 1.02, x: -4 }}
                whileTap={{ scale: 0.97 }}
                className={`
                  flex items-center gap-3 
                  bg-zinc-900/95 backdrop-blur-xl 
                  border border-white/10
                  shadow-2xl rounded-2xl p-4 
                  min-w-[280px] 
                  transition-colors duration-200
                  hover:bg-zinc-800/95
                `}
              >
                <motion.div 
                  className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${action.shadowColor}`}
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <action.icon className="w-6 h-6 text-white" />
                </motion.div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-foreground text-[15px]">{action.label}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{action.description}</p>
                </div>
                <motion.div 
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
                >
                  <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.div>
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
          whileTap={{ scale: 0.9 }}
          animate={{ 
            rotate: isOpen ? 135 : 0,
            scale: isOpen ? 1.05 : 1
          }}
          transition={{ 
            type: "spring",
            stiffness: 400,
            damping: 20
          }}
          className={`
            h-14 w-14 rounded-full 
            bg-gradient-to-br from-primary to-primary/80
            shadow-xl shadow-primary/40 
            flex items-center justify-center
            ${isOpen ? 'ring-4 ring-primary/20' : ''}
          `}
        >
          <Plus className="w-7 h-7 text-primary-foreground" strokeWidth={2.5} />
        </motion.button>
      </div>
    </>
  );
};
