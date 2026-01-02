import { hapticMedium } from '@/hooks/useDespiaNative';

interface GolfCourse {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
}

let activeMarkerId: string | null = null;

// Inject global styles once - Modern, animated markers with premium feel
const injectMarkerStyles = () => {
  if (document.getElementById('golf-marker-styles-v16')) return;
  
  // Remove old styles
  const oldStyles = ['golf-marker-styles-v8', 'golf-marker-styles-v9', 'golf-marker-styles-v10', 'golf-marker-styles-v11', 'golf-marker-styles-v12', 'golf-marker-styles-v13', 'golf-marker-styles-v14', 'golf-marker-styles-v15'];
  oldStyles.forEach(id => {
    const oldStyle = document.getElementById(id);
    if (oldStyle) oldStyle.remove();
  });
  
  const style = document.createElement('style');
  style.id = 'golf-marker-styles-v16';
  style.textContent = `
    @keyframes markerPulse {
      0%, 100% { 
        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
      }
      50% { 
        box-shadow: 0 0 0 12px rgba(34, 197, 94, 0);
      }
    }
    
    @keyframes markerBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
    
    @keyframes iconFloat {
      0%, 100% { transform: rotate(-5deg) scale(1); }
      50% { transform: rotate(5deg) scale(1.05); }
    }
    
    .golf-marker-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .golf-marker-pin {
      position: absolute;
      bottom: -8px;
      width: 3px;
      height: 12px;
      background: linear-gradient(to bottom, #0a2820, #052018);
      border-radius: 0 0 2px 2px;
      opacity: 0.8;
    }
    
    .golf-marker {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(145deg, #0d3429, #071d17);
      border: 2.5px solid rgba(255, 255, 255, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.3),
        0 2px 4px rgba(0, 0, 0, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      transition: 
        transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
        box-shadow 0.25s ease,
        border-color 0.25s ease;
      position: relative;
      z-index: 1;
    }
    
    .golf-marker::before {
      content: '';
      position: absolute;
      inset: -3px;
      border-radius: 50%;
      background: transparent;
      transition: background 0.3s ease;
    }
    
    .golf-marker:hover {
      transform: scale(1.12);
      box-shadow: 
        0 8px 20px rgba(0, 0, 0, 0.35),
        0 4px 8px rgba(0, 0, 0, 0.25),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 1);
    }
    
    .golf-marker:hover .marker-icon {
      animation: iconFloat 0.6s ease-in-out;
    }
    
    .golf-marker:active {
      transform: scale(0.95);
      transition: transform 0.1s ease;
    }
    
    .golf-marker.active {
      background: linear-gradient(145deg, #14532d, #0d3429);
      border: 3px solid #22c55e;
      transform: scale(1.15);
      box-shadow: 
        0 0 0 4px rgba(34, 197, 94, 0.25),
        0 8px 24px rgba(34, 197, 94, 0.3),
        0 4px 8px rgba(0, 0, 0, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      animation: markerPulse 2s ease-in-out infinite;
      z-index: 100 !important;
    }
    
    .golf-marker.active .marker-icon {
      color: #4ade80;
      filter: drop-shadow(0 0 4px rgba(74, 222, 128, 0.5));
    }
    
    .marker-icon {
      width: 22px;
      height: 22px;
      color: white;
      flex-shrink: 0;
      transition: color 0.25s ease, filter 0.25s ease;
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
    }
    
    .golf-marker-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 14px;
      height: 14px;
      background: #22c55e;
      border: 2px solid white;
      border-radius: 50%;
      z-index: 2;
      opacity: 0;
      transform: scale(0);
      transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    .golf-marker.active .golf-marker-badge {
      opacity: 1;
      transform: scale(1);
    }
    
    .mapboxgl-marker:has(.golf-marker.active) {
      z-index: 100 !important;
    }
  `;
  document.head.appendChild(style);
};

export const createMarkerElement = (course: GolfCourse, onCourseSelect: (course: GolfCourse) => void) => {
  injectMarkerStyles();
  
  // Create wrapper for positioning
  const wrapper = document.createElement("div");
  wrapper.className = 'golf-marker-wrapper';
  
  const el = document.createElement("div");
  el.className = 'golf-marker';
  el.dataset.courseId = course.id;
  
  // Golf flag icon with class for animations
  el.innerHTML = `
    <svg class="marker-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
      <line x1="4" x2="4" y1="22" y2="15"/>
    </svg>
    <div class="golf-marker-badge"></div>
  `;

  wrapper.appendChild(el);

  // Click handler
  el.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Trigger haptic feedback on mobile
    hapticMedium();
    
    // Remove active from previous
    if (activeMarkerId) {
      const prevActive = document.querySelector(`.golf-marker[data-course-id="${activeMarkerId}"]`);
      if (prevActive) prevActive.classList.remove('active');
    }
    
    // Set this as active
    el.classList.add('active');
    activeMarkerId = course.id;
    
    onCourseSelect(course);
  });

  return wrapper;
};

export const setActiveMarker = (courseId: string | null) => {
  // Remove previous active
  if (activeMarkerId) {
    const prevActive = document.querySelector(`.golf-marker[data-course-id="${activeMarkerId}"]`);
    if (prevActive) prevActive.classList.remove('active');
  }
  
  // Set new active
  if (courseId) {
    const newActive = document.querySelector(`.golf-marker[data-course-id="${courseId}"]`);
    if (newActive) newActive.classList.add('active');
  }
  
  activeMarkerId = courseId;
};

export const resetMarkerIndex = () => {
  // No longer needed but kept for compatibility
};

export const resetActiveMarker = () => {
  if (activeMarkerId) {
    const prevActive = document.querySelector(`.golf-marker[data-course-id="${activeMarkerId}"]`);
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
