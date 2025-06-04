
import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";
import { useState, useRef } from "react";
import GolfAnimationLoader from "./ui/GolfAnimationLoader";
import { motion } from "framer-motion";

export const Layout = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  const handleTouchStart = (e: TouchEvent) => {
    if (mainRef.current && mainRef.current.scrollTop <= 0) {
      setStartY(e.touches[0].clientY);
      setIsPulling(true);
      setPullDistance(0);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isPulling) return;
    
    if (mainRef.current && mainRef.current.scrollTop <= 0) {
      const currentY = e.touches[0].clientY;
      const newPullDistance = Math.sqrt(Math.max(0, currentY - startY) * 8);
      
      setPullDistance(newPullDistance);
      
      if (newPullDistance > 10) {
        e.preventDefault();
      }
      
      if (newPullDistance > 100 && !isRefreshing) {
        if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(50);
        }
        
        setIsRefreshing(true);
        setTimeout(() => {
          window.location.reload();
        }, 300);
      }
    } else {
      setIsPulling(false);
      setPullDistance(0);
    }
  };
  
  const handleTouchEnd = () => {
    setIsPulling(false);
    setPullDistance(0);
    
    if (pullDistance < 100) {
      setIsRefreshing(false);
    }
  };

  const mainElement = mainRef.current;
  if (mainElement) {
    mainElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    mainElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    mainElement.addEventListener('touchend', handleTouchEnd);
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-background h-full w-full overflow-hidden">
      {pullDistance > 0 && !isRefreshing && (
        <motion.div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center z-40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: Math.min(pullDistance / 100, 0.8),
            height: `${Math.min(pullDistance * 0.8, 60)}px`
          }}
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <div className="w-8 h-8">
            <img 
              src="https://i.imgur.com/XuU1zUr.gif" 
              alt="Golf pull to refresh"
              className="w-full h-full object-contain"
            />
          </div>
        </motion.div>
      )}
      
      {isRefreshing && (
        <motion.div 
          className="fixed inset-0 flex items-center justify-center z-50 bg-background/90 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <GolfAnimationLoader />
        </motion.div>
      )}
      
      <main 
        ref={mainRef} 
        className="flex-1 overflow-y-auto"
        style={{
          WebkitOverflowScrolling: 'touch',
          position: 'relative',
          zIndex: 1,
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'calc(76px + env(safe-area-inset-bottom, 0px))'
        }}
      >
        <div className="w-full mx-auto animate-in min-h-full">
          <Outlet />
        </div>
      </main>
      <Navigation />
    </div>
  );
};
