
interface GolfCourse {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
}

export const createMarkerElement = (course: GolfCourse, onCourseSelect: (course: GolfCourse) => void) => {
  const el = document.createElement("div");
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
    position: relative;
    transition: transform 0.2s ease, background-color 0.2s ease;
  `;
  
  el.innerHTML = `
    <svg width="16" height="16" fill="white" viewBox="0 0 24 24" style="pointer-events: none;">
      <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
    </svg>
  `;

  // Add hover effects
  el.addEventListener("mouseenter", () => {
    el.style.backgroundColor = "#059669";
    el.style.transform = "scale(1.2)";
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
  return !(!latitude || !longitude || isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0);
};

export const fitMapToBounds = (map: any, bounds: any, validCourses: number) => {
  if (validCourses > 0) {
    try {
      map.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 12,
        duration: 1000,
      });
    } catch (error) {
      console.warn("[MapMarkers] Error fitting bounds:", error);
    }
  }
};
