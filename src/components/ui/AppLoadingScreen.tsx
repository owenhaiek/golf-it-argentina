
import React from "react";
import { motion } from "framer-motion";

const AppLoadingScreen = () => {
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: '#092820' }}
    >
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* App Logo - Immediate appearance */}
        <motion.div
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.1,
            ease: "easeOut"
          }}
          className="relative"
        >
          <img
            src="/lovable-uploads/3dc401b2-fdd6-4815-a300-aa3c9b61ed9d.png"
            alt="Golf App Logo"
            className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 object-contain"
            loading="eager"
            decoding="sync"
            style={{ display: 'block' }}
          />
        </motion.div>
        
        {/* Loading spinner - Immediate appearance */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
        >
          <motion.div 
            className="w-8 h-8 border-4 border-gray-400 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </motion.div>
        
        {/* App name - Immediate appearance */}
        <motion.div
          className="text-white text-sm font-medium tracking-wide"
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1 }}
        >
          GolfIt
        </motion.div>
      </div>
    </div>
  );
};

export default AppLoadingScreen;
