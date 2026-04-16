import React from "react";
import { motion } from "framer-motion";
import golfSwingGif from "@/assets/golfswing.gif";

const AppLoadingScreen = () => {
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: '#092820' }}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Golf Swing Animation */}
        <motion.img
          src={golfSwingGif}
          alt="Loading"
          className="w-40 h-40 sm:w-48 sm:h-48 object-contain"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
        
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
