
import React from "react";
import { motion } from "framer-motion";

export const GolfBallLoader = () => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <motion.div 
        className="relative w-32 h-32"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Green/Course */}
        <motion.div 
          className="absolute bottom-0 w-full h-4 bg-gradient-to-r from-primary/5 to-primary/20 rounded-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        
        {/* Golf Hole */}
        <motion.div 
          className="absolute bottom-0 right-6 w-5 h-5 rounded-full bg-primary/40"
          initial={{ scale: 0, y: 2 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          {/* Hole shadow/depth */}
          <motion.div className="absolute inset-0 rounded-full bg-black/20" />
        </motion.div>
        
        {/* Golf Ball */}
        <motion.div
          className="absolute w-5 h-5 rounded-full bg-white shadow-md z-10"
          initial={{ x: -30, y: -40, opacity: 0 }}
          animate={{
            x: [null, -10, 10, 30, 40, 45],  
            y: [null, -50, -25, -10, -3, 0],
            opacity: [0, 1, 1, 1, 1, 0],
            scale: [0.9, 1, 1, 1, 0.9, 0.8]
          }}
          transition={{ 
            duration: 1.8, 
            repeat: Infinity,
            repeatDelay: 0.7,
            ease: "easeInOut",
            times: [0, 0.2, 0.4, 0.7, 0.9, 1]
          }}
        >
          {/* Ball texture detail */}
          <div className="absolute inset-0 rounded-full flex items-center justify-center overflow-hidden">
            <div className="grid grid-cols-3 grid-rows-3 gap-[1px] w-3 h-3 opacity-20">
              <div className="bg-gray-400 rounded-full"></div>
              <div className="bg-gray-400 rounded-full"></div>
              <div className="bg-gray-400 rounded-full"></div>
              <div className="bg-gray-400 rounded-full"></div>
              <div className="bg-gray-400 rounded-full"></div>
              <div className="bg-gray-400 rounded-full"></div>
              <div className="bg-gray-400 rounded-full"></div>
              <div className="bg-gray-400 rounded-full"></div>
              <div className="bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </motion.div>

        {/* Ball Shadow */}
        <motion.div
          className="absolute right-6 bottom-[2px] w-5 h-1 bg-black/10 rounded-full blur-[1px] z-5"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.1, 0.3, 0.5, 0.1, 0],
            scale: [0.5, 0.7, 0.9, 1, 0.7, 0]
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            repeatDelay: 0.7,
            times: [0, 0.2, 0.4, 0.7, 0.9, 1]
          }}
        />

        {/* Bandera */}
        <motion.div
          className="absolute bottom-0 right-6 flex flex-col items-center justify-end"
          initial={{ height: 0 }}
          animate={{ height: 36 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <motion.div
            initial={{ opacity: 0, rotate: -20 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
            className="origin-left"
          >
            <div className="w-8 h-5 bg-yellow-400 -ml-1" style={{ clipPath: "polygon(0 0, 0 100%, 100% 50%)" }} />
          </motion.div>
          <div className="w-[2px] h-full bg-gray-200" />
        </motion.div>

        {/* Texto "Cargando..." con animación de pulso */}
        <motion.div
          className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-sm text-primary font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        >
          Cargando...
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GolfBallLoader;
