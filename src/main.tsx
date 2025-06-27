
import { createRoot } from 'react-dom/client'
import { useState, useEffect } from 'react'
import App from './App.tsx'
import './index.css'
import AppLoadingScreen from './components/ui/AppLoadingScreen.tsx'

// Root component with improved loading state
const Root = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Preload key assets and resources with improved timing
    const preloadAssets = async () => {
      // Ensure a minimum display time for the loading animation
      const minDelay = new Promise(resolve => setTimeout(resolve, 2500));
      
      // Wait for initial page resources to load
      const pageLoaded = new Promise(resolve => {
        if (document.readyState === 'complete') {
          resolve(true);
        } else {
          window.addEventListener('load', () => resolve(true), { once: true });
          document.addEventListener('readystatechange', () => {
            if (document.readyState === 'complete') resolve(true);
          }, { once: true });
        }
      });
      
      // Wait for both minimum delay and page load
      await Promise.all([minDelay, pageLoaded]);
      
      // Add smooth transition
      setIsLoading(false);
    };
    
    preloadAssets();
  }, []);

  return (
    <div className="min-h-screen">
      {isLoading ? (
        <AppLoadingScreen />
      ) : (
        <div className="animate-fadeIn">
          <App />
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
