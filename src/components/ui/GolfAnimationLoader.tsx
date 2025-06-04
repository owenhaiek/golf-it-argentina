
import React from "react";

const GolfAnimationLoader = () => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[400px]">
      <div className="flex flex-col items-center justify-center space-y-8">
        {/* Your custom golf animation - much larger */}
        <div className="w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
          <img 
            src="https://i.imgur.com/XuU1zUr.gif" 
            alt="Golf animation loading"
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Loading text */}
        <div className="text-xl md:text-2xl font-medium text-gray-600 tracking-wide">
          Loading
        </div>
      </div>
    </div>
  );
};

export default GolfAnimationLoader;
