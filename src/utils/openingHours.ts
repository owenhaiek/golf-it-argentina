type DayOpeningHours = {
  isOpen: boolean;
  open: string | null;
  close: string | null;
};

export type OpeningHours = DayOpeningHours[];

// Define default opening hours (9AM-5PM on weekdays, 10AM-3PM on weekends)
export const defaultOpeningHours: OpeningHours = [
  { isOpen: true, open: "09:00", close: "17:00" }, // Monday
  { isOpen: true, open: "09:00", close: "17:00" }, // Tuesday
  { isOpen: true, open: "09:00", close: "17:00" }, // Wednesday
  { isOpen: true, open: "09:00", close: "17:00" }, // Thursday
  { isOpen: true, open: "09:00", close: "17:00" }, // Friday
  { isOpen: true, open: "10:00", close: "15:00" }, // Saturday
  { isOpen: true, open: "10:00", close: "15:00" }  // Sunday
];

// Format opening hours for display as a string
export const formatOpeningHoursForDisplay = (openingHours: OpeningHours | null): string => {
  if (!openingHours || !Array.isArray(openingHours)) return "Hours not available";
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  let result = "";
  
  openingHours.forEach((day, index) => {
    if (day && day.isOpen && day.open && day.close) {
      result += `${days[index]}: ${day.open} - ${day.close}\n`;
    } else {
      result += `${days[index]}: Closed\n`;
    }
  });
  
  return result.trim();
};

/**
 * Get current day index in Argentina timezone - RELIABLE VERSION
 */
const getArgentinaDayIndex = (): number => {
  console.log('=== ARGENTINA TIMEZONE DEBUG START ===');
  
  try {
    // Create a new Date object and get the day in Argentina timezone
    const now = new Date();
    
    // Use Intl.DateTimeFormat to get the day in Argentina timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Argentina/Buenos_Aires',
      weekday: 'long'
    });
    
    const argentinaWeekday = formatter.format(now);
    console.log('Argentina weekday:', argentinaWeekday);
    
    // Map weekday names to our array indices (0=Monday, 6=Sunday)
    const weekdayMap: { [key: string]: number } = {
      'Monday': 0,
      'Tuesday': 1, 
      'Wednesday': 2,
      'Thursday': 3,
      'Friday': 4,
      'Saturday': 5,
      'Sunday': 6
    };
    
    const dayIndex = weekdayMap[argentinaWeekday];
    console.log('Final day index (0=Monday, 6=Sunday):', dayIndex);
    console.log('=== ARGENTINA TIMEZONE DEBUG END ===');
    
    return dayIndex;
  } catch (error) {
    console.error('Error in timezone calculation:', error);
    // Fallback: Use simple UTC-3 offset
    const now = new Date();
    const utcHour = now.getUTCHours();
    const argentinaHour = utcHour - 3;
    
    let argentinaDay = now.getUTCDay();
    if (argentinaHour < 0) {
      argentinaDay = argentinaDay === 0 ? 6 : argentinaDay - 1;
    }
    
    const dayIndex = argentinaDay === 0 ? 6 : argentinaDay - 1;
    return dayIndex;
  }
};

/**
 * Checks if a golf course is currently open based on its opening hours
 * This is the unified function that will be used across the app
 */
export const isCurrentlyOpen = (openingHours: OpeningHours | null): boolean => {
  if (!openingHours || !Array.isArray(openingHours)) return false;
  
  // Get current day in Argentina timezone
  const dayIndex = getArgentinaDayIndex();
  
  try {
    // Get current time in Argentina timezone using Intl API
    const argentinaTime = new Date().toLocaleString("en-CA", {
      timeZone: "America/Argentina/Buenos_Aires",
      hour12: false
    });
    
    // Parse the time part (HH:MM:SS)
    const timePart = argentinaTime.split(', ')[1] || argentinaTime.split(' ')[1];
    const [currentHour, currentMinute] = timePart.split(':').map(Number);
    
    // Get today's opening hours
    const todayHours = openingHours[dayIndex];
    
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
  } catch (error) {
    console.error('Error in time calculation:', error);
    return false;
  }
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
  
  // Otherwise return today's hours in Argentina timezone
  const todayIndex = getArgentinaDayIndex();
  const todayHours = openingHours[todayIndex];
  
  if (!todayHours || !todayHours.isOpen) return "Closed today";
  return `Today: ${todayHours.open} - ${todayHours.close}`;
};

/**
 * Get day name from index
 */
export const getDayName = (dayIndex: number): string => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days[dayIndex] || '';
};

/**
 * Get current day index in Argentina timezone
 */
export const getCurrentDayIndex = (): number => {
  console.log('🚀 getCurrentDayIndex called - BASIC VERSION');
  console.log('Function exists and is being called');
  return getArgentinaDayIndex();
};
