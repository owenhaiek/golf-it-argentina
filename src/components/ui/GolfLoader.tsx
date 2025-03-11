
import React from "react";
import { motion } from "framer-motion";

export const GolfLoader = () => {
  return (
    <div className="w-full h-20 flex items-center justify-center overflow-hidden">
      <div className="relative w-36 h-12">
        {/* Green/Course - Enhanced Line with Gradient */}
        <motion.div 
          className="absolute bottom-0 w-full h-0.5 rounded-full overflow-hidden"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-full h-full bg-gradient-to-r from-primary/60 via-primary to-primary/80" />
        </motion.div>
        
        {/* Flag Pole - Slightly thicker and more defined */}
        <motion.div
          className="absolute bottom-0 right-3 w-[1.5px] bg-primary origin-bottom"
          initial={{ height: 0 }}
          animate={{ height: 18 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          {/* Flag - Enhanced with subtle shadow */}
          <motion.div 
            className="absolute top-0 left-0 w-6 h-4 bg-accent shadow-sm origin-left"
            style={{ 
              transformOrigin: '0% 50%',
              clipPath: 'polygon(0 0, 100% 25%, 100% 75%, 0 100%)'
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          />
        </motion.div>
        
        {/* Hole - More defined with subtle shadow */}
        <motion.div 
          className="absolute bottom-0 right-3 w-4 h-2 rounded-t-full bg-background border border-primary/80 border-b-0 shadow-inner"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.6 }}
        />
        
        {/* Golf Ball */}
        <motion.div
          className="absolute w-2.5 h-2.5 rounded-full border border-primary/90 bg-white shadow-sm z-10"
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{ 
            x: [0, 20, 40, 60, 80, 100, 110, 120], 
            y: [0, -10, -14, -12, -8, -4, -2, 0],
            opacity: [0, 1, 1, 1, 1, 1, 1, 1]
          }}
          transition={{ 
            duration: 1.8, 
            repeat: Infinity,
            repeatDelay: 0.5,
            ease: "easeInOut"
          }}
        />
        
        {/* Ball Path - Enhanced Dotted Line */}
        <svg 
          className="absolute top-0 left-0 w-full h-full z-0" 
          viewBox="0 0 140 20" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            d="M 5 12 Q 35 2 70 7 Q 105 12 128 12"
            stroke="rgba(42, 71, 70, 0.4)"
            strokeWidth="0.8"
            strokeDasharray="1,3"
            strokeLinecap="round"
            fill="transparent"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.4, 0.7, 0.4, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 0.5, ease: "easeInOut" }}
          />
        </svg>
      </div>
    </div>
  );
};
