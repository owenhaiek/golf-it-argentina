
import { createRoot } from 'react-dom/client'
import { useState, useEffect } from 'react'
import App from './App.tsx'
import './index.css'
import GolfBallLoader from './components/ui/GolfBallLoader.tsx'

// Root component with loading state
const Root = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Preload key assets and resources
    const preloadAssets = async () => {
      // Ensure a minimum display time for the loading animation
      const minDelay = new Promise(resolve => setTimeout(resolve, 2500));
      
      // Wait for initial page resources to load
      const pageLoaded = new Promise(resolve => {
        if (document.readyState === 'complete') {
          resolve(true);
        } else {
          window.addEventListener('load', () => resolve(true), { once: true });
        }
      });
      
      // Wait for both minimum delay and page load
      await Promise.all([minDelay, pageLoaded]);
      setIsLoading(false);
    };
    
    preloadAssets();
  }, []);

  return (
    <div className="min-h-screen">
      {isLoading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
          <GolfBallLoader />
        </div>
      ) : (
        <App />
      )}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
