
interface GolfCourse {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
}

export const createMarkerElement = (course: GolfCourse, onCourseSelect: (course: GolfCourse) => void) => {
  const el = document.createElement("div");
  
  // Fixed positioning and styling to prevent movement
  el.style.cssText = `
    width: 32px;
    height: 32px;
    background-color: #10b981;
    border: 3px solid white;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    pointer-events: auto;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    position: relative;
    z-index: 10;
    transform-origin: center center;
  `;
  
  // Golf flag icon
  el.innerHTML = `
    <svg width="16" height="16" fill="white" viewBox="0 0 24 24" style="pointer-events: none;">
      <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
    </svg>
  `;

  // Hover effects that only change scale and shadow, not position
  el.addEventListener("mouseenter", () => {
    el.style.transform = "scale(1.15)";
    el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
    el.style.zIndex = "20";
  });

  el.addEventListener("mouseleave", () => {
    el.style.transform = "scale(1)";
    el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
    el.style.zIndex = "10";
  });

  // Click handler
  el.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("[MapMarkers] Marker clicked:", course.name);
    onCourseSelect(course);
  });

  return el;
};

export const validateCoordinates = (latitude?: number, longitude?: number): boolean => {
  const lat = Number(latitude);
  const lng = Number(longitude);
  
  if (!latitude || !longitude || isNaN(lat) || isNaN(lng)) {
    return false;
  }
  
  // Validate Argentina coordinates
  return lat >= -55 && lat <= -21 && lng >= -74 && lng <= -53;
};
