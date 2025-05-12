
import React from "react";
import { motion } from "framer-motion";
import { Flag } from "lucide-react";

export const GolfLoader = () => {
  return (
    <div className="flex items-center justify-center p-4 h-full">
      <motion.div 
        className="relative w-32 h-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Ground/Green */}
        <motion.div 
          className="absolute bottom-0 w-full h-1 bg-primary/10 rounded-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        
        {/* Golf Hole */}
        <motion.div 
          className="absolute bottom-0 right-4 w-3 h-3 rounded-full bg-primary/20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        />
        
        {/* Flag */}
        <motion.div
          className="absolute bottom-0 right-4 flex flex-col items-center justify-end"
          initial={{ height: 0 }}
          animate={{ height: 16 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            <Flag className="h-3 w-3 text-primary/60" />
          </motion.div>
          <div className="w-[1px] h-full bg-primary/40" />
        </motion.div>
        
        {/* Golf Ball */}
        <motion.div
          className="absolute w-3 h-3 rounded-full bg-muted shadow-sm z-10"
          initial={{ x: -20, y: -30, opacity: 0 }}
          animate={{
            x: [null, 0, 15, 30, 40, 45],  
            y: [null, -40, -10, -5, -2, 0],
            opacity: [0, 1, 1, 1, 1, 0.5],
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            repeatDelay: 0.5,
            ease: [0.34, 1.56, 0.64, 1] // Custom spring-like bounce effect
          }}
        >
          {/* Ball details (minimal line pattern) */}
          <div className="absolute inset-0 rounded-full flex items-center justify-center overflow-hidden">
            <div className="w-2 h-[0.5px] bg-gray-300/30" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
