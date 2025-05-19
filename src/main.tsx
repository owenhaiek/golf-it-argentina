
import { createRoot } from 'react-dom/client'
import { useState, useEffect } from 'react'
import App from './App.tsx'
import './index.css'
import GolfBallLoader from './components/ui/GolfBallLoader.tsx'

// Add viewport meta for hiding browser UI
const metaViewport = document.createElement('meta');
metaViewport.name = 'viewport';
metaViewport.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui, viewport-fit=cover';
document.head.appendChild(metaViewport);

// Add apple-mobile-web-app-capable meta for iOS
const appleMeta = document.createElement('meta');
appleMeta.name = 'apple-mobile-web-app-capable';
appleMeta.content = 'yes';
document.head.appendChild(appleMeta);

// Add apple-mobile-web-app-status-bar-style meta for iOS
const statusBarMeta = document.createElement('meta');
statusBarMeta.name = 'apple-mobile-web-app-status-bar-style';
statusBarMeta.content = 'black-translucent';
document.head.appendChild(statusBarMeta);

// Add mobile-web-app-capable meta for Android
const androidMeta = document.createElement('meta');
androidMeta.name = 'mobile-web-app-capable';
androidMeta.content = 'yes';
document.head.appendChild(androidMeta);

// Root component with loading state
const Root = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular un tiempo de carga mínimo para mostrar la animación
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
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
