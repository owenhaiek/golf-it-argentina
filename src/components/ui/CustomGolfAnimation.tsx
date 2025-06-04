
import React from "react";

const CustomGolfAnimation = () => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-screen relative bg-gradient-to-b from-sky-200 to-green-200 overflow-hidden">
      
      {/* Golf hole (target) */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 translate-x-16 translate-y-8">
        <div className="w-8 h-4 bg-black rounded-full shadow-inner"></div>
      </div>

      {/* Flag in the center */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 translate-x-16 translate-y-4">
        {/* Flag pole */}
        <div className="w-1 h-16 bg-yellow-600 rounded-full"></div>
        {/* Flag */}
        <div 
          className="absolute top-0 left-1 w-6 h-4 bg-red-500 rounded-r"
          style={{
            animation: 'flagWave 2s ease-in-out infinite'
          }}
        ></div>
      </div>

      {/* Golf ball with smooth bouncing animation */}
      <div 
        className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 -translate-x-24 translate-y-8"
        style={{
          animation: 'ballRoll 3s ease-in-out infinite'
        }}
      >
        <div className="w-3 h-3 bg-white rounded-full shadow-lg border border-gray-200">
          {/* Golf ball dimples */}
          <div className="absolute inset-0.5 rounded-full opacity-20">
            <div className="w-0.5 h-0.5 bg-gray-400 rounded-full absolute top-0.5 left-0.5"></div>
            <div className="w-0.5 h-0.5 bg-gray-400 rounded-full absolute top-1 right-0.5"></div>
            <div className="w-0.5 h-0.5 bg-gray-400 rounded-full absolute bottom-0.5 left-1"></div>
          </div>
        </div>
      </div>

      {/* CSS animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes ballRoll {
            0% { 
              transform: translate(-96px, 32px) rotate(0deg);
            }
            20% { 
              transform: translate(-64px, 16px) rotate(72deg);
            }
            40% { 
              transform: translate(-32px, 24px) rotate(144deg);
            }
            60% { 
              transform: translate(0px, 16px) rotate(216deg);
            }
            80% { 
              transform: translate(32px, 20px) rotate(288deg);
            }
            90% { 
              transform: translate(48px, 24px) rotate(324deg);
            }
            100% { 
              transform: translate(64px, 32px) rotate(360deg);
              opacity: 0;
            }
          }
          
          @keyframes flagWave {
            0%, 100% { 
              transform: scaleX(1);
            }
            50% { 
              transform: scaleX(0.85);
            }
          }
        `
      }} />
    </div>
  );
};

export default CustomGolfAnimation;
