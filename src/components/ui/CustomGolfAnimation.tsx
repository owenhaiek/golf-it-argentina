import React from "react";
import golfSwingGif from "@/assets/golfswing.gif";

const CustomGolfAnimation = () => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-screen" style={{ backgroundColor: '#092820' }}>
      <img
        src={golfSwingGif}
        alt="Loading"
        className="w-40 h-40 sm:w-48 sm:h-48 object-contain"
        style={{ mixBlendMode: 'screen' }}
      />
    </div>
  );
};

export default CustomGolfAnimation;
