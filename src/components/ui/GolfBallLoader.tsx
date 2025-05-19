
import React from "react";
import { motion } from "framer-motion";

const GolfBallLoader = () => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <motion.div 
        className="relative w-32 h-32"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ willChange: "opacity, transform" }}
      >
        {/* Green/Course with hardware acceleration */}
        <motion.div 
          className="absolute bottom-0 w-full h-6 bg-gradient-to-r from-[#87BC45]/30 to-[#68A436]/40 rounded-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ willChange: "transform", transformOrigin: "center" }}
        />
        
        {/* Golf Hole with optimized rendering */}
        <motion.div 
          className="absolute bottom-0 right-6 w-6 h-6 rounded-full bg-primary/40"
          initial={{ scale: 0, y: 2 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ willChange: "transform" }}
        >
          {/* Hole shadow/depth */}
          <div className="absolute inset-0 rounded-full bg-black/30" />
        </motion.div>
        
        {/* Golf Ball with optimized animation */}
        <motion.div
          className="absolute w-6 h-6 rounded-full bg-white shadow-md z-10 flex items-center justify-center"
          animate={{
            x: [null, -10, 10, 30, 42, 45],  
            y: [null, -45, -20, -10, -3, 0],
            opacity: [0, 1, 1, 1, 1, 0],
            scale: [0.9, 1, 1, 1, 0.9, 0.8]
          }}
          transition={{ 
            duration: 1.6, 
            repeat: Infinity,
            repeatDelay: 0.4,
            ease: [0.34, 1.56, 0.64, 1], // Optimized bounce effect
            times: [0, 0.2, 0.4, 0.7, 0.9, 1]
          }}
          style={{ willChange: "transform, opacity" }}
        >
          {/* Simplified ball texture for better performance */}
          <div className="absolute inset-0 rounded-full flex items-center justify-center overflow-hidden">
            <div className="w-4 h-4 opacity-20 flex items-center justify-center">
              <div className="w-3 h-[1px] bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </motion.div>

        {/* Ball Shadow with simplified animation */}
        <motion.div
          className="absolute right-6 bottom-0 blur-sm"
          animate={{
            opacity: [0, 0.1, 0.3, 0.5, 0.1, 0],
            width: ["0.5rem", "0.75rem", "1rem", "1.25rem", "0.75rem", "0.5rem"],
            height: ["1px", "2px", "3px", "4px", "2px", "1px"],
          }}
          style={{ 
            backgroundColor: "rgba(0,0,0,0.2)",
            willChange: "width, opacity, height" 
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            repeatDelay: 0.4,
            times: [0, 0.2, 0.4, 0.7, 0.9, 1]
          }}
        />

        {/* Flag with smoother animation */}
        <motion.div
          className="absolute bottom-0 right-6 flex flex-col items-center justify-end"
          initial={{ height: 0 }}
          animate={{ height: 40 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ willChange: "height" }}
        >
          <motion.div
            initial={{ opacity: 0, rotate: -20 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="origin-left"
            style={{ willChange: "transform, opacity" }}
          >
            {/* Flag design */}
            <div className="w-8 h-5 bg-yellow-400 -ml-1 shadow-sm" style={{ clipPath: "polygon(0 0, 0 100%, 100% 50%)" }} />
          </motion.div>
          <div className="w-[2px] h-full bg-gray-300" />
        </motion.div>

        {/* "Cargando" text with subtle pulse animation */}
        <motion.div
          className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-sm font-medium tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          style={{ willChange: "opacity" }}
        >
          <motion.span 
            className="text-primary/80"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ 
              duration: 1.6, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            style={{ willChange: "opacity" }}
          >
            CARGANDO...
          </motion.span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GolfBallLoader;
