
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Translation types
interface TranslationEntry {
  [language: string]: string;
}

interface Translations {
  [key: string]: {
    [key: string]: TranslationEntry;
  };
}

// Create the translations object with all app text
const translations: Translations = {
  // Common UI elements
  common: {
    home: {
      en: "Home",
      es: "Inicio"
    },
    add: {
      en: "Add",
      es: "Añadir"
    },
    profile: {
      en: "Profile",
      es: "Perfil"
    },
    settings: {
      en: "Settings",
      es: "Ajustes"
    },
    save: {
      en: "Save",
      es: "Guardar"
    },
    cancel: {
      en: "Cancel",
      es: "Cancelar"
    },
    delete: {
      en: "Delete",
      es: "Eliminar"
    },
    edit: {
      en: "Edit",
      es: "Editar"
    },
    view: {
      en: "View",
      es: "Ver"
    },
    close: {
      en: "Close",
      es: "Cerrar"
    },
    search: {
      en: "Search",
      es: "Buscar"
    },
    loading: {
      en: "Loading...",
      es: "Cargando..."
    },
    error: {
      en: "Error",
      es: "Error"
    },
    success: {
      en: "Success",
      es: "Éxito"
    }
  },
  // Home page
  home: {
    title: {
      en: "Welcome to GolfTracker",
      es: "Bienvenido a GolfTracker"
    },
    recentRounds: {
      en: "Recent Rounds",
      es: "Rondas Recientes"
    },
    nearbyCoursesTitle: {
      en: "Nearby Golf Courses",
      es: "Campos de Golf Cercanos"
    },
    golfCourses: {
      en: "Golf Courses",
      es: "Campos de Golf"
    },
    noCoursesFound: {
      en: "No courses found matching your criteria",
      es: "No se encontraron campos que coincidan con tus criterios"
    },
    resetFilters: {
      en: "Reset filters",
      es: "Restablecer filtros"
    },
    noImageAvailable: {
      en: "No image available",
      es: "Imagen no disponible"
    },
    openNow: {
      en: "Open now",
      es: "Abierto ahora"
    },
    closed: {
      en: "Closed",
      es: "Cerrado"
    },
    today: {
      en: "Today:",
      es: "Hoy:"
    },
    hoursNotAvailable: {
      en: "Hours not available",
      es: "Horario no disponible"
    }
  },
  // Add Round page
  addRound: {
    title: {
      en: "Add Round Score",
      es: "Añadir Puntuación de Ronda"
    },
    selectCourse: {
      en: "Select Course",
      es: "Seleccionar Campo"
    },
    searchPlaceholder: {
      en: "Search for a course...",
      es: "Buscar un campo..."
    },
    par: {
      en: "Par",
      es: "Par"
    },
    openNow: {
      en: "Open now",
      es: "Abierto ahora"
    },
    noCoursesFound: {
      en: "No courses found",
      es: "No se encontraron campos"
    },
    saveRound: {
      en: "Save Round",
      es: "Guardar Ronda"
    },
    saving: {
      en: "Saving...",
      es: "Guardando..."
    },
    selectCourseError: {
      en: "Please select a course",
      es: "Por favor selecciona un campo"
    },
    loginError: {
      en: "You must be logged in to save a round",
      es: "Debes iniciar sesión para guardar una ronda"
    },
    saveSuccess: {
      en: "Round saved successfully!",
      es: "¡Ronda guardada con éxito!"
    }
  },
  // Profile page
  profile: {
    title: {
      en: "Your Profile",
      es: "Tu Perfil"
    },
    handicap: {
      en: "Handicap",
      es: "Hándicap"
    },
    roundsPlayed: {
      en: "Rounds Played",
      es: "Rondas Jugadas"
    },
    avgScore: {
      en: "Avg. Score",
      es: "Punt. Media"
    },
    bestRound: {
      en: "Best Round",
      es: "Mejor Ronda"
    },
    recentRounds: {
      en: "Recent Rounds",
      es: "Rondas Recientes"
    },
    yourRecentRounds: {
      en: "Your Recent Rounds",
      es: "Tus Rondas Recientes" 
    },
    noRounds: {
      en: "No rounds played yet",
      es: "Aún no has jugado rondas"
    },
    deleteRoundSuccess: {
      en: "Round deleted successfully",
      es: "Ronda eliminada con éxito"
    },
    deleteRoundDescription: {
      en: "The round has been removed from your history",
      es: "La ronda ha sido eliminada de tu historial"
    },
    deleteRoundError: {
      en: "Error deleting round",
      es: "Error al eliminar ronda"
    },
    noRoundsRecorded: {
      en: "No rounds recorded yet",
      es: "Aún no hay rondas registradas"
    },
    addFirstRound: {
      en: "Add Your First Round",
      es: "Añade Tu Primera Ronda"
    },
    fullName: {
      en: "Full Name",
      es: "Nombre Completo"
    },
    username: {
      en: "Username",
      es: "Nombre de Usuario"
    },
    noHandicapYet: {
      en: "No handicap yet",
      es: "Aún sin hándicap"
    },
    anonymous: {
      en: "Anonymous",
      es: "Anónimo"
    },
    saveChanges: {
      en: "Save Changes",
      es: "Guardar Cambios"
    },
    saving: {
      en: "Saving...",
      es: "Guardando..."
    },
    logout: {
      en: "Logout",
      es: "Cerrar Sesión"
    },
    totalScore: {
      en: "Total Score",
      es: "Puntuación Total"
    },
    holes: {
      en: "holes",
      es: "hoyos"
    },
    underPar: {
      en: "under par",
      es: "bajo par"
    },
    overPar: {
      en: "over par",
      es: "sobre par"
    },
    atPar: {
      en: "at par",
      es: "en par"
    },
    deleteRound: {
      en: "Delete Round",
      es: "Eliminar Ronda"
    },
    deleteRoundConfirm: {
      en: "Are you sure you want to delete this round? This action cannot be undone and will affect your handicap calculation.",
      es: "¿Estás seguro de que quieres eliminar esta ronda? Esta acción no se puede deshacer y afectará al cálculo de tu hándicap."
    },
    deleting: {
      en: "Deleting...",
      es: "Eliminando..."
    },
    profileUpdateSuccess: {
      en: "Profile updated successfully",
      es: "Perfil actualizado con éxito"
    },
    profileUpdateError: {
      en: "Failed to update profile",
      es: "Error al actualizar el perfil"
    },
    logoutError: {
      en: "Error logging out",
      es: "Error al cerrar sesión"
    },
    logoutSuccess: {
      en: "Logged out successfully",
      es: "Sesión cerrada con éxito"
    },
    logoutConfirm: {
      en: "Are you sure you want to log out? You will need to sign in again to access your account.",
      es: "¿Estás seguro de que quieres cerrar sesión? Tendrás que volver a iniciar sesión para acceder a tu cuenta."
    }
  },
  // Auth page
  auth: {
    welcomeBack: {
      en: "Welcome back",
      es: "Bienvenido de nuevo"
    },
    createAccount: {
      en: "Create an account",
      es: "Crear una cuenta"
    },
    emailSignInDescription: {
      en: "Enter your email to sign in to your account",
      es: "Introduce tu email para iniciar sesión en tu cuenta"
    },
    emailSignUpDescription: {
      en: "Enter your email below to create your account",
      es: "Introduce tu email a continuación para crear tu cuenta"
    },
    email: {
      en: "Email",
      es: "Email"
    },
    password: {
      en: "Password",
      es: "Contraseña"
    },
    signIn: {
      en: "Sign in",
      es: "Iniciar sesión"
    },
    signUp: {
      en: "Sign up",
      es: "Registrarse"
    },
    needAccount: {
      en: "Need an account? Sign up",
      es: "¿Necesitas una cuenta? Regístrate"
    },
    haveAccount: {
      en: "Already have an account? Sign in",
      es: "¿Ya tienes una cuenta? Inicia sesión"
    },
    checkEmail: {
      en: "Check your email",
      es: "Revisa tu email"
    },
    confirmationEmailSent: {
      en: "We sent you a confirmation link to complete your registration.",
      es: "Te hemos enviado un enlace de confirmación para completar tu registro."
    }
  },
  // Course Details page
  course: {
    about: {
      en: "About",
      es: "Acerca de"
    },
    courseDetails: {
      en: "Course Details",
      es: "Detalles del Campo"
    },
    hours: {
      en: "Hours",
      es: "Horario"
    },
    open: {
      en: "Open Now",
      es: "Abierto Ahora"
    },
    closed: {
      en: "Closed",
      es: "Cerrado"
    },
    location: {
      en: "Location",
      es: "Ubicación"
    },
    contact: {
      en: "Contact",
      es: "Contacto"
    },
    website: {
      en: "Website",
      es: "Sitio Web"
    },
    visitWebsite: {
      en: "Visit website",
      es: "Visitar sitio web"
    },
    holes: {
      en: "holes",
      es: "hoyos"
    },
    par: {
      en: "Par",
      es: "Par"
    },
    hoursNotAvailable: {
      en: "Hours not available",
      es: "Horario no disponible"
    }
  }
};

// Language context type
type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  t: (section: string, key: string) => string;
};

// Create the context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: () => '',
});

// Hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

// Provider component
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Initialize language from localStorage or default to 'en'
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  // Update language in localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Function to set the language
  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  // Translation function
  const t = (section: string, key: string): string => {
    try {
      return translations[section][key][language] || `${section}.${key}`;
    } catch (error) {
      console.warn(`Translation missing: ${section}.${key} for language ${language}`);
      return `${section}.${key}`;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
