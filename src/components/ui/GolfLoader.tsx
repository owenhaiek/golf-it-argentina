
import React from "react";
import { motion } from "framer-motion";

export const GolfLoader = () => {
  return (
    <div className="w-full h-20 flex items-center justify-center overflow-hidden">
      <div className="relative w-36 h-12">
        {/* Green/Course */}
        <motion.div 
          className="absolute bottom-0 w-full h-3 bg-secondary/40 rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Hole */}
        <motion.div 
          className="absolute bottom-0 right-2 w-4 h-4 rounded-full bg-primary/80 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="w-2 h-2 bg-background rounded-full" />
        </motion.div>
        
        {/* Golf Ball */}
        <motion.div
          className="absolute w-3 h-3 bg-white rounded-full shadow-md z-10"
          initial={{ x: 0, y: -5, opacity: 0 }}
          animate={{ 
            x: [0, 15, 30, 45, 60, 75, 90, 105, 120], 
            y: [-5, -20, -25, -20, -15, -10, -5, 0, 0],
            opacity: [0, 1, 1, 1, 1, 1, 1, 1, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Ball Path */}
        <svg 
          className="absolute top-0 left-0 w-full h-full z-0" 
          viewBox="0 0 140 50" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            d="M 0 30 Q 35 0 70 15 Q 105 30 140 30"
            stroke="#E8B87D"
            strokeWidth="1.5"
            strokeDasharray="3,3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.2, 0.5, 0.8, 1, 0.8, 0.5, 0.2, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
        
        {/* Flag/Pin */}
        <motion.div
          className="absolute bottom-0 right-3 flex flex-col items-center"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 16, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="w-0.5 h-full bg-primary" />
          <motion.div 
            className="absolute top-0 w-4 h-3 bg-accent"
            initial={{ width: 0 }}
            animate={{ width: 4 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          />
        </motion.div>
      </div>
    </div>
  );
};
