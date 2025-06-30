
import { createRoot } from 'react-dom/client'
import { useState, useEffect } from 'react'
import App from './App.tsx'
import './index.css'
import AppLoadingScreen from './components/ui/AppLoadingScreen.tsx'

// Root component with immediate green background
const Root = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Extremely fast loading with minimal delay
    const quickLoad = async () => {
      // Very short minimum delay - just enough for smooth animation
      const minDelay = new Promise(resolve => setTimeout(resolve, 600));
      
      // Quick DOM check
      const domReady = document.readyState !== 'loading' 
        ? Promise.resolve(true)
        : new Promise(resolve => {
            document.addEventListener('DOMContentLoaded', () => resolve(true), { once: true });
          });
      
      // Preload logo quickly
      const logoReady = new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(true);
        img.src = '/lovable-uploads/3dc401b2-fdd6-4815-a300-aa3c9b61ed9d.png';
        // Don't wait too long for the image
        setTimeout(() => resolve(true), 100);
      });
      
      // Wait for the shortest necessary time
      await Promise.all([minDelay, domReady, logoReady]);
      
      setIsLoading(false);
    };
    
    quickLoad();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#092820' }}>
      {isLoading ? (
        <AppLoadingScreen />
      ) : (
        <div className="animate-fadeIn" style={{ backgroundColor: 'white' }}>
          <App />
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
