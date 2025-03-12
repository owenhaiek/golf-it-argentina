
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

  // Improved pull-to-refresh functionality
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Only start pull tracking if we're at the top of the page
      if (mainRef.current && mainRef.current.scrollTop <= 5) {
        setStartY(e.touches[0].clientY);
        setIsPulling(true);
        setPullDistance(0);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return;
      
      // Only activate pull if we're at the top of the page
      if (mainRef.current && mainRef.current.scrollTop <= 5) {
        const currentY = e.touches[0].clientY;
        
        // Only count pulling down (not up)
        if (currentY > startY) {
          const newPullDistance = currentY - startY;
          setPullDistance(newPullDistance);
          
          // Prevent default scrolling behavior when pulling down
          if (newPullDistance > 10) {
            e.preventDefault();
          }
          
          // If we've pulled down far enough, trigger refresh
          if (newPullDistance > 120 && !isRefreshing) {
            setIsRefreshing(true);
            
            // Simulate refresh after animation
            setTimeout(() => {
              window.location.reload();
            }, 1200);
          }
        }
      } else {
        // If we've scrolled away from the top, cancel pulling
        setIsPulling(false);
        setPullDistance(0);
      }
    };
    
    const handleTouchEnd = () => {
      setIsPulling(false);
      setPullDistance(0);
      
      // If we didn't pull far enough for a refresh, reset
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

  // Enhanced fullscreen and mobile app experience
  useEffect(() => {
    // Set the viewport meta tag for optimal mobile display
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
      metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, minimal-ui, apple-mobile-web-app-capable=yes');
    }
    
    // Add apple-mobile-web-app-capable meta tag for iOS fullscreen
    let metaAppleCapable = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
    if (!metaAppleCapable) {
      metaAppleCapable = document.createElement('meta');
      metaAppleCapable.setAttribute('name', 'apple-mobile-web-app-capable');
      metaAppleCapable.setAttribute('content', 'yes');
      document.head.appendChild(metaAppleCapable);
    }
    
    // Add apple-mobile-web-app-status-bar-style for iOS status bar
    let metaStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!metaStatusBar) {
      metaStatusBar = document.createElement('meta');
      metaStatusBar.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
      metaStatusBar.setAttribute('content', 'black-translucent');
      document.head.appendChild(metaStatusBar);
    }

    // Set theme-color for Android
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      metaThemeColor.setAttribute('content', '#2A4746');
      document.head.appendChild(metaThemeColor);
    }
    
    // Add fullscreen capabilities for Android
    let metaFullscreen = document.querySelector('meta[name="mobile-web-app-capable"]');
    if (!metaFullscreen) {
      metaFullscreen = document.createElement('meta');
      metaFullscreen.setAttribute('name', 'mobile-web-app-capable');
      metaFullscreen.setAttribute('content', 'yes');
      document.head.appendChild(metaFullscreen);
    }
    
    // Prevent document body scrolling for better fullscreen experience
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    
    // Force proper height calculation for iOS Safari
    const isInStandaloneMode = () => 
      window.matchMedia('(display-mode: standalone)').matches || 
      ('standalone' in window.navigator && (window.navigator as any).standalone === true);
      
    if (!isInStandaloneMode()) {
      const setAppHeight = () => {
        document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
      };
      window.addEventListener('resize', setAppHeight);
      setAppHeight();

      return () => {
        window.removeEventListener('resize', setAppHeight);
      };
    }
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col bg-muted">
      {pullDistance > 0 && !isRefreshing && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center z-40 pointer-events-none"
          style={{ 
            height: `${Math.min(pullDistance, 120)}px`,
            opacity: pullDistance / 120
          }}
        >
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      )}
      
      {isRefreshing && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/60 backdrop-blur-sm transition-all duration-300">
          <div className="p-10 rounded-2xl shadow-lg bg-background/95 border border-primary/5">
            <GolfLoader />
          </div>
        </div>
      )}
      <main ref={mainRef} className="flex-1 overflow-y-auto pb-24 hide-scrollbar">
        <div className="container max-w-md mx-auto px-4 pt-6 animate-in">
          <Outlet />
        </div>
      </main>
      <Navigation />
    </div>
  );
};
