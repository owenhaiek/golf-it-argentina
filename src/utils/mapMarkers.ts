
interface GolfCourse {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
}

let markerIndex = 0;
let activeMarkerId: string | null = null;

// Inject global styles once - NO TRANSFORMS to avoid Mapbox conflicts
const injectMarkerStyles = () => {
  if (document.getElementById('golf-marker-styles-v8')) return;
  
  const style = document.createElement('style');
  style.id = 'golf-marker-styles-v8';
  style.textContent = `
    @keyframes marker-pulse {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4), 0 0 20px rgba(34, 197, 94, 0.3);
      }
      50% {
        box-shadow: 0 0 0 8px rgba(34, 197, 94, 0), 0 0 25px rgba(34, 197, 94, 0.5);
      }
    }
    
    .golf-marker-v7 {
      pointer-events: auto !important;
      cursor: pointer;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.85) 0%, rgba(22, 163, 74, 0.9) 100%);
      border: 2px solid rgba(255, 255, 255, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 20px rgba(34, 197, 94, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(4px);
      animation: marker-pulse 3s ease-in-out infinite;
      transition: all 0.3s ease;
    }
    
    .golf-marker-v7:hover {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(22, 163, 74, 1) 100%);
      box-shadow: 0 0 28px rgba(34, 197, 94, 0.6), 0 6px 16px rgba(0, 0, 0, 0.25);
      border-color: rgba(255, 255, 255, 0.9);
    }
    
    .golf-marker-v7.active {
      width: 46px;
      height: 46px;
      background: linear-gradient(135deg, rgba(22, 163, 74, 0.95) 0%, rgba(21, 128, 61, 1) 100%);
      border: 3px solid rgba(255, 255, 255, 0.95);
      box-shadow: 0 0 32px rgba(34, 197, 94, 0.7), 0 0 48px rgba(34, 197, 94, 0.4), 0 6px 16px rgba(0, 0, 0, 0.3);
      animation: none;
    }
    
    .golf-marker-v7 svg {
      width: 16px;
      height: 16px;
      color: white;
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
    }
    
    .golf-marker-v7.active svg {
      width: 20px;
      height: 20px;
    }
  `;
  document.head.appendChild(style);
};

export const createMarkerElement = (course: GolfCourse, onCourseSelect: (course: GolfCourse) => void) => {
  injectMarkerStyles();
  markerIndex++;
  
  const el = document.createElement("div");
  el.className = 'golf-marker-v7';
  el.dataset.courseId = course.id;
  
  // Simple marker with golf flag icon
  el.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
      <line x1="4" x2="4" y1="22" y2="15"/>
    </svg>
  `;

  // Click handler
  el.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Remove active from previous
    if (activeMarkerId) {
      const prevActive = document.querySelector(`.golf-marker-v7[data-course-id="${activeMarkerId}"]`);
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
    const prevActive = document.querySelector(`.golf-marker-v7[data-course-id="${activeMarkerId}"]`);
    if (prevActive) prevActive.classList.remove('active');
  }
  
  // Set new active
  if (courseId) {
    const newActive = document.querySelector(`.golf-marker-v7[data-course-id="${courseId}"]`);
    if (newActive) newActive.classList.add('active');
  }
  
  activeMarkerId = courseId;
};

export const resetMarkerIndex = () => {
  markerIndex = 0;
};

export const resetActiveMarker = () => {
  if (activeMarkerId) {
    const prevActive = document.querySelector(`.golf-marker-v7[data-course-id="${activeMarkerId}"]`);
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
