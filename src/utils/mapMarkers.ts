import { hapticMedium } from '@/hooks/useDespiaNative';

interface GolfCourse {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
}

let activeMarkerId: string | null = null;

// Inject global styles once - Pin-shaped markers with premium feel
const injectMarkerStyles = () => {
  if (document.getElementById('golf-marker-styles-v17')) return;
  
  // Remove old styles
  const oldStyles = Array.from({ length: 10 }, (_, i) => `golf-marker-styles-v${i + 8}`);
  oldStyles.forEach(id => {
    const oldStyle = document.getElementById(id);
    if (oldStyle) oldStyle.remove();
  });
  
  const style = document.createElement('style');
  style.id = 'golf-marker-styles-v17';
  style.textContent = `
    @keyframes markerPulse {
      0%, 100% { 
        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5);
      }
      50% { 
        box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
      }
    }
    
    .golf-pin-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      /* No transforms on container - let Mapbox handle positioning */
    }
    
    .golf-pin-head {
      width: 40px;
      height: 40px;
      border-radius: 50% 50% 50% 0;
      background: linear-gradient(145deg, #0d3429, #071d17);
      border: 2.5px solid rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      transform: rotate(-45deg);
      transform-origin: center center;
      box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.4),
        0 2px 4px rgba(0, 0, 0, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      transition: 
        box-shadow 0.2s ease,
        border-color 0.2s ease,
        background 0.2s ease;
      position: relative;
      z-index: 2;
    }
    
    .golf-pin-head:hover {
      box-shadow: 
        0 6px 16px rgba(0, 0, 0, 0.45),
        0 3px 6px rgba(0, 0, 0, 0.25),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 1);
    }
    
    .golf-pin-icon {
      width: 18px;
      height: 18px;
      color: white;
      transform: rotate(45deg);
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
      transition: color 0.2s ease, filter 0.2s ease;
    }
    
    .golf-pin-tail {
      width: 3px;
      height: 12px;
      background: linear-gradient(to bottom, #0a2820, #052018);
      margin-top: -2px;
      border-radius: 0 0 2px 2px;
      z-index: 1;
    }
    
    .golf-pin-shadow {
      width: 16px;
      height: 6px;
      background: radial-gradient(ellipse, rgba(0, 0, 0, 0.3) 0%, transparent 70%);
      margin-top: 2px;
      border-radius: 50%;
    }
    
    .golf-pin-container.active .golf-pin-head {
      background: linear-gradient(145deg, #14532d, #0d3429);
      border: 3px solid #22c55e;
      box-shadow: 
        0 0 0 4px rgba(34, 197, 94, 0.25),
        0 6px 20px rgba(34, 197, 94, 0.35),
        0 3px 6px rgba(0, 0, 0, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      animation: markerPulse 2s ease-in-out infinite;
    }
    
    .golf-pin-container.active .golf-pin-icon {
      color: #4ade80;
      filter: drop-shadow(0 0 4px rgba(74, 222, 128, 0.5));
    }
    
    .golf-pin-container.active .golf-pin-tail {
      background: linear-gradient(to bottom, #14532d, #0d3429);
    }
    
    .mapboxgl-marker:has(.golf-pin-container.active) {
      z-index: 100 !important;
    }
  `;
  document.head.appendChild(style);
};

export const createMarkerElement = (course: GolfCourse, onCourseSelect: (course: GolfCourse) => void) => {
  injectMarkerStyles();
  
  // Create pin container
  const container = document.createElement("div");
  container.className = 'golf-pin-container';
  container.dataset.courseId = course.id;
  
  // Pin head (rotated teardrop shape)
  const head = document.createElement("div");
  head.className = 'golf-pin-head';
  
  // Golf flag icon inside the head
  head.innerHTML = `
    <svg class="golf-pin-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
      <line x1="4" x2="4" y1="22" y2="15"/>
    </svg>
  `;
  
  // Pin tail
  const tail = document.createElement("div");
  tail.className = 'golf-pin-tail';
  
  // Pin shadow
  const shadow = document.createElement("div");
  shadow.className = 'golf-pin-shadow';
  
  container.appendChild(head);
  container.appendChild(tail);
  container.appendChild(shadow);

  // Click handler
  container.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Trigger haptic feedback on mobile
    hapticMedium();
    
    // Remove active from previous
    if (activeMarkerId) {
      const prevActive = document.querySelector(`.golf-pin-container[data-course-id="${activeMarkerId}"]`);
      if (prevActive) prevActive.classList.remove('active');
    }
    
    // Set this as active
    container.classList.add('active');
    activeMarkerId = course.id;
    
    onCourseSelect(course);
  });

  return container;
};

export const setActiveMarker = (courseId: string | null) => {
  // Remove previous active
  if (activeMarkerId) {
    const prevActive = document.querySelector(`.golf-pin-container[data-course-id="${activeMarkerId}"]`);
    if (prevActive) prevActive.classList.remove('active');
  }
  
  // Set new active
  if (courseId) {
    const newActive = document.querySelector(`.golf-pin-container[data-course-id="${courseId}"]`);
    if (newActive) newActive.classList.add('active');
  }
  
  activeMarkerId = courseId;
};

export const resetMarkerIndex = () => {
  // No longer needed but kept for compatibility
};

export const resetActiveMarker = () => {
  if (activeMarkerId) {
    const prevActive = document.querySelector(`.golf-pin-container[data-course-id="${activeMarkerId}"]`);
    if (prevActive) prevActive.classList.remove('active');
  }
  activeMarkerId = null;
};

export const validateCoordinates = (latitude?: number, longitude?: number): boolean => {
  const lat = Number(latitude);
  const lng = Number(longitude);
  
  if (!latitude || !longitude || isNaN(lat) || isNaN(lng)) {
    return false;
  }
  
  // Validate Argentina coordinates
  const isValidLat = lat >= -55 && lat <= -21;
  const isValidLng = lng >= -74 && lng <= -53;
  
  return isValidLat && isValidLng;
};
