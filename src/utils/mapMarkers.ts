
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
  if (document.getElementById('golf-marker-styles-v7')) return;
  
  const style = document.createElement('style');
  style.id = 'golf-marker-styles-v7';
  style.textContent = `
    .golf-marker-v7 {
      pointer-events: auto !important;
      cursor: pointer;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #22c55e;
      border: 2px solid rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }
    
    .golf-marker-v7.active {
      width: 44px;
      height: 44px;
      background: #16a34a;
      border: 3px solid white;
      box-shadow: 0 0 16px rgba(34, 197, 94, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    
    .golf-marker-v7 svg {
      width: 16px;
      height: 16px;
      color: white;
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
