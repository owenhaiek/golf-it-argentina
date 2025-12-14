
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
  if (document.getElementById('golf-marker-styles-v6')) return;
  
  const style = document.createElement('style');
  style.id = 'golf-marker-styles-v6';
  style.textContent = `
    @keyframes marker-fade-in {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 8px rgba(34, 197, 94, 0.6), 0 2px 8px rgba(0, 0, 0, 0.3); }
      50% { box-shadow: 0 0 16px rgba(34, 197, 94, 0.9), 0 2px 12px rgba(0, 0, 0, 0.4); }
    }
    
    .golf-marker-v6 {
      pointer-events: auto !important;
      cursor: pointer;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(145deg, #22c55e 0%, #15803d 100%);
      border: 3px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 8px rgba(34, 197, 94, 0.6), 0 2px 8px rgba(0, 0, 0, 0.3);
      animation: pulse-glow 3s ease-in-out infinite;
      transition: width 0.2s ease, height 0.2s ease, box-shadow 0.2s ease;
    }
    
    .golf-marker-v6.active {
      width: 56px;
      height: 56px;
      box-shadow: 0 0 24px rgba(34, 197, 94, 1), 0 4px 16px rgba(0, 0, 0, 0.5);
      animation: none;
    }
    
    .golf-marker-v6 svg {
      width: 22px;
      height: 22px;
      color: white;
      flex-shrink: 0;
    }
    
    .golf-marker-v6.active svg {
      width: 26px;
      height: 26px;
    }
  `;
  document.head.appendChild(style);
};

export const createMarkerElement = (course: GolfCourse, onCourseSelect: (course: GolfCourse) => void) => {
  injectMarkerStyles();
  
  const currentIndex = markerIndex++;
  const animationDelay = Math.min(currentIndex * 20, 400);
  
  const el = document.createElement("div");
  el.className = 'golf-marker-v6';
  el.dataset.courseId = course.id;
  el.style.opacity = '0';
  el.style.animation = `marker-fade-in 0.2s ease-out ${animationDelay}ms forwards`;
  
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
      const prevActive = document.querySelector(`.golf-marker-v6[data-course-id="${activeMarkerId}"]`);
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
    const prevActive = document.querySelector(`.golf-marker-v6[data-course-id="${activeMarkerId}"]`);
    if (prevActive) prevActive.classList.remove('active');
  }
  
  // Set new active
  if (courseId) {
    const newActive = document.querySelector(`.golf-marker-v6[data-course-id="${courseId}"]`);
    if (newActive) newActive.classList.add('active');
  }
  
  activeMarkerId = courseId;
};

export const resetMarkerIndex = () => {
  markerIndex = 0;
};

export const resetActiveMarker = () => {
  if (activeMarkerId) {
    const prevActive = document.querySelector(`.golf-marker-v6[data-course-id="${activeMarkerId}"]`);
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
