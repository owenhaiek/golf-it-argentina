
interface GolfCourse {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
}

let activeMarkerId: string | null = null;

// Inject global styles once - Clean, stable markers without size changes
const injectMarkerStyles = () => {
  if (document.getElementById('golf-marker-styles-v13')) return;
  
  // Remove old styles
  const oldStyles = ['golf-marker-styles-v8', 'golf-marker-styles-v9', 'golf-marker-styles-v10', 'golf-marker-styles-v11', 'golf-marker-styles-v12'];
  oldStyles.forEach(id => {
    const oldStyle = document.getElementById(id);
    if (oldStyle) oldStyle.remove();
  });
  
  const style = document.createElement('style');
  style.id = 'golf-marker-styles-v13';
  style.textContent = `
    .golf-marker {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      border: 2px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
      transition: box-shadow 0.2s ease, border-color 0.2s ease;
    }
    
    .golf-marker:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }
    
    .golf-marker.active {
      border: 3px solid white;
      box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    
    .golf-marker svg {
      width: 14px;
      height: 14px;
      color: white;
      flex-shrink: 0;
    }
  `;
  document.head.appendChild(style);
};

export const createMarkerElement = (course: GolfCourse, onCourseSelect: (course: GolfCourse) => void) => {
  injectMarkerStyles();
  
  const el = document.createElement("div");
  el.className = 'golf-marker';
  el.dataset.courseId = course.id;
  
  // Golf flag icon
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
      const prevActive = document.querySelector(`.golf-marker[data-course-id="${activeMarkerId}"]`);
      if (prevActive) prevActive.classList.remove('active');
    }
    
    // Set this as active
    el.classList.add('active');
    activeMarkerId = course.id;
    
    onCourseSelect(course);
  });

  return el;
};

export const setActiveMarker = (courseId: string | null) => {
  // Remove previous active
  if (activeMarkerId) {
    const prevActive = document.querySelector(`.golf-marker[data-course-id="${activeMarkerId}"]`);
    if (prevActive) prevActive.classList.remove('active');
  }
  
  // Set new active
  if (courseId) {
    const newActive = document.querySelector(`.golf-marker[data-course-id="${courseId}"]`);
    if (newActive) newActive.classList.add('active');
  }
  
  activeMarkerId = courseId;
};

export const resetMarkerIndex = () => {
  // No longer needed but kept for compatibility
};

export const resetActiveMarker = () => {
  if (activeMarkerId) {
    const prevActive = document.querySelector(`.golf-marker[data-course-id="${activeMarkerId}"]`);
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
