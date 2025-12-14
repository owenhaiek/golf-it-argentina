
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
  const animationDelay = Math.min(currentIndex * 50, 1000); // Stagger animation, max 1s delay
  
  // Container for marker and pulse
  el.style.cssText = `
    position: relative;
    width: 44px;
    height: 52px;
    cursor: pointer;
    user-select: none;
    pointer-events: auto;
    animation: marker-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${animationDelay}ms both;
  `;
  
  // Create the marker pin (tear drop shape)
  el.innerHTML = `
    <style>
      @keyframes marker-bounce {
        0% { 
          transform: translateY(-30px) scale(0); 
          opacity: 0; 
        }
        60% { 
          transform: translateY(4px) scale(1.1); 
          opacity: 1;
        }
        100% { 
          transform: translateY(0) scale(1); 
          opacity: 1;
        }
      }
      
      @keyframes marker-pulse {
        0% { 
          transform: scale(1); 
          opacity: 0.6; 
        }
        100% { 
          transform: scale(2.5); 
          opacity: 0; 
        }
      }
      
      @keyframes marker-glow {
        0%, 100% { 
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4), 0 0 30px rgba(16, 185, 129, 0.2);
        }
        50% { 
          box-shadow: 0 4px 25px rgba(16, 185, 129, 0.6), 0 0 40px rgba(16, 185, 129, 0.3);
        }
      }
    </style>
    
    <!-- Pulse ring -->
    <div style="
      position: absolute;
      bottom: 2px;
      left: 50%;
      transform: translateX(-50%);
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.4);
      animation: marker-pulse 2s ease-out infinite;
      pointer-events: none;
    "></div>
    
    <!-- Main pin -->
    <div class="marker-pin" style="
      position: relative;
      width: 36px;
      height: 44px;
      margin: 0 auto;
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
      transition: transform 0.2s ease, filter 0.2s ease;
    ">
      <!-- Pin body (SVG tear drop) -->
      <svg viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
        <defs>
          <linearGradient id="pinGradient-${course.id}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#34d399" />
            <stop offset="50%" style="stop-color:#10b981" />
            <stop offset="100%" style="stop-color:#059669" />
          </linearGradient>
          <filter id="glow-${course.id}">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <!-- Outer glow -->
        <path d="M18 0C8.06 0 0 8.06 0 18c0 12 18 26 18 26s18-14 18-26c0-9.94-8.06-18-18-18z" 
              fill="url(#pinGradient-${course.id})" 
              stroke="white" 
              stroke-width="2.5"
              filter="url(#glow-${course.id})"
              style="animation: marker-glow 3s ease-in-out infinite;"/>
        <!-- Inner circle for icon -->
        <circle cx="18" cy="16" r="10" fill="white" fill-opacity="0.95"/>
        <!-- Golf flag icon -->
        <g transform="translate(11, 9)">
          <path d="M3 0v14M3 0l8 3.5L3 7" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="3" cy="13" r="1.5" fill="#059669"/>
        </g>
      </svg>
    </div>
  `;

  const pinElement = el.querySelector('.marker-pin') as HTMLElement;

  // Hover effects
  el.addEventListener("mouseenter", () => {
    if (pinElement) {
      pinElement.style.transform = "scale(1.15) translateY(-2px)";
      pinElement.style.filter = "drop-shadow(0 8px 16px rgba(16, 185, 129, 0.5))";
    }
  });

  el.addEventListener("mouseleave", () => {
    if (pinElement) {
      pinElement.style.transform = "scale(1) translateY(0)";
      pinElement.style.filter = "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4))";
    }
  });

  // Click handler
  el.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("[MapMarkers] Marker clicked:", course.name, "at coordinates:", [course.longitude, course.latitude]);
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
    console.warn("[MapMarkers] Invalid coordinates:", { latitude, longitude, lat, lng });
    return false;
  }
  
  // Validate Argentina coordinates with more detailed logging
  const isValidLat = lat >= -55 && lat <= -21;
  const isValidLng = lng >= -74 && lng <= -53;
  
  if (!isValidLat || !isValidLng) {
    console.warn("[MapMarkers] Coordinates outside Argentina bounds:", { 
      lat, 
      lng, 
      isValidLat, 
      isValidLng,
      expectedLatRange: "[-55, -21]",
      expectedLngRange: "[-74, -53]"
    });
    return false;
  }
  
  console.log("[MapMarkers] Valid coordinates:", { lat, lng });
  return true;
};
