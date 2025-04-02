
type DayOpeningHours = {
  isOpen: boolean;
  open: string | null;
  close: string | null;
};

export type OpeningHours = DayOpeningHours[];

/**
 * Checks if a golf course is currently open based on its opening hours
 */
export const isOpenNow = (openingHours: OpeningHours | null): boolean => {
  if (!openingHours || !Array.isArray(openingHours)) return false;
  
  // Get current day (0 = Sunday, 1 = Monday, etc.)
  const today = new Date().getDay();
  
  // Get current time
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Get today's opening hours
  const todayHours = openingHours[today];
  
  // If the day is marked as closed
  if (!todayHours || !todayHours.isOpen) return false;
  
  // Parse opening & closing times
  if (!todayHours.open || !todayHours.close) return false;
  
  const [openHour, openMinute] = todayHours.open.split(':').map(Number);
  const [closeHour, closeMinute] = todayHours.close.split(':').map(Number);
  
  // Convert times to minutes for easier comparison
  const currentTimeInMinutes = (currentHour * 60) + currentMinute;
  const openTimeInMinutes = (openHour * 60) + openMinute;
  const closeTimeInMinutes = (closeHour * 60) + closeMinute;
  
  // Check if current time is within opening & closing times
  return currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes;
};

/**
 * Format opening hours for display
 */
export const formatOpeningHours = (openingHours: OpeningHours | null, dayIndex?: number): string => {
  if (!openingHours || !Array.isArray(openingHours)) return "Hours not available";
  
  // If day is specified, return that day's hours
  if (dayIndex !== undefined) {
    const day = openingHours[dayIndex];
    if (!day || !day.isOpen) return "Closed";
    return `${day.open} - ${day.close}`;
  }
  
  // Otherwise return today's hours
  const today = new Date().getDay();
  const todayHours = openingHours[today];
  
  if (!todayHours || !todayHours.isOpen) return "Closed today";
  return `Today: ${todayHours.open} - ${todayHours.close}`;
};

/**
 * Get day name from index
 */
export const getDayName = (dayIndex: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex] || '';
};

/**
 * Get current day index
 */
export const getCurrentDayIndex = (): number => {
  return new Date().getDay();
};

// Alias for backward compatibility
export const isCurrentlyOpen = isOpenNow;
