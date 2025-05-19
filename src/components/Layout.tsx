
import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";
import { useEffect, useState, useRef } from "react";
import { GolfLoader } from "./ui/GolfLoader";
import { motion } from "framer-motion";

export const Layout = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // Add app height variable to fix mobile viewport issues
  useEffect(() => {
    const setAppHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    
    // Set initial height
    setAppHeight();
    
    // Update height on resize
    window.addEventListener('resize', setAppHeight);
    
    // Update height on orientation change
    window.addEventListener('orientationchange', setAppHeight);
    
    // Add iOS specific meta tags for fullscreen
    const meta = document.querySelector('meta[name="viewport"]');
    if (meta) {
      meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, minimal-ui, standalone');
    }
    
    // Add meta tag for status bar appearance
    const statusBarMeta = document.createElement('meta');
    statusBarMeta.name = 'apple-mobile-web-app-status-bar-style';
    statusBarMeta.content = 'black-translucent';
    document.head.appendChild(statusBarMeta);
    
    // Add meta tag for standalone mode
    const appMeta = document.createElement('meta');
    appMeta.name = 'apple-mobile-web-app-capable';
    appMeta.content = 'yes';
    document.head.appendChild(appMeta);
    
    // Clean up on component unmount
    return () => {
      window.removeEventListener('resize', setAppHeight);
      window.removeEventListener('orientationchange', setAppHeight);
      if (meta) {
        meta.setAttribute('content', 'width=device-width, initial-scale=1');
      }
      document.head.removeChild(statusBarMeta);
      document.head.removeChild(appMeta);
    };
  }, []);

  // Improved pull-to-refresh functionality with smoother animation
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Only start pull tracking if we're at the top of the page
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
        // Use square root for more natural feeling resistance
        const newPullDistance = Math.sqrt(Math.max(0, currentY - startY) * 8);
        
        setPullDistance(newPullDistance);
        
        if (newPullDistance > 10) {
          e.preventDefault();
        }
        
        // Lower threshold for refresh (100 instead of 120)
        if (newPullDistance > 100 && !isRefreshing) {
          // Add haptic feedback if available
          if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(50);
          }
          
          setIsRefreshing(true);
          // Shorter delay for reload (300ms feels more responsive)
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

      return () => {
        mainElement.removeEventListener('touchstart', handleTouchStart);
        mainElement.removeEventListener('touchmove', handleTouchMove);
        mainElement.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [startY, isPulling, pullDistance, isRefreshing]);

  return (
    <div className="fixed inset-0 flex flex-col bg-background" style={{ height: 'var(--app-height, 100%)' }}>
      {/* Improved pull indicator */}
      {pullDistance > 0 && !isRefreshing && (
        <motion.div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center z-40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: Math.min(pullDistance / 100, 0.7),
            height: `${Math.min(pullDistance * 0.6, 50)}px`
          }}
        >
          <div className="w-5 h-5 rounded-full border-2 border-primary/40 border-t-transparent animate-spin" />
        </motion.div>
      )}
      
      {/* Enhanced refreshing overlay */}
      {isRefreshing && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 bg-background/70 backdrop-blur-sm"
          style={{
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <GolfLoader />
        </div>
      )}
      
      <main 
        ref={mainRef} 
        className="flex-1 overflow-y-auto pb-20 hide-scrollbar pt-safe"
        style={{
          height: '100%',
          WebkitOverflowScrolling: 'touch',
          position: 'relative',
          zIndex: 1,
          paddingTop: 'env(safe-area-inset-top, 16px)'
        }}
      >
        <div className="container max-w-md mx-auto px-4 pt-4 pb-4 animate-in">
          <Outlet />
        </div>
      </main>
      <Navigation />
    </div>
  );
};
