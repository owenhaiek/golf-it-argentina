
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

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

createRoot(document.getElementById("root")!).render(<App />);
