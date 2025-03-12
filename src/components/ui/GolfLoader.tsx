
import React from "react";
import { motion } from "framer-motion";

export const GolfLoader = () => {
  return (
    <div className="flex items-center justify-center p-4">
      <motion.div 
        className="relative w-28 h-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Minimal Ground Line */}
        <motion.div 
          className="absolute bottom-0 w-full h-[1px] rounded-full overflow-hidden"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="w-full h-full bg-primary/40" />
        </motion.div>
        
        {/* Golf Ball */}
        <motion.div
          className="absolute w-2.5 h-2.5 rounded-full bg-white border border-primary/40 shadow-sm z-10"
          initial={{ 
            x: 0, 
            y: 0, 
            opacity: 0,
          }}
          animate={{ 
            x: [0, 20, 40, 60, 80, 100], 
            y: [0, -12, -16, -14, -8, 0],
            opacity: [0, 1, 1, 1, 1, 0.8],
          }}
          transition={{ 
            duration: 1.8, 
            repeat: Infinity,
            repeatDelay: 0.2,
            ease: "easeInOut"
          }}
        />
        
        {/* Flag Pole */}
        <motion.div
          className="absolute bottom-0 right-4 w-[1px] bg-primary/60 origin-bottom"
          initial={{ height: 0 }}
          animate={{ height: 16 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          {/* Flag */}
          <motion.div 
            className="absolute top-0 left-0 w-4 h-3 origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.2, delay: 0.7 }}
          >
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <path 
                d="M0,0 L10,2 L10,10 L0,12 Z" 
                fill="#E8B87D"
                strokeWidth="0.3"
              />
            </svg>
          </motion.div>
        </motion.div>
        
        {/* Hole */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 4 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="absolute bottom-0 right-4 h-1 rounded-full bg-primary/30"
        />
      </motion.div>
    </div>
  );
};
