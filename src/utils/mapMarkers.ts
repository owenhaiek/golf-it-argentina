
interface GolfCourse {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
}

let markerIndex = 0;

export const createMarkerElement = (course: GolfCourse, onCourseSelect: (course: GolfCourse) => void) => {
  const el = document.createElement("div");
  const currentIndex = markerIndex++;
  const animationDelay = Math.min(currentIndex * 30, 800); // Stagger animation, max 800ms delay
  
  // Inject keyframes if not already present
  if (!document.getElementById('golf-marker-styles')) {
    const style = document.createElement('style');
    style.id = 'golf-marker-styles';
    style.textContent = `
      @keyframes marker-bounce {
        0% { 
          transform: translateY(-20px) scale(0); 
          opacity: 0; 
        }
        60% { 
          transform: translateY(3px) scale(1.05); 
          opacity: 1;
        }
        100% { 
          transform: translateY(0) scale(1); 
          opacity: 1;
        }
      }
      
      @keyframes marker-pulse {
        0% { 
          transform: translate(-50%, -50%) scale(1); 
          opacity: 0.6; 
        }
        100% { 
          transform: translate(-50%, -50%) scale(2.5); 
          opacity: 0; 
        }
      }
      
      .golf-marker {
        animation: marker-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        opacity: 0;
      }
      
      .golf-marker:hover .marker-pin-body {
        transform: scale(1.1);
        filter: drop-shadow(0 6px 12px rgba(16, 185, 129, 0.5));
      }
      
      .marker-pulse-ring {
        animation: marker-pulse 2s ease-out infinite;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Simple container - let Mapbox handle positioning
  el.className = 'golf-marker';
  el.style.cssText = `
    width: 32px;
    height: 40px;
    cursor: pointer;
    animation-delay: ${animationDelay}ms;
  `;
  
  el.innerHTML = `
    <!-- Pulse ring at bottom -->
    <div class="marker-pulse-ring" style="
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.5);
      transform: translate(-50%, -50%);
    "></div>
    
    <!-- Main pin body -->
    <div class="marker-pin-body" style="
      width: 32px;
      height: 40px;
      transition: transform 0.2s ease, filter 0.2s ease;
      filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.4));
    ">
      <svg viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
        <defs>
          <linearGradient id="pinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#34d399" />
            <stop offset="50%" stop-color="#10b981" />
            <stop offset="100%" stop-color="#059669" />
          </linearGradient>
        </defs>
        <!-- Pin shape -->
        <path d="M16 0C7.16 0 0 7.16 0 16c0 10.67 16 24 16 24s16-13.33 16-24C32 7.16 24.84 0 16 0z" 
              fill="url(#pinGrad)" 
              stroke="white" 
              stroke-width="2"/>
        <!-- Inner white circle -->
        <circle cx="16" cy="14" r="8" fill="white" fill-opacity="0.95"/>
        <!-- Golf flag icon -->
        <g transform="translate(10.5, 8)">
          <path d="M2.5 0v12M2.5 0l7 3L2.5 6" fill="none" stroke="#059669" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      </svg>
    </div>
  `;

  // Click handler - select and center on course
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
