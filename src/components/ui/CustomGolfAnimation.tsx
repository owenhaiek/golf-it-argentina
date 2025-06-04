
import React from "react";

const CustomGolfAnimation = () => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-screen relative bg-gradient-to-b from-sky-400 via-sky-300 to-green-400">
      {/* Golf course background */}
      <div className="absolute inset-0">
        {/* Sky and clouds */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-sky-400 to-sky-300">
          {/* Animated clouds */}
          <div className="absolute top-8 left-1/4 w-16 h-8 bg-white rounded-full opacity-80 animate-float"></div>
          <div className="absolute top-12 right-1/4 w-12 h-6 bg-white rounded-full opacity-60 animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-6 left-1/2 w-20 h-10 bg-white rounded-full opacity-70 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* Golf course ground */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-green-600 to-green-400">
          {/* Golf hole */}
          <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2">
            <div className="w-4 h-4 bg-black rounded-full"></div>
            {/* Flag */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
              <div className="w-0.5 h-12 bg-yellow-600"></div>
              <div className="absolute top-0 left-0.5 w-6 h-4 bg-red-500 animate-pulse"></div>
            </div>
          </div>
          
          {/* Golf ball */}
          <div className="absolute bottom-1/2 left-1/4 transform -translate-x-1/2">
            <div className="w-3 h-3 bg-white rounded-full shadow-lg animate-bounce golf-ball">
              {/* Golf ball dimples */}
              <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-gray-200 rounded-full"></div>
              <div className="absolute top-1 right-0.5 w-0.5 h-0.5 bg-gray-200 rounded-full"></div>
              <div className="absolute bottom-0.5 left-1 w-0.5 h-0.5 bg-gray-200 rounded-full"></div>
            </div>
          </div>
          
          {/* Golf club animation */}
          <div className="absolute bottom-1/2 left-1/4 transform -translate-x-8">
            <div className="golf-club-swing">
              <div className="w-1 h-16 bg-brown-600 rounded-full origin-bottom transform rotate-45"></div>
              <div className="absolute -bottom-1 -left-1 w-3 h-2 bg-gray-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Loading text at the bottom of the screen */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center z-10">
        <div className="text-3xl md:text-4xl font-bold text-white tracking-wide drop-shadow-lg animate-pulse">
          Loading
        </div>
      </div>
      
      <style jsx>{`
        .golf-ball {
          animation: golf-bounce 2s ease-in-out infinite;
        }
        
        .golf-club-swing {
          animation: club-swing 2s ease-in-out infinite;
        }
        
        @keyframes golf-bounce {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(20px); }
          75% { transform: translateY(-5px) translateX(30px); }
        }
        
        @keyframes club-swing {
          0%, 100% { transform: rotate(45deg); }
          50% { transform: rotate(-10deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default CustomGolfAnimation;
