import { createContext, useContext, useState, ReactNode } from "react";

// Define language types
type LanguageType = "en" | "es";

// Dictionary type for translations
interface TranslationDictionary {
  [key: string]: {
    [key: string]: string;
  };
}

// Translations for English and Spanish
const translations: Record<LanguageType, TranslationDictionary> = {
  en: {
    common: {
      search: "Search",
      filter: "Filter",
      home: "Home",
      profile: "Profile",
      settings: "Settings",
      cancel: "Cancel",
      submit: "Submit",
      create: "Create",
      edit: "Edit",
      delete: "Delete",
      save: "Save",
      back: "Back",
      next: "Next",
      done: "Done",
      welcome: "Welcome",
      loading: "Loading...",
      players: "Players",
      error: "Error"
    },
    auth: {
      signIn: "Sign In",
      signUp: "Sign Up",
      email: "Email",
      password: "Password",
      forgotPassword: "Forgot Password?",
      alreadyHaveAccount: "Already have an account?",
      dontHaveAccount: "Don't have an account?",
      haveAccount: "Already have an account? Sign In",
      createAccount: "Create Account",
      or: "OR",
      continueWithGoogle: "Continue with Google",
      continueWithApple: "Continue with Apple",
      orContinueWith: "Or continue with",
      welcomeBack: "Welcome Back",
      emailSignInDescription: "Enter your email to sign in to your account",
      emailSignUpDescription: "Enter your email to create your account",
      checkEmail: "Check your email",
      confirmationEmailSent: "A confirmation email has been sent"
    },
    home: {
      featuredCourses: "Featured Courses",
      exploreAll: "Explore All",
      nearbyGolfCourses: "Nearby Golf Courses",
      viewAll: "View All",
      upcomingReservations: "Upcoming Reservations",
      noReservations: "You don't have any reservations yet.",
      searchCourses: "Search Courses",
      golfCourses: "Golf Courses",
      noCoursesFound: "No courses found",
      resetFilters: "Reset Filters",
      openNow: "Open Now",
      closed: "Closed"
    },
    course: {
      holes: "Holes",
      par: "Par",
      openNow: "Open Now",
      closed: "Closed",
      hours: "Hours",
      address: "Address",
      contact: "Contact",
      website: "Website",
      directions: "Get Directions",
      description: "Description",
      reviews: "Reviews",
      photos: "Photos",
    },
    profile: {
      yourProfile: "Your Profile",
      handicap: "Handicap",
      viewStats: "View Stats",
      roundsPlayed: "Rounds Played",
      avgScore: "Average Score",
      bestScore: "Best Score",
      yourRecentRounds: "Your Recent Rounds",
      noRounds: "You haven't recorded any rounds yet.",
      addRound: "Add Round",
      account: "Account",
      holes: "Holes"
    },
    filters: {
      showFavorites: "Show Favorites",
      numberOfHoles: "Number of Holes",
      status: "Status",
      favoritesOnly: "Favorites Only",
      currentlyOpen: "Currently Open",
      all: "All",
      showOnlyFavorites: "Show only your favorite courses",
      showAllCourses: "Show all courses including favorites",
      showOnlyOpen: "Show only open courses",
      showAllStatus: "Show all courses regardless of status"
    },
    addRound: {
      title: "Add Your Round",
      selectCourse: "Select Course",
      saveRound: "Save Round",
      saving: "Saving...",
      saveSuccess: "Round saved successfully!",
      selectCourseError: "Please select a course",
      loginError: "Please log in to add a round"
    },
    rounds: {
      addRound: "Add Round",
      selectCourse: "Select Course",
      date: "Date",
      score: "Score",
      notes: "Notes",
      searchCourses: "Search courses...",
      noCoursesFound: "No courses found",
      courseSearchPlaceholder: "Type to search for a course...",
      roundAdded: "Round added successfully",
      roundAddedDesc: "Your golf round has been saved.",
      courseRequired: "Please select a course",
      scoreRequired: "Please enter your score",
      dateRequired: "Please select a date",
      hole: "Hole",
      par: "Par",
      strokes: "Strokes",
      addShots: "Add Shots",
    },
    reservations: {
      bookTeeTime: "Book Tee Time",
      date: "Date",
      time: "Time",
      players: "Players",
      bookingDetails: "Booking Details",
      confirmBooking: "Confirm Booking",
      bookingConfirmed: "Booking Confirmed",
      bookingFailed: "Booking Failed",
      upcoming: "Upcoming",
      past: "Past",
      cancelReservation: "Cancel Reservation",
      myReservations: "My Reservations",
      noReservations: "No reservations found"
    }
  },
  es: {
    common: {
      search: "Buscar",
      filter: "Filtrar",
      home: "Inicio",
      profile: "Perfil",
      settings: "Ajustes",
      cancel: "Cancelar",
      submit: "Enviar",
      create: "Crear",
      edit: "Editar",
      delete: "Eliminar",
      save: "Guardar",
      back: "Atrás",
      next: "Siguiente",
      done: "Hecho",
      welcome: "Bienvenido",
      loading: "Cargando...",
      players: "Jugadores",
      error: "Error"
    },
    auth: {
      signIn: "Iniciar Sesión",
      signUp: "Registrarse",
      email: "Correo electrónico",
      password: "Contraseña",
      forgotPassword: "¿Olvidaste tu contraseña?",
      alreadyHaveAccount: "¿Ya tienes una cuenta?",
      dontHaveAccount: "¿No tienes una cuenta?",
      haveAccount: "¿Ya tienes cuenta? Iniciar Sesión",
      createAccount: "Crear Cuenta",
      or: "O",
      continueWithGoogle: "Continuar con Google",
      continueWithApple: "Continuar con Apple",
      orContinueWith: "O continuar con",
      welcomeBack: "Bienvenido de Vuelta",
      emailSignInDescription: "Ingresa tu correo para iniciar sesión",
      emailSignUpDescription: "Ingresa tu correo para crear tu cuenta",
      checkEmail: "Revisa tu correo",
      confirmationEmailSent: "Se ha enviado un correo de confirmación"
    },
    home: {
      featuredCourses: "Campos Destacados",
      exploreAll: "Explorar Todo",
      nearbyGolfCourses: "Campos de Golf Cercanos",
      viewAll: "Ver Todo",
      upcomingReservations: "Reservas Próximas",
      noReservations: "Aún no tienes reservaciones.",
      searchCourses: "Buscar Campos",
      golfCourses: "Campos de Golf",
      noCoursesFound: "No se encontraron campos",
      resetFilters: "Restablecer Filtros",
      openNow: "Abierto Ahora",
      closed: "Cerrado"
    },
    course: {
      holes: "Hoyos",
      par: "Par",
      openNow: "Abierto Ahora",
      closed: "Cerrado",
      hours: "Horario",
      address: "Dirección",
      contact: "Contacto",
      website: "Sitio Web",
      directions: "Cómo Llegar",
      description: "Descripción",
      reviews: "Reseñas",
      photos: "Fotos",
    },
    profile: {
      yourProfile: "Tu Perfil",
      handicap: "Hándicap",
      viewStats: "Ver Estadísticas",
      roundsPlayed: "Rondas Jugadas",
      avgScore: "Puntuación Media",
      bestScore: "Mejor Puntuación",
      yourRecentRounds: "Tus Rondas Recientes",
      noRounds: "Aún no has registrado ninguna ronda.",
      addRound: "Añadir Ronda",
      account: "Cuenta",
      holes: "Hoyos"
    },
    filters: {
      showFavorites: "Mostrar Canchas Favoritas",
      numberOfHoles: "Cantidad de Hoyos",
      status: "Estado",
      favoritesOnly: "Solo Favoritas",
      currentlyOpen: "Actualmente Abierto",
      all: "Todas",
      showOnlyFavorites: "Mostrar solo tus canchas favoritas",
      showAllCourses: "Mostrar todas las canchas incluyendo favoritas",
      showOnlyOpen: "Mostrar solo canchas abiertas",
      showAllStatus: "Mostrar todas las canchas sin importar el estado"
    },
    addRound: {
      title: "Agrega tu ronda",
      selectCourse: "Seleccionar Campo",
      saveRound: "Guardar Ronda",
      saving: "Guardando...",
      saveSuccess: "¡Ronda guardada exitosamente!",
      selectCourseError: "Por favor selecciona un campo",
      loginError: "Por favor inicia sesión para agregar una ronda"
    },
    rounds: {
      addRound: "Añadir Ronda",
      selectCourse: "Seleccionar Campo",
      date: "Fecha",
      score: "Puntuación",
      notes: "Notas",
      searchCourses: "Buscar campos...",
      noCoursesFound: "No se encontraron campos",
      courseSearchPlaceholder: "Escribe para buscar un campo...",
      roundAdded: "Ronda añadida con éxito",
      roundAddedDesc: "Tu ronda de golf ha sido guardada.",
      courseRequired: "Por favor selecciona un campo",
      scoreRequired: "Por favor ingresa tu puntuación",
      dateRequired: "Por favor selecciona una fecha",
      hole: "Hoyo",
      par: "Par",
      strokes: "Golpes",
      addShots: "Añadir Tiros",
    },
    reservations: {
      bookTeeTime: "Reservar Horario",
      date: "Fecha",
      time: "Hora",
      players: "Jugadores",
      bookingDetails: "Detalles de la Reserva",
      confirmBooking: "Confirmar Reserva",
      bookingConfirmed: "Reserva Confirmada",
      bookingFailed: "Error en la Reserva",
      upcoming: "Próximas",
      past: "Pasadas",
      cancelReservation: "Cancelar Reserva",
      myReservations: "Mis Reservas",
      noReservations: "No se encontraron reservas"
    }
  }
};

// Create context for language
interface LanguageContextType {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  t: (section: string, key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: () => "",
});

// Hook for accessing the language context
export const useLanguage = () => useContext(LanguageContext);

// Language provider component
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<LanguageType>(() => {
    const savedLanguage = localStorage.getItem("language");
    return (savedLanguage as LanguageType) || "es";
  });

  // Save language preference to localStorage when it changes
  const handleSetLanguage = (lang: LanguageType) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  // Translation function
  const t = (section: string, key: string): string => {
    try {
      return translations[language][section][key] || key;
    } catch (error) {
      console.warn(`Translation missing: ${section}.${key}`);
      return key;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
