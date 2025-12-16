import React from "react";
import { motion } from "framer-motion";

const AppLoadingScreen = () => {
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: '#092820' }}
    >
      <div className="flex flex-col items-center justify-center space-y-8">
        {/* App Logo */}
        <motion.img
          src="/lovable-uploads/3dc401b2-fdd6-4815-a300-aa3c9b61ed9d.png"
          alt="GolfIt"
          className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
        
        {/* Golf Ball Animation */}
        <div className="relative w-32 h-12">
          {/* Ground line */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          />
          
          {/* Golf Ball */}
          <motion.div
            className="absolute bottom-1 left-4 w-5 h-5 rounded-full bg-white shadow-lg"
            style={{
              boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset -1px -1px 2px rgba(0,0,0,0.1)',
            }}
            animate={{
              x: [0, 80, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Ball dimples pattern */}
            <div className="absolute inset-0 rounded-full overflow-hidden opacity-20">
              <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-gray-400" />
              <div className="absolute top-2 right-1 w-0.5 h-0.5 rounded-full bg-gray-400" />
              <div className="absolute bottom-1 left-2 w-0.5 h-0.5 rounded-full bg-gray-400" />
            </div>
          </motion.div>
          
          {/* Ball shadow */}
          <motion.div
            className="absolute bottom-0 left-4 w-4 h-1 bg-black/20 rounded-full blur-[2px]"
            animate={{
              x: [0, 80, 0],
              scaleX: [1, 0.6, 1],
              opacity: [0.3, 0.15, 0.3],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
        
        {/* App name */}
        <motion.span
          className="text-white/80 text-sm font-medium tracking-widest uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15, delay: 0.1 }}
        >
          GolfIt
        </motion.span>
      </div>
    </div>
  );
};

export default AppLoadingScreen;
