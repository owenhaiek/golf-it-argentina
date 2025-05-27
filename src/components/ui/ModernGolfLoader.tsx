
import React from "react";
import { motion } from "framer-motion";

const ModernGolfLoader = () => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[400px]">
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* Modern spinning circle */}
        <motion.div 
          className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full"
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
        />
        
        {/* Loading text */}
        <motion.div
          className="text-lg font-medium text-gray-600 tracking-wide"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Loading
        </motion.div>
      </div>
    </div>
  );
};

export default ModernGolfLoader;
