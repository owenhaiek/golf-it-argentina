
import { Outlet, useLocation } from "react-router-dom";
import { Navigation } from "./Navigation";
import { useState, useRef, useEffect } from "react";
import GolfAnimationLoader from "./ui/GolfAnimationLoader";
import { motion } from "framer-motion";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";

export const Layout = () => {
  const mainRef = useRef<HTMLElement>(null);
  const navigationRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const {
    isRefreshing,
    pullDistance,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  } = usePullToRefresh({
    disabled: location.pathname === '/courses-map'
  });

  // Scroll to top when route changes
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname]);

  // Set up event listeners
  useEffect(() => {
    const mainElement = mainRef.current;
    if (!mainElement) return;

    const wrappedTouchStart = (e: TouchEvent) => {
      // Check if touch started on navigation area
      const navigation = navigationRef.current;
      if (navigation && navigation.contains(e.target as Node)) {
        return;
      }
      handleTouchStart(e, mainElement);
    };

    const wrappedTouchMove = (e: TouchEvent) => {
      // Check if touch is on navigation area
      const navigation = navigationRef.current;
      if (navigation && navigation.contains(e.target as Node)) {
        return;
      }
      handleTouchMove(e, mainElement);
    };

    mainElement.addEventListener('touchstart', wrappedTouchStart, { passive: true });
    mainElement.addEventListener('touchmove', wrappedTouchMove, { passive: false });
    mainElement.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      mainElement.removeEventListener('touchstart', wrappedTouchStart);
      mainElement.removeEventListener('touchmove', wrappedTouchMove);
      mainElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div className="fixed inset-0 flex flex-col bg-background h-screen w-screen overflow-hidden">
      {pullDistance > 0 && !isRefreshing && location.pathname !== '/courses-map' && (
        <motion.div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center z-40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: Math.min(pullDistance / 100, 0.8),
            height: `${Math.min(pullDistance * 0.8, 60)}px`
          }}
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <div className="w-12 h-12">
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
        className="flex-1 w-full overflow-y-auto overflow-x-hidden overscroll-behavior-none bg-background"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
          position: 'relative',
          zIndex: 1,
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: '76px',
          minHeight: '100dvh'
        }}
      >
        <div className="w-full mx-auto animate-in min-h-full bg-background">
          <Outlet />
        </div>
      </main>
      <div 
        ref={navigationRef} 
        className="navigation-container mobile-navigation-fix"
        style={{
          paddingBottom: '0px'
        }}
      >
        <Navigation />
      </div>
    </div>
  );
};
