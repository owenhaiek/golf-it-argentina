
import React from "react";
import { motion } from "framer-motion";

const AppLoadingScreen = () => {
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: '#092820' }}
    >
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* App Logo - Instant appearance */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.3,
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
          />
        </motion.div>
        
        {/* Loading spinner - Quick appearance */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
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
        
        {/* App name - Quick appearance */}
        <motion.div
          className="text-white text-sm font-medium tracking-wide"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.2 }}
        >
          GolfIt
        </motion.div>
      </div>
    </div>
  );
};

export default AppLoadingScreen;
