
import React from "react";
import { motion } from "framer-motion";

export const GolfLoader = () => {
  return (
    <div className="flex items-center justify-center p-4">
      <motion.div 
        className="relative w-24 h-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {/* Ground Line */}
        <motion.div 
          className="absolute bottom-0 w-full h-[1px] rounded-full overflow-hidden"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="w-full h-full bg-primary/30" />
        </motion.div>
        
        {/* Golf Ball */}
        <motion.div
          className="absolute w-2 h-2 rounded-full bg-primary/60 shadow-sm z-10"
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{ 
            x: [0, 20, 40, 60, 80], 
            y: [0, -10, -12, -8, 0],
            opacity: [0, 1, 1, 1, 0.6],
          }}
          transition={{ 
            duration: 1.2, 
            repeat: Infinity,
            repeatDelay: 0.1,
            ease: "easeInOut"
          }}
        />
        
        {/* Flag */}
        <motion.div
          className="absolute bottom-0 right-4 w-[1px] h-4 bg-primary/40 origin-bottom"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.2, delay: 0.3 }}
        >
          <motion.div 
            className="absolute top-0 w-3 h-2 bg-primary/30"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.2, delay: 0.4 }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

