
import { createRoot } from 'react-dom/client'
import { useState, useEffect } from 'react'
import App from './App.tsx'
import './index.css'
import AppLoadingScreen from './components/ui/AppLoadingScreen.tsx'

// Root component with optimized loading state
const Root = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Optimized preload assets with faster loading
    const preloadAssets = async () => {
      // Reduced minimum delay for faster perceived loading
      const minDelay = new Promise(resolve => setTimeout(resolve, 1500));
      
      // Wait for DOM content to be loaded (faster than full page load)
      const domLoaded = new Promise(resolve => {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => resolve(true), { once: true });
        } else {
          resolve(true);
        }
      });
      
      // Check if critical resources are available
      const criticalResourcesReady = new Promise(resolve => {
        // Check if the app logo is accessible
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(true); // Continue even if image fails
        img.src = '/lovable-uploads/3dc401b2-fdd6-4815-a300-aa3c9b61ed9d.png';
      });
      
      // Wait for DOM and critical resources, with minimum delay
      await Promise.all([minDelay, domLoaded, criticalResourcesReady]);
      
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
