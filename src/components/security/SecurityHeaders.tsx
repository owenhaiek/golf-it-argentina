
import { useEffect } from 'react';

export const SecurityHeaders = () => {
  useEffect(() => {
    // Add Content Security Policy meta tag
    const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!existingCSP) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.mapbox.com;
        style-src 'self' 'unsafe-inline' https://api.mapbox.com;
        img-src 'self' data: https: blob:;
        font-src 'self' data: https:;
        connect-src 'self' https://zlmotrppstqjnovpfgbd.supabase.co https://api.mapbox.com;
        frame-src 'none';
        object-src 'none';
        base-uri 'self';
        form-action 'self';
      `.replace(/\s+/g, ' ').trim();
      document.head.appendChild(meta);
    }

    // Add X-Frame-Options
    const existingXFrame = document.querySelector('meta[http-equiv="X-Frame-Options"]');
    if (!existingXFrame) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'X-Frame-Options';
      meta.content = 'DENY';
      document.head.appendChild(meta);
    }

    // Add X-Content-Type-Options
    const existingXContent = document.querySelector('meta[http-equiv="X-Content-Type-Options"]');
    if (!existingXContent) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'X-Content-Type-Options';
      meta.content = 'nosniff';
      document.head.appendChild(meta);
    }

    // Add Referrer Policy
    const existingReferrer = document.querySelector('meta[name="referrer"]');
    if (!existingReferrer) {
      const meta = document.createElement('meta');
      meta.name = 'referrer';
      meta.content = 'strict-origin-when-cross-origin';
      document.head.appendChild(meta);
    }
  }, []);

  return null;
};
