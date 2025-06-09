
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
      <img
        src="/lovable-uploads/c4b5d185-bd84-43f5-8ec7-4de4b18ca81c.png"
        alt="Golf App Logo"
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default AppLogo;
