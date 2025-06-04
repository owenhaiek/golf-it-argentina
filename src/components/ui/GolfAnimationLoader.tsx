
import React from "react";

const GolfAnimationLoader = () => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-screen relative">
      {/* Full screen golf animation */}
      <div className="w-full h-full flex items-center justify-center">
        <img 
          src="https://i.imgur.com/XuU1zUr.gif" 
          alt="Golf animation loading"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Loading text overlaid on the image */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-3xl md:text-4xl font-bold text-white tracking-wide drop-shadow-lg">
          Loading
        </div>
      </div>
    </div>
  );
};

export default GolfAnimationLoader;
