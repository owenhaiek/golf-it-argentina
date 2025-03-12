
import React from "react";
import { motion } from "framer-motion";

export const GolfLoader = () => {
  return (
    <div className="w-full h-24 flex items-center justify-center overflow-hidden">
      <div className="relative w-40 h-16">
        {/* Minimal Ground Line */}
        <motion.div 
          className="absolute bottom-0 w-full h-[2px] rounded-full overflow-hidden"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="w-full h-full bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
        </motion.div>
        
        {/* Golf Ball */}
        <motion.div
          className="absolute w-3 h-3 rounded-full bg-white border border-primary/40 shadow-sm z-10"
          initial={{ 
            x: 0, 
            y: 0, 
            opacity: 0,
            boxShadow: "0 0 0 0 rgba(42, 71, 70, 0.1)" 
          }}
          animate={{ 
            x: [0, 20, 40, 60, 80, 100, 120], 
            y: [0, -14, -18, -16, -10, -4, 0],
            opacity: [0, 1, 1, 1, 1, 1, 0.8],
            boxShadow: ["0 0 0 0 rgba(42, 71, 70, 0.1)", "0 4px 6px -1px rgba(42, 71, 70, 0.1)"]
          }}
          transition={{ 
            duration: 2.2, 
            repeat: Infinity,
            repeatDelay: 0.3,
            ease: "easeInOut"
          }}
        />
        
        {/* Flag and Hole Area */}
        <div className="absolute bottom-0 right-4 flex flex-col items-center">
          {/* Flag Pole */}
          <motion.div
            className="absolute bottom-0 w-[1px] bg-primary/90 origin-bottom"
            initial={{ height: 0 }}
            animate={{ height: 20 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {/* Flag */}
            <motion.div 
              className="absolute top-0 left-0 w-5 h-4 origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.3, delay: 0.9 }}
            >
              <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                <path 
                  d="M0,0 L12,3 L12,13 L0,16 Z" 
                  fill="#E8B87D"
                  stroke="#D6A66B"
                  strokeWidth="0.5"
                />
              </svg>
            </motion.div>
          </motion.div>
          
          {/* Hole */}
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 6 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className="absolute bottom-0 h-1.5 rounded-full bg-primary/20 overflow-hidden"
          >
            <motion.div 
              className="absolute inset-0 bg-primary/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.9 }}
            />
          </motion.div>
        </div>
        
        {/* Ball Path - Elegant Arc */}
        <svg 
          className="absolute top-0 left-0 w-full h-full z-0" 
          viewBox="0 0 160 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            d="M 5 22 Q 40 0 80 10 Q 120 20 140 22"
            stroke="rgba(42, 71, 70, 0.15)"
            strokeWidth="0.8"
            strokeDasharray="1,3"
            strokeLinecap="round"
            fill="transparent"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1, 
              opacity: [0, 0.3, 0.5, 0.3, 0]
            }}
            transition={{ 
              duration: 2.2, 
              repeat: Infinity,
              repeatDelay: 0.3,
              ease: "easeInOut"
            }}
          />
        </svg>
        
        {/* Loading Text */}
        <motion.div
          className="absolute bottom-[-24px] left-1/2 transform -translate-x-1/2 text-xs text-primary/70 font-light tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "loop"
          }}
        >
          Loading
        </motion.div>
      </div>
    </div>
  );
};
