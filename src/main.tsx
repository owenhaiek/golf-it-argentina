import { createRoot } from 'react-dom/client'
import { useState, useEffect } from 'react'
import App from './App.tsx'
import './index.css'
import AppLoadingScreen from './components/ui/AppLoadingScreen.tsx'

// Initialize dark mode immediately before React renders
if (typeof window !== 'undefined') {
  document.documentElement.classList.add("dark");
}

// Root component with immediate green background
const Root = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ultra-fast loading - only wait for essential readiness
    const init = () => {
      // Use requestIdleCallback for non-critical work, or fallback to rAF
      const scheduleEnd = window.requestIdleCallback || requestAnimationFrame;
      
      // Minimum 300ms to show branding, but don't block longer
      const minTime = 300;
      const start = Date.now();
      
      scheduleEnd(() => {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, minTime - elapsed);
        setTimeout(() => setIsLoading(false), remaining);
      });
    };
    
    if (document.readyState === 'complete') {
      init();
    } else {
      window.addEventListener('load', init, { once: true });
    }
  }, []);

  if (isLoading) {
    return <AppLoadingScreen />;
  }

  return <App />;
}

createRoot(document.getElementById("root")!).render(<Root />);
