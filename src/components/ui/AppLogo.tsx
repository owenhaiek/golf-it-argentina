
import React from 'react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AppLogo = ({ size = 'md', className = '' }: AppLogoProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Golf Green */}
        <ellipse
          cx="50"
          cy="65"
          rx="35"
          ry="20"
          fill="#22c55e"
          stroke="#16a34a"
          strokeWidth="2"
        />
        
        {/* Sand Bunker */}
        <ellipse
          cx="25"
          cy="70"
          rx="12"
          ry="8"
          fill="#fbbf24"
          stroke="#f59e0b"
          strokeWidth="1"
        />
        
        {/* Golf Ball */}
        <circle
          cx="45"
          cy="60"
          r="3"
          fill="white"
          stroke="#e5e7eb"
          strokeWidth="0.5"
        />
        
        {/* Flag Pole */}
        <line
          x1="65"
          y1="30"
          x2="65"
          y2="65"
          stroke="#16a34a"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Flag */}
        <polygon
          points="65,30 65,45 85,37.5"
          fill="#ef4444"
          stroke="#dc2626"
          strokeWidth="1"
        />
        
        {/* Hole */}
        <circle
          cx="65"
          cy="65"
          r="2"
          fill="#374151"
        />
      </svg>
    </div>
  );
};

export default AppLogo;
