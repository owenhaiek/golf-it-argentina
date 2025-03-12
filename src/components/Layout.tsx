
import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";
import { useEffect, useState, useRef } from "react";
import { GolfLoader } from "./ui/GolfLoader";

export const Layout = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Function to hide browser navigation bar on mobile
    const hideBrowserBar = () => {
      // Hide URL bar in mobile browsers
      if (typeof window !== 'undefined') {
        // Force screen redraw to hide browser UI
        window.scrollTo(0, 1);
        
        // Add a second attempt with slight delay for better compatibility
        setTimeout(() => {
          window.scrollTo(0, 1);
        }, 150);
        
        // Final attempt
        setTimeout(() => {
          window.scrollTo(0, window.innerHeight > window.outerHeight ? 1 : 0);
        }, 300);
      }
    };

    // Set the correct height for mobile browsers
    const setAppHeight = () => {
      const doc = document.documentElement;
      doc.style.setProperty('--app-height', `${window.innerHeight}px`);
    };

    // Call on load, resize and orientation change
    window.addEventListener('load', hideBrowserBar);
    window.addEventListener('resize', hideBrowserBar);
    window.addEventListener('orientationchange', hideBrowserBar);
    window.addEventListener('touchmove', hideBrowserBar);
    window.addEventListener('scroll', hideBrowserBar);
    
    // Add visual viewport events for iOS 15+
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', setAppHeight);
    }
    
    // Run height calculations
    setAppHeight();
    window.addEventListener('resize', setAppHeight);
    
    // Initial hide
    hideBrowserBar();
    
    return () => {
      window.removeEventListener('load', hideBrowserBar);
      window.removeEventListener('resize', hideBrowserBar);
      window.removeEventListener('orientationchange', hideBrowserBar);
      window.removeEventListener('touchmove', hideBrowserBar);
      window.removeEventListener('scroll', hideBrowserBar);
      window.removeEventListener('resize', setAppHeight);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', setAppHeight);
      }
    };
  }, []);

  // Improved pull-to-refresh functionality
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
        const newPullDistance = Math.max(0, currentY - startY);
        
        setPullDistance(newPullDistance);
        
        if (newPullDistance > 10) {
          e.preventDefault();
        }
        
        if (newPullDistance > 120 && !isRefreshing) {
          setIsRefreshing(true);
          setTimeout(() => {
            window.location.reload();
          }, 400);
        }
      } else {
        setIsPulling(false);
        setPullDistance(0);
      }
    };
    
    const handleTouchEnd = () => {
      setIsPulling(false);
      setPullDistance(0);
      
      if (pullDistance < 120) {
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
    <div className="fixed inset-0 flex flex-col bg-background" style={{ height: 'var(--app-height)' }}>
      {pullDistance > 0 && !isRefreshing && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center z-40 pointer-events-none"
          style={{ 
            height: `${Math.min(pullDistance * 0.5, 40)}px`,
            opacity: Math.min(pullDistance / 120, 0.4)
          }}
        >
          <div className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-transparent animate-spin" />
        </div>
      )}
      
      {isRefreshing && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/20 backdrop-blur-[1px]">
          <GolfLoader />
        </div>
      )}
      
      <main 
        ref={mainRef} 
        className="flex-1 overflow-y-auto pb-20 hide-scrollbar"
        style={{
          height: '100%',
          WebkitOverflowScrolling: 'touch',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div className="container max-w-md mx-auto px-4 pt-6 animate-in">
          <Outlet />
        </div>
      </main>
      <Navigation />
    </div>
  );
};
