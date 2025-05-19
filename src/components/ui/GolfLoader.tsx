
import React from "react";
import { motion } from "framer-motion";

export const GolfLoader = () => {
  return (
    <div className="flex items-center justify-center p-4 h-full">
      <motion.div 
        className="relative w-32 h-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {/* Ground/Green */}
        <motion.div 
          className="absolute bottom-0 w-full h-2 bg-gradient-to-r from-[#87BC45]/20 to-[#68A436]/30 rounded-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        
        {/* Golf Hole */}
        <motion.div 
          className="absolute bottom-0 right-4 w-4 h-4 rounded-full bg-primary/30"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
        >
          <motion.div className="absolute inset-0 rounded-full bg-black/20" />
        </motion.div>
        
        {/* Flag */}
        <motion.div
          className="absolute bottom-0 right-4 flex flex-col items-center justify-end"
          initial={{ height: 0 }}
          animate={{ height: 18 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <div className="w-4 h-3 bg-yellow-400 -ml-0.5 shadow-sm" style={{ clipPath: "polygon(0 0, 0 100%, 100% 50%)" }} />
          </motion.div>
          <div className="w-[1px] h-full bg-gray-300" />
        </motion.div>
        
        {/* Golf Ball */}
        <motion.div
          className="absolute w-4 h-4 rounded-full bg-white shadow-sm z-10 flex items-center justify-center"
          animate={{
            x: [null, -5, 10, 25, 35, 40],  
            y: [null, -30, -15, -8, -2, 0],
            opacity: [0, 1, 1, 1, 1, 0],
            scale: [0.9, 1, 1, 1, 0.9, 0.8]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            repeatDelay: 0.4,
            ease: [0.34, 1.56, 0.64, 1], // Custom spring-like bounce effect
            times: [0, 0.2, 0.4, 0.7, 0.9, 1]
          }}
        >
          {/* Ball texture detail */}
          <div className="absolute inset-0 rounded-full flex items-center justify-center overflow-hidden">
            <div className="w-2 h-[0.5px] bg-gray-300/30" />
          </div>
        </motion.div>
        
        {/* Ball Shadow */}
        <motion.div
          className="absolute right-4 bottom-0 blur-[1px]"
          animate={{
            opacity: [0, 0.1, 0.2, 0.3, 0.1, 0],
            width: ["0.3rem", "0.4rem", "0.5rem", "0.6rem", "0.4rem", "0.3rem"],
            height: ["1px", "1px", "2px", "2px", "1px", "1px"],
            backgroundColor: ["rgba(0,0,0,0.1)", "rgba(0,0,0,0.15)", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.25)", "rgba(0,0,0,0.15)", "rgba(0,0,0,0.1)"]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 0.4,
            times: [0, 0.2, 0.4, 0.7, 0.9, 1]
          }}
        />
      </motion.div>
    </div>
  );
};

export default GolfLoader;
