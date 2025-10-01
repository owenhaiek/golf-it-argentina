import React, { useState, useEffect } from 'react';
import { X, Download, Plus, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface PWAInstallPromptProps {
  onDismiss?: () => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const checkPWACompatibility = () => {
      // Check if already installed as PWA
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone;
      
      if (isStandalone || isInWebAppiOS) {
        return false; // Already installed
      }

      // Check if dismissed before
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (dismissed) {
        const dismissedDate = new Date(dismissed);
        const now = new Date();
        const daysSinceDismissed = (now.getTime() - dismissedDate.getTime()) / (1000 * 3600 * 24);
        
        // Show again after 7 days
        if (daysSinceDismissed < 7) {
          return false;
        }
      }

      // Detect mobile platforms
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const iOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
      const android = /android/i.test(userAgent);
      
      setIsIOS(iOS);
      setIsAndroid(android);
      
      return iOS || android;
    };

    // Show prompt after a short delay to let the app load
    const timer = setTimeout(() => {
      if (checkPWACompatibility()) {
        setIsVisible(true);
      }
    }, 2000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Fallback for iOS or if no prompt available
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    onDismiss?.();
  };

  const getInstructions = () => {
    if (isIOS) {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Toca</span>
            <div className="inline-flex items-center justify-center w-6 h-6 border border-muted-foreground/30 rounded">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 10l5 5 5-5"/>
                <path d="M21 12H3"/>
              </svg>
            </div>
            <span>en tu navegador</span>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            Luego selecciona <span className="font-semibold text-foreground">"Añadir a pantalla de inicio"</span>
          </div>
        </div>
      );
    }
    
    if (isAndroid) {
      return (
        <div className="text-sm text-muted-foreground text-center">
          Toca en el menú de tu navegador y selecciona <span className="font-semibold text-foreground">"Añadir a pantalla de inicio"</span>
        </div>
      );
    }
    
    return null;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleDismiss}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-background border border-border rounded-2xl shadow-2xl overflow-hidden w-full max-w-sm">
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors z-10"
                aria-label="Cerrar"
              >
                <X size={20} className="text-muted-foreground" />
              </button>
              
              {/* Content */}
              <div className="p-6 pt-8 text-center">
                {/* App Icon */}
                <div className="mx-auto mb-6 w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                  <img
                    src="/lovable-uploads/3dc401b2-fdd6-4815-a300-aa3c9b61ed9d.png"
                    alt="GolfIt Logo"
                    className="w-12 h-12 object-contain"
                  />
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Instalar GolfIt Argentina
                </h3>
                
                {/* Description */}
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                  Añade esta app a tu pantalla de inicio para acceso rápido y una mejor experiencia.
                </p>
                
                {/* Install Button */}
                <Button 
                  onClick={handleInstall}
                  className="w-full mb-4 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl"
                >
                  <Smartphone className="w-5 h-5 mr-2" />
                  Añadir a Pantalla de Inicio
                </Button>
                
                {/* Simplified instructions */}
                <div className="bg-muted/30 rounded-xl p-4 mb-4">
                  <p className="text-sm text-muted-foreground text-center">
                    {isIOS ? (
                      <>
                        Toca el botón <span className="font-semibold text-foreground">compartir</span> en tu navegador y selecciona <span className="font-semibold text-foreground">"Añadir a pantalla de inicio"</span>
                      </>
                    ) : (
                      "Instala la app en tu teléfono para experimentar la aplicación completa."
                    )}
                  </p>
                </div>
                
                {/* Benefits */}
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Download size={12} />
                    <span>Acceso rápido</span>
                  </div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 border border-muted-foreground rounded-sm" />
                    <span>Pantalla completa</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;