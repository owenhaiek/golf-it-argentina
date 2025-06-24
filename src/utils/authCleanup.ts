
// Utility function to clean up authentication state
export const cleanupAuthState = () => {
  console.log('Starting auth state cleanup...');
  
  // Clear standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      console.log('Removing localStorage key:', key);
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      console.log('Removing sessionStorage key:', key);
      sessionStorage.removeItem(key);
    }
  });
  
  console.log('Auth state cleanup completed');
};

// Function to handle OAuth session recovery
export const recoverOAuthSession = async () => {
  try {
    console.log('Attempting OAuth session recovery...');
    
    // Check if we have a valid session stored
    const storedSession = localStorage.getItem('supabase.auth.token');
    
    if (storedSession) {
      console.log('Found stored session, validating...');
      return true;
    }
    
    console.log('No stored session found');
    return false;
  } catch (error) {
    console.error('Error during OAuth session recovery:', error);
    return false;
  }
};
