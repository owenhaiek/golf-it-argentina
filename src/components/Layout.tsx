
import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";
import { useEffect } from "react";

export const Layout = () => {
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
    
    // Prevent scrolling the body
    document.body.style.overflow = 'hidden';
    
    // Force fullscreen mode for iOS Safari
    if (navigator.standalone === false) {
      // Add a visual indicator for "Add to Home Screen"
      const appHeight = () => {
        document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
      };
      window.addEventListener('resize', appHeight);
      appHeight();
    }
    
    return () => {
      // Cleanup if needed
      document.body.style.overflow = '';
      window.removeEventListener('resize', () => {});
    };
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col bg-muted">
      <main className="flex-1 overflow-y-auto pb-16">
        <div className="container max-w-lg mx-auto px-4 pt-4 animate-in">
          <Outlet />
        </div>
      </main>
      <Navigation />
    </div>
  );
};
