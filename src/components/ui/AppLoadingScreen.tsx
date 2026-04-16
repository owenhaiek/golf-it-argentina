import React from "react";
import golfSwingGif from "@/assets/golfswing.gif";

const AppLoadingScreen = () => {
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: '#092820' }}
    >
      <img
        src={golfSwingGif}
        alt="Loading"
        className="w-40 h-40 sm:w-48 sm:h-48 object-contain"
      />
    </div>
  );
};

export default AppLoadingScreen;
