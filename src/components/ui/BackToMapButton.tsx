import { Map, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export const BackToMapButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Set flag to trigger map entry animation
    sessionStorage.setItem('map-entry-animation', 'true');
    navigate('/');
  };

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
      initial={{ y: 100, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ 
        type: "spring", 
        damping: 20, 
        stiffness: 300,
        delay: 0.2
      }}
      style={{ 
        paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 16px)'
      }}
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button 
          onClick={handleClick}
          className="pointer-events-auto h-14 px-8 rounded-full bg-primary hover:bg-primary/90 shadow-2xl text-base font-semibold gap-3 relative overflow-hidden group"
        >
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary via-emerald-400 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{ backgroundSize: '200% 100%' }}
          />
          
          {/* Pulse ring effect */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/50"
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Content */}
          <motion.div
            className="relative z-10 flex items-center gap-3"
          >
            <motion.div
              animate={{
                x: [0, -3, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.div>
            <Map className="w-5 h-5" />
            <span>Volver al Mapa</span>
          </motion.div>
        </Button>
      </motion.div>
    </motion.div>
  );
};
