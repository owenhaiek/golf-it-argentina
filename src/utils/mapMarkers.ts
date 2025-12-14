
interface GolfCourse {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
}

let markerIndex = 0;

// Inject global styles once
const injectMarkerStyles = () => {
  if (document.getElementById('golf-marker-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'golf-marker-styles';
  style.textContent = `
    @keyframes marker-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes pulse-ring {
      0% { 
        opacity: 0.6;
        width: 12px;
        height: 12px;
      }
      100% { 
        opacity: 0;
        width: 36px;
        height: 36px;
      }
    }
    
    .golf-marker-container {
      pointer-events: auto !important;
    }
    
    .golf-marker-container:hover .golf-pin {
      filter: drop-shadow(0 6px 12px rgba(16, 185, 129, 0.6)) brightness(1.1);
    }
  `;
  document.head.appendChild(style);
};

export const createMarkerElement = (course: GolfCourse, onCourseSelect: (course: GolfCourse) => void) => {
  injectMarkerStyles();
  
  const currentIndex = markerIndex++;
  const animationDelay = Math.min(currentIndex * 40, 1000);
  
  // Create a simple wrapper - NO transforms, NO positioning tricks
  const el = document.createElement("div");
  el.className = 'golf-marker-container';
  el.style.cssText = `
    cursor: pointer;
    opacity: 0;
    animation: marker-fade-in 0.3s ease-out ${animationDelay}ms forwards;
  `;
  
  // Create the pin SVG directly - simple and clean
  el.innerHTML = `
    <div style="position: relative; width: 32px; height: 40px;">
      <!-- Pulse effect -->
      <div style="
        position: absolute;
        bottom: -2px;
        left: 50%;
        margin-left: -6px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: rgba(16, 185, 129, 0.4);
        animation: pulse-ring 2s ease-out infinite;
      "></div>
      
      <!-- Pin SVG -->
      <svg class="golf-pin" viewBox="0 0 32 40" width="32" height="40" style="
        display: block;
        filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.35));
        transition: filter 0.2s ease;
      ">
        <defs>
          <linearGradient id="grad-${course.id.slice(0, 8)}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#34d399"/>
            <stop offset="50%" stop-color="#10b981"/>
            <stop offset="100%" stop-color="#059669"/>
          </linearGradient>
        </defs>
        <path d="M16 0C7.16 0 0 7.16 0 16c0 10.67 16 24 16 24s16-13.33 16-24C32 7.16 24.84 0 16 0z" 
              fill="url(#grad-${course.id.slice(0, 8)})" 
              stroke="white" 
              stroke-width="2"/>
        <circle cx="16" cy="14" r="8" fill="white" fill-opacity="0.95"/>
        <g transform="translate(10.5, 8)">
          <path d="M2.5 0v12M2.5 0l7 3L2.5 6" fill="none" stroke="#059669" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      </svg>
    </div>
  `;

  // Click handler
  el.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("[MapMarkers] Marker clicked:", course.name);
    onCourseSelect(course);
  });

  return el;
};

export const resetMarkerIndex = () => {
  markerIndex = 0;
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
