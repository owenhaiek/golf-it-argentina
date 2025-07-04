
interface GolfCourse {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
}

export const createMarkerElement = (course: GolfCourse, onCourseSelect: (course: GolfCourse) => void) => {
  const el = document.createElement("div");
  
  // Enhanced styling for visibility on satellite imagery
  el.style.cssText = `
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #10b981, #059669);
    border: 3px solid white;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 2px 4px rgba(16,185,129,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    pointer-events: auto;
  `;
  
  // Golf flag icon
  el.innerHTML = `
    <svg width="16" height="16" fill="white" viewBox="0 0 24 24" style="pointer-events: none;">
      <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
    </svg>
  `;

  // Enhanced hover effects for satellite visibility
  el.addEventListener("mouseenter", () => {
    el.style.background = "linear-gradient(135deg, #059669, #047857)";
    el.style.boxShadow = "0 6px 16px rgba(0,0,0,0.5), 0 2px 6px rgba(16,185,129,0.4)";
    el.style.transform = "scale(1.1)";
    el.style.transformOrigin = "center center";
  });

  el.addEventListener("mouseleave", () => {
    el.style.background = "linear-gradient(135deg, #10b981, #059669)";
    el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4), 0 2px 4px rgba(16,185,129,0.3)";
    el.style.transform = "scale(1)";
    el.style.transformOrigin = "center center";
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
