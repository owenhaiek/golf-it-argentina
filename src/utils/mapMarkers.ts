
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
  if (document.getElementById('golf-marker-styles-v3')) return;
  
  const style = document.createElement('style');
  style.id = 'golf-marker-styles-v3';
  style.textContent = `
    @keyframes marker-fade-in {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    
    @keyframes marker-pulse {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.8; }
    }
    
    .golf-marker-v3 {
      pointer-events: auto !important;
      cursor: pointer;
    }
    
    .golf-marker-v3:hover .marker-pin {
      filter: drop-shadow(0 0 12px rgba(34, 197, 94, 0.9)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
    }
    
    .golf-marker-v3.active .marker-pin {
      filter: drop-shadow(0 0 16px rgba(34, 197, 94, 1)) drop-shadow(0 0 24px rgba(34, 197, 94, 0.6));
    }
    
    .golf-marker-v3.active .marker-glow {
      animation: marker-pulse 1.5s ease-in-out infinite;
    }
    
    .marker-pin {
      transition: filter 0.3s ease;
      filter: drop-shadow(0 0 6px rgba(34, 197, 94, 0.5)) drop-shadow(0 3px 6px rgba(0, 0, 0, 0.2));
    }
    
    .marker-glow {
      opacity: 0.5;
      transition: opacity 0.3s ease;
    }
  `;
  document.head.appendChild(style);
};

export const createMarkerElement = (course: GolfCourse, onCourseSelect: (course: GolfCourse) => void) => {
  injectMarkerStyles();
  
  const currentIndex = markerIndex++;
  const animationDelay = Math.min(currentIndex * 30, 600);
  
  const el = document.createElement("div");
  el.className = 'golf-marker-v3';
  el.dataset.courseId = course.id;
  el.style.cssText = `
    opacity: 0;
    animation: marker-fade-in 0.3s ease-out ${animationDelay}ms forwards;
  `;
  
  const uniqueId = course.id.slice(0, 8);
  
  el.innerHTML = `
    <div style="width: 32px; height: 40px;">
      <!-- Glow effect -->
      <div class="marker-glow" style="
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 16px;
        height: 8px;
        margin-left: -8px;
        border-radius: 50%;
        background: rgba(34, 197, 94, 0.6);
      "></div>
      
      <!-- Main pin SVG -->
      <svg class="marker-pin" viewBox="0 0 32 40" width="32" height="40">
        <defs>
          <linearGradient id="pin-${uniqueId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4ade80"/>
            <stop offset="50%" stop-color="#22c55e"/>
            <stop offset="100%" stop-color="#16a34a"/>
          </linearGradient>
        </defs>
        
        <!-- Pin shape -->
        <path d="M16 1C8.28 1 2 7.28 2 15c0 10 14 24 14 24s14-14 14-24c0-7.72-6.28-14-14-14z" 
              fill="url(#pin-${uniqueId})" 
              stroke="white" 
              stroke-width="2"/>
        
        <!-- Inner circle -->
        <circle cx="16" cy="13" r="7" fill="white"/>
        
        <!-- Golf flag -->
        <g transform="translate(11, 8)">
          <path d="M2 0v10" stroke="#16a34a" stroke-width="2" stroke-linecap="round"/>
          <path d="M2 1l6 2.5-6 2.5" fill="#22c55e"/>
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
      const prevActive = document.querySelector(`.golf-marker-v3[data-course-id="${activeMarkerId}"]`);
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
    const prevActive = document.querySelector(`.golf-marker-v3[data-course-id="${activeMarkerId}"]`);
    if (prevActive) prevActive.classList.remove('active');
  }
  
  // Set new active
  if (courseId) {
    const newActive = document.querySelector(`.golf-marker-v3[data-course-id="${courseId}"]`);
    if (newActive) newActive.classList.add('active');
  }
  
  activeMarkerId = courseId;
};

export const resetMarkerIndex = () => {
  markerIndex = 0;
};

export const resetActiveMarker = () => {
  if (activeMarkerId) {
    const prevActive = document.querySelector(`.golf-marker-v3[data-course-id="${activeMarkerId}"]`);
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
