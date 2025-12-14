
interface GolfCourse {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
}

let markerIndex = 0;
let activeMarkerId: string | null = null;

// Inject global styles once
const injectMarkerStyles = () => {
  if (document.getElementById('golf-marker-styles-v2')) return;
  
  const style = document.createElement('style');
  style.id = 'golf-marker-styles-v2';
  style.textContent = `
    @keyframes marker-appear {
      0% { 
        opacity: 0;
        transform: scale(0.5) translateY(-10px);
      }
      60% {
        transform: scale(1.1) translateY(0);
      }
      100% { 
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    
    @keyframes pulse-glow {
      0%, 100% { 
        opacity: 0.4;
        transform: translate(-50%, -50%) scale(1);
      }
      50% { 
        opacity: 0.7;
        transform: translate(-50%, -50%) scale(1.3);
      }
    }
    
    @keyframes ring-expand {
      0% { 
        opacity: 0.6;
        transform: translate(-50%, -50%) scale(0.8);
      }
      100% { 
        opacity: 0;
        transform: translate(-50%, -50%) scale(2.5);
      }
    }
    
    .golf-marker-v2 {
      pointer-events: auto !important;
      cursor: pointer;
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    .golf-marker-v2:hover {
      transform: scale(1.15);
      z-index: 100 !important;
    }
    
    .golf-marker-v2:hover .marker-glow {
      opacity: 1 !important;
    }
    
    .golf-marker-v2:hover .marker-pin-svg {
      filter: drop-shadow(0 0 12px rgba(16, 185, 129, 0.8)) 
              drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3)) !important;
    }
    
    .golf-marker-v2.active {
      transform: scale(1.25);
      z-index: 110 !important;
    }
    
    .golf-marker-v2.active .marker-glow {
      opacity: 1 !important;
      animation: pulse-glow 1.5s ease-in-out infinite !important;
    }
    
    .golf-marker-v2.active .marker-pin-svg {
      filter: drop-shadow(0 0 16px rgba(16, 185, 129, 1)) 
              drop-shadow(0 0 24px rgba(16, 185, 129, 0.6))
              drop-shadow(0 6px 12px rgba(0, 0, 0, 0.4)) !important;
    }
    
    .marker-glow {
      transition: opacity 0.3s ease;
    }
    
    .marker-pin-svg {
      transition: filter 0.3s ease, transform 0.25s ease;
    }
  `;
  document.head.appendChild(style);
};

export const createMarkerElement = (course: GolfCourse, onCourseSelect: (course: GolfCourse) => void) => {
  injectMarkerStyles();
  
  const currentIndex = markerIndex++;
  const animationDelay = Math.min(currentIndex * 35, 800);
  
  const el = document.createElement("div");
  el.className = 'golf-marker-v2';
  el.dataset.courseId = course.id;
  el.style.cssText = `
    opacity: 0;
    animation: marker-appear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${animationDelay}ms forwards;
  `;
  
  const uniqueId = course.id.slice(0, 8);
  
  el.innerHTML = `
    <div style="position: relative; width: 40px; height: 48px; display: flex; align-items: flex-end; justify-content: center;">
      <!-- Outer glow ring -->
      <div class="marker-glow" style="
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 20px;
        height: 10px;
        border-radius: 50%;
        background: radial-gradient(ellipse, rgba(16, 185, 129, 0.6) 0%, transparent 70%);
        transform: translateX(-50%);
        opacity: 0.5;
        pointer-events: none;
      "></div>
      
      <!-- Expanding ring animation -->
      <div style="
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 16px;
        height: 8px;
        border-radius: 50%;
        border: 2px solid rgba(16, 185, 129, 0.5);
        transform: translateX(-50%);
        animation: ring-expand 2.5s ease-out infinite;
        pointer-events: none;
      "></div>
      
      <!-- Main pin SVG -->
      <svg class="marker-pin-svg" viewBox="0 0 40 48" width="40" height="48" style="
        display: block;
        filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.4)) drop-shadow(0 4px 6px rgba(0, 0, 0, 0.25));
      ">
        <defs>
          <linearGradient id="pin-grad-${uniqueId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4ade80"/>
            <stop offset="40%" stop-color="#22c55e"/>
            <stop offset="100%" stop-color="#16a34a"/>
          </linearGradient>
          <linearGradient id="shine-${uniqueId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.4)"/>
            <stop offset="50%" stop-color="rgba(255,255,255,0)"/>
          </linearGradient>
          <filter id="inner-glow-${uniqueId}">
            <feGaussianBlur stdDeviation="1" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>
        
        <!-- Pin shape -->
        <path d="M20 2C10.06 2 2 10.06 2 20c0 13.33 18 26 18 26s18-12.67 18-26c0-9.94-7.96-18-18-18z" 
              fill="url(#pin-grad-${uniqueId})" 
              stroke="white" 
              stroke-width="2.5"/>
        
        <!-- Shine overlay -->
        <path d="M20 2C10.06 2 2 10.06 2 20c0 13.33 18 26 18 26s18-12.67 18-26c0-9.94-7.96-18-18-18z" 
              fill="url(#shine-${uniqueId})" 
              opacity="0.6"/>
        
        <!-- Inner white circle -->
        <circle cx="20" cy="17" r="10" fill="white" filter="url(#inner-glow-${uniqueId})"/>
        
        <!-- Golf flag icon -->
        <g transform="translate(13, 10)">
          <path d="M3 0v14" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M3 1l9 4-9 4" fill="#22c55e" stroke="#16a34a" stroke-width="1" stroke-linejoin="round"/>
        </g>
      </svg>
    </div>
  `;

  // Click handler
  el.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Remove active from previous
    if (activeMarkerId) {
      const prevActive = document.querySelector(`.golf-marker-v2[data-course-id="${activeMarkerId}"]`);
      if (prevActive) prevActive.classList.remove('active');
    }
    
    // Set this as active
    el.classList.add('active');
    activeMarkerId = course.id;
    
    console.log("[MapMarkers] Marker clicked:", course.name);
    onCourseSelect(course);
  });

  return el;
};

export const setActiveMarker = (courseId: string | null) => {
  // Remove previous active
  if (activeMarkerId) {
    const prevActive = document.querySelector(`.golf-marker-v2[data-course-id="${activeMarkerId}"]`);
    if (prevActive) prevActive.classList.remove('active');
  }
  
  // Set new active
  if (courseId) {
    const newActive = document.querySelector(`.golf-marker-v2[data-course-id="${courseId}"]`);
    if (newActive) newActive.classList.add('active');
  }
  
  activeMarkerId = courseId;
};

export const resetMarkerIndex = () => {
  markerIndex = 0;
};

export const resetActiveMarker = () => {
  if (activeMarkerId) {
    const prevActive = document.querySelector(`.golf-marker-v2[data-course-id="${activeMarkerId}"]`);
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
