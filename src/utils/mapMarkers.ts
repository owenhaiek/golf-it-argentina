
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
  if (document.getElementById('golf-marker-styles-v4')) return;
  
  const style = document.createElement('style');
  style.id = 'golf-marker-styles-v4';
  style.textContent = `
    @keyframes marker-fade-in {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    
    .golf-marker-v4 {
      pointer-events: auto !important;
      cursor: pointer;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 0 rgba(34, 197, 94, 0);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .golf-marker-v4:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), 0 0 12px rgba(34, 197, 94, 0.5);
    }
    
    .golf-marker-v4.active {
      transform: scale(1.25);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 0 20px rgba(34, 197, 94, 0.7);
    }
    
    .golf-marker-v4 svg {
      width: 18px;
      height: 18px;
      color: white;
      flex-shrink: 0;
    }
  `;
  document.head.appendChild(style);
};

export const createMarkerElement = (course: GolfCourse, onCourseSelect: (course: GolfCourse) => void) => {
  injectMarkerStyles();
  
  const currentIndex = markerIndex++;
  const animationDelay = Math.min(currentIndex * 25, 500);
  
  const el = document.createElement("div");
  el.className = 'golf-marker-v4';
  el.dataset.courseId = course.id;
  el.style.cssText = `
    opacity: 0;
    animation: marker-fade-in 0.25s ease-out ${animationDelay}ms forwards;
  `;
  
  // Golf flag icon SVG
  el.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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
      const prevActive = document.querySelector(`.golf-marker-v4[data-course-id="${activeMarkerId}"]`);
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
    const prevActive = document.querySelector(`.golf-marker-v4[data-course-id="${activeMarkerId}"]`);
    if (prevActive) prevActive.classList.remove('active');
  }
  
  // Set new active
  if (courseId) {
    const newActive = document.querySelector(`.golf-marker-v4[data-course-id="${courseId}"]`);
    if (newActive) newActive.classList.add('active');
  }
  
  activeMarkerId = courseId;
};

export const resetMarkerIndex = () => {
  markerIndex = 0;
};

export const resetActiveMarker = () => {
  if (activeMarkerId) {
    const prevActive = document.querySelector(`.golf-marker-v4[data-course-id="${activeMarkerId}"]`);
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
