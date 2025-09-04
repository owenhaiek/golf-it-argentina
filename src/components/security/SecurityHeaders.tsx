
import { useEffect } from 'react';

export const SecurityHeaders = () => {
  useEffect(() => {
    // Add Content Security Policy meta tag with enhanced security
    const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!existingCSP) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = `
        default-src 'self';
        script-src 'self' https://api.mapbox.com https://maps.googleapis.com https://accounts.google.com;
        style-src 'self' https://api.mapbox.com https://fonts.googleapis.com;
        img-src 'self' data: https: blob:;
        font-src 'self' data: https: https://fonts.gstatic.com;
        connect-src 'self' https://zlmotrppstqjnovpfgbd.supabase.co https://api.mapbox.com wss://zlmotrppstqjnovpfgbd.supabase.co https://accounts.google.com;
        frame-src 'self' https://accounts.google.com;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        upgrade-insecure-requests;
      `.replace(/\s+/g, ' ').trim();
      document.head.appendChild(meta);
    }

    // Add X-Frame-Options (SAMEORIGIN is better than DENY for OAuth)
    const existingXFrame = document.querySelector('meta[http-equiv="X-Frame-Options"]');
    if (!existingXFrame) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'X-Frame-Options';
      meta.content = 'SAMEORIGIN';
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

    // Add X-XSS-Protection
    const existingXXSS = document.querySelector('meta[http-equiv="X-XSS-Protection"]');
    if (!existingXXSS) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'X-XSS-Protection';
      meta.content = '1; mode=block';
      document.head.appendChild(meta);
    }

    // Add Referrer Policy
    const existingReferrer = document.querySelector('meta[http-equiv="Referrer-Policy"]');
    if (!existingReferrer) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Referrer-Policy';
      meta.content = 'strict-origin-when-cross-origin';
      document.head.appendChild(meta);
    }

    // Add Permissions Policy
    const existingPermissions = document.querySelector('meta[http-equiv="Permissions-Policy"]');
    if (!existingPermissions) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Permissions-Policy';
      meta.content = 'geolocation=(), microphone=(), camera=(), payment=(), usb=()';
      document.head.appendChild(meta);
    }

    // Add Strict-Transport-Security (for HTTPS)
    const existingHSTS = document.querySelector('meta[http-equiv="Strict-Transport-Security"]');
    if (!existingHSTS) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Strict-Transport-Security';
      meta.content = 'max-age=31536000; includeSubDomains; preload';
      document.head.appendChild(meta);
    }
  }, []);

  return null;
};
