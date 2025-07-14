
import { useEffect, useRef } from "react";

export const useFilterPanelScrollPrevention = (isOpen: boolean) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      const body = document.body;
      const html = document.documentElement;
      
      // Store original styles
      const originalBodyOverflow = body.style.overflow;
      const originalBodyPosition = body.style.position;
      const originalBodyTop = body.style.top;
      const originalBodyWidth = body.style.width;
      const originalBodyHeight = body.style.height;
      const originalHtmlOverflow = html.style.overflow;
      
      // Apply comprehensive scroll prevention
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.width = '100%';
      body.style.height = '100vh';
      html.style.overflow = 'hidden';
      
      // Also prevent scrolling on the main content area
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.style.overflow = 'hidden';
        mainContent.style.height = '100vh';
      }
      
      // Prevent all touch and scroll events on background, but allow navigation interaction
      const preventTouch = (e: TouchEvent) => {
        const target = e.target as Element;
        const navigation = document.querySelector('nav');
        const navigationButtons = navigation?.querySelectorAll('a, button');
        
        // Allow touch events on navigation and filter panel
        if (panelRef.current?.contains(target) || 
            navigation?.contains(target) ||
            Array.from(navigationButtons || []).some(btn => btn.contains(target))) {
          return;
        }
        
        e.preventDefault();
        e.stopPropagation();
      };
      
      const preventWheel = (e: WheelEvent) => {
        if (!panelRef.current?.contains(e.target as Node)) {
          e.preventDefault();
          e.stopPropagation();
        }
      };
      
      const preventScroll = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
      };
      
      // Add event listeners with capture
      document.addEventListener('touchstart', preventTouch, { passive: false, capture: true });
      document.addEventListener('touchmove', preventTouch, { passive: false, capture: true });
      document.addEventListener('touchend', preventTouch, { passive: false, capture: true });
      document.addEventListener('wheel', preventWheel, { passive: false, capture: true });
      document.addEventListener('scroll', preventScroll, { passive: false, capture: true });
      window.addEventListener('scroll', preventScroll, { passive: false, capture: true });
      
      return () => {
        // Restore main content styles
        const mainContent = document.querySelector('main');
        if (mainContent) {
          mainContent.style.overflow = '';
          mainContent.style.height = '';
        }
        
        // Restore original styles
        body.style.overflow = originalBodyOverflow;
        body.style.position = originalBodyPosition;
        body.style.top = originalBodyTop;
        body.style.width = originalBodyWidth;
        body.style.height = originalBodyHeight;
        html.style.overflow = originalHtmlOverflow;
        
        // Remove event listeners
        document.removeEventListener('touchstart', preventTouch, { capture: true });
        document.removeEventListener('touchmove', preventTouch, { capture: true });
        document.removeEventListener('touchend', preventTouch, { capture: true });
        document.removeEventListener('wheel', preventWheel, { capture: true });
        document.removeEventListener('scroll', preventScroll, { capture: true });
        window.removeEventListener('scroll', preventScroll, { capture: true });
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  return panelRef;
};
