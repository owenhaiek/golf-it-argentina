
import React from "react";
import { motion } from "framer-motion";

const ModernGolfLoader = () => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[400px]">
      <div className="flex flex-col items-center justify-center space-y-8">
        {/* Main animation container */}
        <motion.div 
          className="relative w-32 h-32 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 border-3 border-primary/20 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Inner spinning ring */}
          <motion.div
            className="absolute inset-3 border-3 border-t-primary border-r-primary/40 border-b-transparent border-l-transparent rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Golf ball in center */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ 
              y: [0, -6, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center relative overflow-hidden">
              {/* Golf ball dimple pattern */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-3 grid-rows-3 gap-[1px] w-6 h-6 opacity-40">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="bg-gray-400 rounded-full w-[2px] h-[2px]"></div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Pulsing dots around the circle */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-primary rounded-full"
              style={{
                left: '50%',
                top: '50%',
                transformOrigin: '0 48px',
                transform: `rotate(${i * 60}deg) translateY(-48px) translateX(-3px)`
              }}
              animate={{
                scale: [0.5, 1, 0.5],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.25,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
        
        {/* Loading text section */}
        <motion.div
          className="flex flex-col items-center justify-center space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <motion.div 
            className="text-xl font-semibold text-primary tracking-widest"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          >
            LOADING
          </motion.div>
          
          {/* Animated dots */}
          <motion.div
            className="flex justify-center items-center space-x-1"
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
      </div>
    </div>
  );
};

export default ModernGolfLoader;
