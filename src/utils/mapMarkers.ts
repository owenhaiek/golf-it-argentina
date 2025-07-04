
interface GolfCourse {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
}

export const createMarkerElement = (course: GolfCourse, onCourseSelect: (course: GolfCourse) => void) => {
  const el = document.createElement("div");
  
  // Minimal styling that doesn't interfere with Mapbox positioning
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

  // Hover effects using only opacity and box-shadow (no transforms)
  el.addEventListener("mouseenter", () => {
    el.style.background = "linear-gradient(135deg, #059669, #047857)";
    el.style.boxShadow = "0 6px 20px rgba(0,0,0,0.6), 0 2px 8px rgba(16,185,129,0.5)";
    el.style.opacity = "0.9";
  });

  el.addEventListener("mouseleave", () => {
    el.style.background = "linear-gradient(135deg, #10b981, #059669)";
    el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4), 0 2px 4px rgba(16,185,129,0.3)";
    el.style.opacity = "1";
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
