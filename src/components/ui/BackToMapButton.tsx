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
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <Button 
          onClick={handleClick}
          className="pointer-events-auto h-12 px-6 rounded-full bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/50 hover:bg-zinc-800/90 hover:border-zinc-600/50 shadow-2xl shadow-black/50 text-sm font-medium gap-2.5 relative overflow-hidden group transition-all duration-300"
        >
          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Content */}
          <div className="relative z-10 flex items-center gap-2.5 text-zinc-100">
            <motion.div
              animate={{
                x: [0, -2, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <ChevronLeft className="w-4 h-4 text-zinc-400" />
            </motion.div>
            <Map className="w-4 h-4 text-emerald-400" />
            <span>Volver al Mapa</span>
          </div>
        </Button>
      </motion.div>
    </motion.div>
  );
};
