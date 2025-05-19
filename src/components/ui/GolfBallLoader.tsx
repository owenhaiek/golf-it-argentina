
import React from "react";
import { motion } from "framer-motion";

export const GolfBallLoader = () => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <motion.div 
        className="relative w-32 h-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Green/Course */}
        <motion.div 
          className="absolute bottom-0 w-full h-2 bg-primary/10 rounded-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        
        {/* Golf Hole */}
        <motion.div 
          className="absolute bottom-0 right-4 w-4 h-4 rounded-full bg-primary/30"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        />
        
        {/* Golf Ball */}
        <motion.div
          className="absolute w-4 h-4 rounded-full bg-white shadow-md z-10"
          initial={{ x: -20, y: -30, opacity: 0 }}
          animate={{
            x: [null, 0, 15, 30, 40, 45],  
            y: [null, -40, -10, -5, -2, 0],
            opacity: [0, 1, 1, 1, 1, 0.2],
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            repeatDelay: 0.5,
            ease: [0.34, 1.56, 0.64, 1] // Efecto rebote personalizado
          }}
        >
          {/* Detalles de la pelota (líneas mínimas) */}
          <div className="absolute inset-0 rounded-full flex items-center justify-center overflow-hidden">
            <div className="w-2 h-[0.5px] bg-gray-300/60" />
          </div>
        </motion.div>

        {/* Bandera */}
        <motion.div
          className="absolute bottom-0 right-4 flex flex-col items-center justify-end"
          initial={{ height: 0 }}
          animate={{ height: 20 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            <div className="w-5 h-3 bg-primary/60" />
          </motion.div>
          <div className="w-[1px] h-full bg-primary/40" />
        </motion.div>

        {/* Texto "Cargando..." */}
        <motion.div
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-primary/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          Cargando...
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GolfBallLoader;
