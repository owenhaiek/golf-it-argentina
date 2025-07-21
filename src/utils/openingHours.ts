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
 * Get current date and time in Argentina timezone (UTC-3)
 */
const getArgentinaTime = (): Date => {
  const now = new Date();
  // Convert to Argentina time: UTC-3 (subtract 3 hours from UTC)
  const utcTime = now.getTime();
  const argentinaOffset = -3 * 60 * 60 * 1000; // -3 hours in milliseconds
  const argentinaTime = new Date(utcTime + argentinaOffset);
  
  console.log('🕒 Current UTC time:', now.toISOString());
  console.log('🇦🇷 Argentina time (UTC-3):', argentinaTime.toISOString());
  console.log('📅 Argentina day number:', argentinaTime.getUTCDay());
  
  return argentinaTime;
};

/**
 * Checks if a golf course is currently open based on its opening hours
 * This is the unified function that will be used across the app
 */
export const isCurrentlyOpen = (openingHours: OpeningHours | null): boolean => {
  if (!openingHours || !Array.isArray(openingHours)) return false;
  
  // Get current day in Argentina timezone (UTC-3)
  const argentinaTime = getArgentinaTime();
  const today = argentinaTime.getUTCDay(); // Use UTC methods since we already converted
  
  // Convert to our array index (0 = Monday, 6 = Sunday)
  const dayIndex = today === 0 ? 6 : today - 1;
  
  // Get current time in Argentina timezone
  const currentHour = argentinaTime.getUTCHours();
  const currentMinute = argentinaTime.getUTCMinutes();
  
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
  const argentinaTime = getArgentinaTime();
  const today = argentinaTime.getUTCDay();
  // Convert Sunday (0) to our array index (6)
  const adjustedDay = today === 0 ? 6 : today - 1;
  const todayHours = openingHours[adjustedDay];
  
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
  console.log('🚀 getCurrentDayIndex called at:', Date.now());
  
  const argentinaTime = getArgentinaTime();
  const today = argentinaTime.getUTCDay(); // Use UTC methods since we already converted
  
  console.log('🇦🇷 Argentina time:', argentinaTime.toISOString());
  console.log('📅 Argentina day (0=Sunday, 1=Monday, etc.):', today);
  
  // Convert Sunday (0) to our array index (6), Monday (1) to index (0), etc.
  const dayIndex = today === 0 ? 6 : today - 1;
  console.log('📊 Converted day index (0=Monday, 6=Sunday):', dayIndex);
  
  return dayIndex;
};
