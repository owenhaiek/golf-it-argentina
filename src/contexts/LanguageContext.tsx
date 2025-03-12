
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Translation types
interface Translations {
  [key: string]: {
    [key: string]: string;
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
  // Settings translations are already in the Settings.tsx file
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
