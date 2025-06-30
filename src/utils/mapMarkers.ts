
interface GolfCourse {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
}

export const createMarkerElement = (course: GolfCourse, onCourseSelect: (course: GolfCourse) => void) => {
  const el = document.createElement("div");
  
  // Fixed positioning to prevent movement during zoom
  el.style.cssText = `
    width: 32px;
    height: 32px;
    background-color: #10b981;
    border: 2px solid white;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
    pointer-events: auto;
    z-index: 100;
    position: relative;
  `;
  
  el.innerHTML = `
    <svg width="16" height="16" fill="white" viewBox="0 0 24 24" style="pointer-events: none;">
      <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
    </svg>
  `;

  el.addEventListener("mouseenter", () => {
    el.style.backgroundColor = "#059669";
  });

  el.addEventListener("mouseleave", () => {
    el.style.backgroundColor = "#10b981";
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
  return !(!latitude || !longitude || isNaN(lat) || isNaN(lng) || 
           lat === 0 || lng === 0 || lat < -90 || lat > 90 || lng < -180 || lng > 180);
};

export const fitMapToBounds = (map: any, bounds: any, validCourses: number) => {
  if (validCourses > 0) {
    try {
      map.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 10,
        duration: 1000,
      });
    } catch (error) {
      console.warn("[MapMarkers] Error fitting bounds:", error);
    }
  }
};
