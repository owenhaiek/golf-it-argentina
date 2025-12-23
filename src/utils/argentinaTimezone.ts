/**
 * Argentina Timezone Utilities
 * Centralized timezone handling for Argentina (America/Argentina/Buenos_Aires)
 */

/**
 * Get current day index in Argentina timezone
 * @returns {number} Day index where 0=Monday, 1=Tuesday, ..., 6=Sunday
 */
export const getArgentinaDayIndex = (): number => {
  console.log('=== ARGENTINA TIMEZONE DEBUG START ===');
  
  try {
    // Use Intl.DateTimeFormat to get the weekday in Argentina timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Argentina/Buenos_Aires',
      weekday: 'long'
    });
    
    const now = new Date();
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
    
    return dayIndex !== undefined ? dayIndex : 0; // Default to Monday if undefined
  } catch (error) {
    console.error('Error in Argentina timezone calculation:', error);
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
 * Get current time in Argentina timezone
 * @returns {object} Object with hour and minute in Argentina timezone
 */
export const getArgentinaTime = (): { hour: number; minute: number } => {
  try {
    // Get current time in Argentina timezone using Intl API
    const now = new Date();
    const timeFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const timeString = timeFormatter.format(now);
    const [hour, minute] = timeString.split(':').map(Number);
    
    return { hour, minute };
  } catch (error) {
    console.error('Error getting Argentina time:', error);
    // Fallback: Use simple UTC-3 offset
    const now = new Date();
    const utcHour = now.getUTCHours();
    const utcMinute = now.getUTCMinutes();
    const argentinaHour = utcHour - 3;
    
    // Adjust for negative hours (previous day)
    const adjustedHour = argentinaHour < 0 ? argentinaHour + 24 : argentinaHour;
    
    return { hour: adjustedHour, minute: utcMinute };
  }
};

/**
 * Get day name from index
 * @param {number} dayIndex - Day index where 0=Monday, 6=Sunday
 * @returns {string} Day name
 */
export const getDayName = (dayIndex: number): string => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days[dayIndex] || '';
};

/**
 * Parse a date string (YYYY-MM-DD) as a local date without timezone conversion issues
 * This prevents the common bug where dates appear one day off due to UTC parsing
 * @param {string} dateString - Date in format YYYY-MM-DD
 * @returns {Date} Date object set to local midnight
 */
export const parseLocalDate = (dateString: string): Date => {
  // Split the date string and create date with local timezone
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed in JS
};