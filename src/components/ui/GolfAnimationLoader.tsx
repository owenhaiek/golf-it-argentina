
import React from "react";
import CustomGolfAnimation from "./CustomGolfAnimation";

const GolfAnimationLoader = () => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-screen relative">
      {/* Custom golf animation that loads instantly */}
      <CustomGolfAnimation />
    </div>
  );
};

export default GolfAnimationLoader;
