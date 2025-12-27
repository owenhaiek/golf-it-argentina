
interface GolfCourse {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
}

let markerIndex = 0;
let activeMarkerId: string | null = null;

// Inject global styles once - Simple pulse animation for better performance
const injectMarkerStyles = () => {
  if (document.getElementById('golf-marker-styles-v12')) return;
  
  // Remove old styles
  const oldStyles = ['golf-marker-styles-v8', 'golf-marker-styles-v9', 'golf-marker-styles-v10', 'golf-marker-styles-v11'];
  oldStyles.forEach(id => {
    const oldStyle = document.getElementById(id);
    if (oldStyle) oldStyle.remove();
  });
  
  const style = document.createElement('style');
  style.id = 'golf-marker-styles-v12';
  style.textContent = `
    @keyframes marker-pulse {
      0%, 100% { 
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 0 rgba(34, 197, 94, 0.4);
      }
      50% { 
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 8px rgba(34, 197, 94, 0);
      }
    }
    
    .golf-marker-v8 {
      pointer-events: auto !important;
      cursor: pointer;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      border: 2px solid rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: marker-pulse 3s ease-in-out infinite;
      will-change: box-shadow;
    }
    
    .golf-marker-v8:hover {
      background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
      animation: none;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    }
    
    .golf-marker-v8.active {
      width: 42px;
      height: 42px;
      background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
      border: 3px solid white;
      animation: none;
      box-shadow: 0 0 20px rgba(34, 197, 94, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    
    .golf-marker-v8 svg {
      width: 16px;
      height: 16px;
      color: white;
    }
    
    .golf-marker-v8.active svg {
      width: 18px;
      height: 18px;
    }
  `;
  document.head.appendChild(style);
};

export const createMarkerElement = (course: GolfCourse, onCourseSelect: (course: GolfCourse) => void) => {
  injectMarkerStyles();
  markerIndex++;
  
  const el = document.createElement("div");
  el.className = 'golf-marker-v8';
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
      const prevActive = document.querySelector(`.golf-marker-v8[data-course-id="${activeMarkerId}"]`);
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
    const prevActive = document.querySelector(`.golf-marker-v8[data-course-id="${activeMarkerId}"]`);
    if (prevActive) prevActive.classList.remove('active');
  }
  
  // Set new active
  if (courseId) {
    const newActive = document.querySelector(`.golf-marker-v8[data-course-id="${courseId}"]`);
    if (newActive) newActive.classList.add('active');
  }
  
  activeMarkerId = courseId;
};

export const resetMarkerIndex = () => {
  markerIndex = 0;
};

export const resetActiveMarker = () => {
  if (activeMarkerId) {
    const prevActive = document.querySelector(`.golf-marker-v8[data-course-id="${activeMarkerId}"]`);
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
