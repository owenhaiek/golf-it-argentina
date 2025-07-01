
interface GolfCourse {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
}

export const createMarkerElement = (course: GolfCourse, onCourseSelect: (course: GolfCourse) => void) => {
  const el = document.createElement("div");
  
  // Improved styling for better visibility and stability
  el.style.cssText = `
    width: 32px;
    height: 32px;
    background-color: #10b981;
    border: 3px solid white;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 3px 8px rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    pointer-events: auto;
    transition: all 0.2s ease;
    position: relative;
    z-index: 1;
  `;
  
  el.innerHTML = `
    <svg width="16" height="16" fill="white" viewBox="0 0 24 24" style="pointer-events: none;">
      <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
    </svg>
  `;

  el.addEventListener("mouseenter", () => {
    el.style.backgroundColor = "#059669";
    el.style.transform = "scale(1.1)";
  });

  el.addEventListener("mouseleave", () => {
    el.style.backgroundColor = "#10b981";
    el.style.transform = "scale(1)";
  });

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
  
  // More lenient validation for Argentina coordinates
  return lat >= -55 && lat <= -21 && lng >= -74 && lng <= -53;
};

export const fitMapToBounds = (map: any, bounds: any, validCourses: number) => {
  if (validCourses > 0) {
    try {
      map.fitBounds(bounds, {
        padding: { top: 60, bottom: 60, left: 60, right: 60 },
        maxZoom: 10,
        duration: 1200,
      });
    } catch (error) {
      console.warn("[MapMarkers] Error fitting bounds:", error);
    }
  }
};
