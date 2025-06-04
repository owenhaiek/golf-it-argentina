
import React from "react";
import { motion } from "framer-motion";

const CustomGolfAnimation = () => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-screen bg-background">
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Simple spinning circle */}
        <motion.div 
          className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full"
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Optional loading text */}
        <motion.div
          className="text-sm font-medium text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Loading...
        </motion.div>
      </div>
    </div>
  );
};

export default CustomGolfAnimation;
