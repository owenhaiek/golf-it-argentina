
import React from "react";

const GolfAnimationLoader = () => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[400px]">
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* Your custom golf animation */}
        <div className="w-24 h-24 flex items-center justify-center">
          <img 
            src="https://i.imgur.com/XuU1zUr.gif" 
            alt="Golf animation loading"
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Loading text */}
        <div className="text-lg font-medium text-gray-600 tracking-wide">
          Loading
        </div>
      </div>
    </div>
  );
};

export default GolfAnimationLoader;
