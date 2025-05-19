
import { createRoot } from 'react-dom/client'
import { useState, useEffect } from 'react'
import App from './App.tsx'
import './index.css'
import GolfBallLoader from './components/ui/GolfBallLoader.tsx'

// Root component with improved loading state
const Root = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Preload key assets and resources with improved timing
    const preloadAssets = async () => {
      // Ensure a minimum display time for the loading animation (reduced from 2.5s to 2.2s for better UX)
      const minDelay = new Promise(resolve => setTimeout(resolve, 2200));
      
      // Wait for initial page resources to load - improved with readyState detection
      const pageLoaded = new Promise(resolve => {
        // Check if already loaded
        if (document.readyState === 'complete') {
          resolve(true);
        } else {
          // Set up two event listeners for better reliability
          window.addEventListener('load', () => resolve(true), { once: true });
          document.addEventListener('readystatechange', () => {
            if (document.readyState === 'complete') resolve(true);
          }, { once: true });
        }
      });
      
      // Wait for both minimum delay and page load
      await Promise.all([minDelay, pageLoaded]);
      
      // Add a smooth fade-out effect
      document.body.classList.add('transition-opacity');
      setIsLoading(false);
    };
    
    preloadAssets();
  }, []);

  // Improved transition between loader and app
  return (
    <div className="min-h-screen">
      {isLoading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-background z-50 transition-opacity duration-300">
          <GolfBallLoader />
        </div>
      ) : (
        <div className="animate-fadeIn">
          <App />
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
