
import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";

export const Layout = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);

  // Pull-to-refresh functionality
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      setStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const currentY = e.touches[0].clientY;
      
      // If we're at the top of the page and pulling down
      if (scrollTop <= 0 && currentY - startY > 70 && !isRefreshing) {
        setIsRefreshing(true);
        e.preventDefault();
        
        // Simulate refresh after animation
        setTimeout(() => {
          window.location.reload();
        }, 800);
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [startY, isRefreshing]);

  // Add meta viewport tag to make the app display as a mobile app
  useEffect(() => {
    // Set the viewport meta tag to prevent scaling
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
      metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, minimal-ui, apple-mobile-web-app-capable=yes');
    }
    
    // Add apple-mobile-web-app-capable meta tag
    let metaAppleCapable = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
    if (!metaAppleCapable) {
      metaAppleCapable = document.createElement('meta');
      metaAppleCapable.setAttribute('name', 'apple-mobile-web-app-capable');
      metaAppleCapable.setAttribute('content', 'yes');
      document.head.appendChild(metaAppleCapable);
    }
    
    // Add apple-mobile-web-app-status-bar-style meta tag
    let metaStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!metaStatusBar) {
      metaStatusBar = document.createElement('meta');
      metaStatusBar.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
      metaStatusBar.setAttribute('content', 'black-translucent');
      document.head.appendChild(metaStatusBar);
    }

    // Set theme-color meta tag to match our primary color
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      metaThemeColor.setAttribute('content', '#2A4746');
      document.head.appendChild(metaThemeColor);
    }
    
    // Add fullscreen capabilities
    let metaFullscreen = document.querySelector('meta[name="mobile-web-app-capable"]');
    if (!metaFullscreen) {
      metaFullscreen = document.createElement('meta');
      metaFullscreen.setAttribute('name', 'mobile-web-app-capable');
      metaFullscreen.setAttribute('content', 'yes');
      document.head.appendChild(metaFullscreen);
    }
    
    // Prevent scrolling the body
    document.body.style.overflow = 'hidden';
    
    // Force fullscreen mode for iOS Safari
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
      {isRefreshing && (
        <div className="absolute top-0 left-0 w-full flex justify-center py-4 z-50 bg-background/80 backdrop-blur-sm">
          <div className="animate-spin">
            <Loader className="h-6 w-6 text-primary" />
          </div>
        </div>
      )}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="container max-w-lg mx-auto px-4 pt-4 animate-in">
          <Outlet />
        </div>
      </main>
      <Navigation />
    </div>
  );
};
