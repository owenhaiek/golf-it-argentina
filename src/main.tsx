
import { createRoot } from 'react-dom/client'
import { useState, useEffect } from 'react'
import App from './App.tsx'
import './index.css'
import GolfBallLoader from './components/ui/GolfBallLoader.tsx'

// Optimized Root component with high-performance loading state
const Root = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Preload key assets and resources with optimized timing
    const preloadAssets = async () => {
      // Use a shorter minimum delay for better perceived performance
      const minDelay = new Promise(resolve => setTimeout(resolve, 1800));
      
      // Wait for initial page resources to load with better readyState detection
      const pageLoaded = new Promise(resolve => {
        // Check if already loaded
        if (document.readyState === 'complete') {
          resolve(true);
        } else {
          // Set up event listeners with improved performance
          const handleLoad = () => {
            window.removeEventListener('load', handleLoad);
            resolve(true);
          };
          
          const handleReadyState = () => {
            if (document.readyState === 'complete') {
              document.removeEventListener('readystatechange', handleReadyState);
              resolve(true);
            }
          };
          
          window.addEventListener('load', handleLoad);
          document.addEventListener('readystatechange', handleReadyState);
        }
      });
      
      // Wait for both minimum delay and page load
      await Promise.all([minDelay, pageLoaded]);
      
      // Add a smooth fade-out effect
      document.body.classList.add('transition-opacity');
      setIsLoading(false);
    };
    
    preloadAssets();
    
    // Set viewport meta tag to hide browser UI on mobile
    const meta = document.querySelector('meta[name="viewport"]');
    if (meta) {
      meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, minimal-ui, standalone');
    }
    
    // Add meta tag for mobile web app display
    const metaApple = document.createElement('meta');
    metaApple.setAttribute('name', 'apple-mobile-web-app-capable');
    metaApple.setAttribute('content', 'yes');
    document.head.appendChild(metaApple);
    
    const metaTheme = document.createElement('meta');
    metaTheme.setAttribute('name', 'theme-color');
    metaTheme.setAttribute('content', '#ffffff');
    document.head.appendChild(metaTheme);
    
    return () => {
      if (meta) {
        meta.setAttribute('content', 'width=device-width, initial-scale=1');
      }
    };
  }, []);

  // Improved transition between loader and app with hardware acceleration
  return (
    <div className="min-h-screen will-change-transform">
      {isLoading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-background z-50 transition-opacity duration-300 will-change-opacity">
          <GolfBallLoader />
        </div>
      ) : (
        <div className="animate-fadeIn will-change-transform">
          <App />
        </div>
      )}
    </div>
  );
}

// Use a try-catch block to avoid multiple root errors that can cause stutter
try {
  const rootElement = document.getElementById("root");
  
  // Ensure we don't create multiple roots
  if (!rootElement.hasAttribute('data-reactroot')) {
    rootElement.setAttribute('data-reactroot', 'true');
    const root = createRoot(rootElement);
    root.render(<Root />);
  }
} catch (error) {
  console.error("Error rendering app:", error);
}
