
import { OpeningHours, defaultOpeningHours } from "./openingHours";

/**
 * Validates and sanitizes opening hours data
 */
export const validateOpeningHours = (data: any): OpeningHours => {
  // If data is null or undefined, return defaults
  if (!data) {
    console.log('Opening hours data is null/undefined, using defaults');
    return defaultOpeningHours;
  }

  let parsedData: any;

  // Parse string data
  if (typeof data === 'string') {
    try {
      parsedData = JSON.parse(data);
    } catch (error) {
      console.error('Error parsing opening hours string:', error);
      return defaultOpeningHours;
    }
  } else {
    parsedData = data;
  }

  // Validate structure
  if (!Array.isArray(parsedData) || parsedData.length !== 7) {
    console.warn('Opening hours is not a valid 7-day array, using defaults');
    return defaultOpeningHours;
  }

  // Validate each day structure and sanitize
  const validatedData = parsedData.map((day, index) => {
    if (!day || typeof day !== 'object') {
      console.warn(`Day ${index} is invalid, using default`);
      return defaultOpeningHours[index];
    }

    // Ensure required properties exist
    const isOpen = Boolean(day.isOpen);
    let open = day.open;
    let close = day.close;

    // Sanitize time values
    if (!isOpen) {
      open = null;
      close = null;
    } else {
      // Ensure times are valid strings when day is open
      if (!open || typeof open !== 'string' || open.trim() === '' || open === 'null') {
        open = defaultOpeningHours[index].open;
      }
      if (!close || typeof close !== 'string' || close.trim() === '' || close === 'null') {
        close = defaultOpeningHours[index].close;
      }
    }

    return {
      isOpen,
      open,
      close
    };
  });

  console.log('Validated opening hours:', validatedData);
  return validatedData as OpeningHours;
};

/**
 * Prepares opening hours data for saving to database
 */
export const prepareOpeningHoursForSave = (openingHours: OpeningHours): string => {
  const sanitized = openingHours.map(day => ({
    isOpen: Boolean(day.isOpen),
    open: day.isOpen && day.open ? day.open : null,
    close: day.isOpen && day.close ? day.close : null
  }));

  return JSON.stringify(sanitized);
};
