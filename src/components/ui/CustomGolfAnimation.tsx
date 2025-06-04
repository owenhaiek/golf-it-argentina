
import React from "react";

const CustomGolfAnimation = () => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-screen relative bg-gradient-to-b from-blue-400 to-green-500 overflow-hidden">
      {/* Golf ball with smooth bouncing animation */}
      <div className="absolute" style={{ 
        left: '20%', 
        top: '45%',
        animation: 'golfBallBounce 2s ease-in-out infinite'
      }}>
        <div className="w-4 h-4 bg-white rounded-full shadow-lg relative">
          {/* Simple golf ball dimples */}
          <div className="absolute inset-0.5 border border-gray-200 rounded-full opacity-30"></div>
        </div>
      </div>

      {/* Golf club with swinging animation */}
      <div className="absolute" style={{ 
        left: '15%', 
        top: '50%',
        transformOrigin: 'bottom center',
        animation: 'clubSwing 2s ease-in-out infinite'
      }}>
        <div className="w-1 h-12 bg-amber-800 rounded-full"></div>
        <div className="absolute -bottom-0.5 -left-1 w-3 h-1.5 bg-gray-700 rounded"></div>
      </div>

      {/* Simple flag at the hole */}
      <div className="absolute" style={{ 
        right: '25%', 
        top: '40%'
      }}>
        <div className="w-0.5 h-8 bg-yellow-600"></div>
        <div className="absolute top-0 left-0.5 w-4 h-3 bg-red-500" style={{
          animation: 'flagWave 1.5s ease-in-out infinite'
        }}></div>
      </div>

      {/* CSS animations embedded directly */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes golfBallBounce {
            0% { transform: translateX(0) translateY(0); }
            25% { transform: translateX(40px) translateY(-30px); }
            50% { transform: translateX(80px) translateY(-15px); }
            75% { transform: translateX(120px) translateY(-5px); }
            100% { transform: translateX(160px) translateY(0); }
          }
          
          @keyframes clubSwing {
            0% { transform: rotate(-20deg); }
            25% { transform: rotate(30deg); }
            50% { transform: rotate(-10deg); }
            100% { transform: rotate(-20deg); }
          }
          
          @keyframes flagWave {
            0%, 100% { transform: scaleX(1); }
            50% { transform: scaleX(0.8); }
          }
        `
      }} />
    </div>
  );
};

export default CustomGolfAnimation;
