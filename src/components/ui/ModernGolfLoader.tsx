
import React from "react";
import { motion } from "framer-motion";

const ModernGolfLoader = () => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[300px]">
      <motion.div 
        className="relative w-40 h-40"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 border-4 border-primary/20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner spinning ring */}
        <motion.div
          className="absolute inset-4 border-4 border-t-primary border-r-primary/40 border-b-transparent border-l-transparent rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Golf ball in center */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ 
            y: [0, -8, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center relative overflow-hidden">
            {/* Golf ball dimple pattern */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-4 grid-rows-4 gap-px w-8 h-8 opacity-30">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="bg-gray-400 rounded-full w-1 h-1"></div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Pulsing dots around the circle */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary rounded-full"
            style={{
              left: '50%',
              top: '50%',
              transformOrigin: '0 60px',
              transform: `rotate(${i * 45}deg) translateY(-60px)`
            }}
            animate={{
              scale: [0.5, 1, 0.5],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Loading text */}
        <motion.div
          className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <motion.div 
            className="text-lg font-medium text-primary tracking-wider"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          >
            LOADING
          </motion.div>
          <motion.div
            className="flex justify-center mt-2 space-x-1"
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-primary rounded-full"
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ModernGolfLoader;
