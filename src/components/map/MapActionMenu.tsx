import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Target, Trophy, Swords, Lock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";

interface MapActionMenuProps {
  onOpenChange?: (isOpen: boolean) => void;
}

export const MapActionMenu = ({ onOpenChange }: MapActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isPremium } = useSubscription();

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
      shadowColor: 'shadow-emerald-500/30',
      requiresPremium: false
    },
    {
      icon: Swords,
      label: t('matches', 'challengeFriend'),
      description: t('matches', 'matchDetails'),
      route: '/create-match',
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      shadowColor: 'shadow-red-500/30',
      requiresPremium: false
    },
    {
      icon: Trophy,
      label: t('tournaments', 'createTournament'),
      description: t('tournaments', 'tournamentDetails'),
      route: '/create-tournament',
      color: 'bg-amber-500',
      shadowColor: 'shadow-amber-500/30',
      requiresPremium: true
    }
  ];

  // Haptic feedback function
  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10); // Short, subtle vibration
    }
  }, []);

  const handleAction = useCallback((route: string, requiresPremium: boolean) => {
    triggerHaptic();
    
    if (requiresPremium && !isPremium) {
      toast.error("Esta función requiere una suscripción Premium", {
        action: {
          label: "Ver planes",
          onClick: () => navigate('/subscription')
        }
      });
      return;
    }
    
    setIsOpen(false);
    requestAnimationFrame(() => {
      setTimeout(() => navigate(route), 100);
    });
  }, [navigate, triggerHaptic, isPremium]);

  const toggleMenu = useCallback(() => {
    triggerHaptic();
    setIsOpen(prev => !prev);
  }, [triggerHaptic]);

  // Animation variants for container - smooth and fast
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0,
      }
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.03,
        staggerDirection: -1,
        duration: 0.12
      }
    }
  };

  // Animation variants for items - smooth spring
  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 12, 
      scale: 0.95,
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.5
      }
    },
    exit: { 
      opacity: 0, 
      y: 6, 
      scale: 0.97,
      transition: {
        duration: 0.12,
        ease: "easeOut"
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
            transition={{ duration: 0.12, ease: "easeOut" }}
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
            {actions.map((action, index) => {
              const isLocked = action.requiresPremium && !isPremium;
              
              return (
                <motion.button
                  key={action.route}
                  variants={itemVariants}
                  onClick={() => handleAction(action.route, action.requiresPremium)}
                  whileHover={{ scale: 1.02, x: -4 }}
                  whileTap={{ scale: 0.97 }}
                  className={`
                    flex items-center gap-3 
                    bg-zinc-900/95 backdrop-blur-xl 
                    border border-white/10
                    shadow-2xl rounded-2xl p-4 
                    min-w-[280px] 
                    transition-colors duration-200
                    ${isLocked ? 'opacity-60' : 'hover:bg-zinc-800/95'}
                  `}
                >
                  <motion.div 
                    className={`w-12 h-12 ${isLocked ? 'bg-zinc-600' : action.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${isLocked ? 'shadow-zinc-600/30' : action.shadowColor}`}
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    {isLocked ? (
                      <Lock className="w-6 h-6 text-white" />
                    ) : (
                      <action.icon className="w-6 h-6 text-white" />
                    )}
                  </motion.div>
                  <div className="text-left flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground text-[15px]">{action.label}</p>
                      {isLocked && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-medium">
                          Premium
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">{action.description}</p>
                  </div>
                  <motion.div 
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
                  >
                    {isLocked ? (
                      <Lock className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </motion.div>
                </motion.button>
              );
            })}
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
          animate={{ 
            rotate: isOpen ? 135 : 0,
            scale: isOpen ? 1.05 : 1
          }}
          transition={{ 
            type: "spring",
            stiffness: 500,
            damping: 25
          }}
          className={`
            h-14 w-14 rounded-full 
            bg-[#0a2820]
            shadow-xl shadow-black/40 
            flex items-center justify-center
            ${isOpen ? 'ring-4 ring-[#0a2820]/30' : ''}
          `}
        >
          <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
        </motion.button>
      </div>
    </>
  );
};
