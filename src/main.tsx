import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize dark mode immediately before React renders
if (typeof window !== 'undefined') {
  document.documentElement.classList.add("dark");
  
  // Remove initial loader once React is ready
  const removeLoader = () => {
    const loader = document.getElementById('initial-loader');
    if (loader) {
      loader.style.opacity = '0';
      loader.style.transition = 'opacity 0.2s ease-out';
      setTimeout(() => loader.remove(), 200);
    }
  };
  
  // Remove loader after a small delay to ensure smooth transition
  requestAnimationFrame(() => {
    requestAnimationFrame(removeLoader);
  });
}

createRoot(document.getElementById("root")!).render(<App />);
