import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Crown, Check, Trophy, Swords, Flag, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Capacitor } from "@capacitor/core";
import { purchasePackage } from "@/services/revenueCat";
import { toast } from "sonner";

const Subscription = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { offerings, isPremium, refreshSubscription, setWebPremiumStatus } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async (packageToPurchase?: any) => {
    if (!Capacitor.isNativePlatform()) {
      // Web demo - simulate purchase
      setWebPremiumStatus(true);
      toast.success(language === "en" ? "Premium activated!" : "¡Premium activado!");
      navigate(-1);
      return;
    }

    if (!packageToPurchase) {
      toast.error(language === "en" ? "No package available" : "No hay paquete disponible");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await purchasePackage(packageToPurchase);
      if (result) {
        toast.success(language === "en" ? "Purchase successful!" : "¡Compra exitosa!");
        refreshSubscription();
        navigate(-1);
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error(language === "en" ? "Purchase failed" : "Error en la compra");
    } finally {
      setIsProcessing(false);
    }
  };

  const premiumFeatures = [
    {
      icon: Trophy,
      title: language === "en" ? "Create Tournaments" : "Crear Torneos",
      description: language === "en" 
        ? "Organize tournaments with friends and track standings" 
        : "Organiza torneos con amigos y sigue la clasificación"
    },
    {
      icon: Star,
      title: language === "en" ? "Detailed Statistics" : "Estadísticas Detalladas",
      description: language === "en" 
        ? "Access advanced analytics and performance insights" 
        : "Accede a análisis avanzados e insights de rendimiento"
    },
    {
      icon: Zap,
      title: language === "en" ? "Priority Support" : "Soporte Prioritario",
      description: language === "en" 
        ? "Get faster help when you need it" 
        : "Obtén ayuda más rápida cuando la necesites"
    }
  ];

  const freeFeatures = [
    {
      icon: Flag,
      title: language === "en" ? "Add Rounds" : "Añadir Rondas",
      description: language === "en" 
        ? "Track all your golf rounds" 
        : "Registra todas tus rondas de golf"
    },
    {
      icon: Swords,
      title: language === "en" ? "Challenge Friends" : "Desafiar Amigos",
      description: language === "en" 
        ? "Create 1v1 matches with friends" 
        : "Crea partidos 1v1 con amigos"
    }
  ];

  // Get the monthly package from offerings if available
  const monthlyPackage = offerings?.current?.availablePackages?.find(
    (pkg: any) => pkg.packageType === 'MONTHLY'
  ) || offerings?.current?.availablePackages?.[0];

  if (isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-background">
        <div className="p-4 bg-background/20 backdrop-blur-lg border-b border-white/10">
          <div className="flex items-center gap-3 max-w-2xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="h-10 w-10 p-0 rounded-full text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold text-white">
              {language === "en" ? "Subscription" : "Suscripción"}
            </h1>
          </div>
        </div>

        <div className="p-6 max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-6"
          >
            <Crown className="h-12 w-12 text-white" />
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-2">
            {language === "en" ? "You're Premium!" : "¡Eres Premium!"}
          </h2>
          <p className="text-white/70">
            {language === "en" 
              ? "Enjoy all premium features" 
              : "Disfruta de todas las funciones premium"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-background">
      {/* Header */}
      <div className="p-4 bg-background/20 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-10 w-10 p-0 rounded-full text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-white">
            {language === "en" ? "Go Premium" : "Hazte Premium"}
          </h1>
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-8 pb-32">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-4"
          >
            <Crown className="h-10 w-10 text-white" />
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-2">
            {language === "en" ? "Unlock Premium Features" : "Desbloquea Funciones Premium"}
          </h2>
          <p className="text-white/70">
            {language === "en" 
              ? "Take your golf game to the next level" 
              : "Lleva tu juego de golf al siguiente nivel"}
          </p>
        </motion.div>

        {/* Premium Features */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
            {language === "en" ? "Premium Features" : "Funciones Premium"}
          </h3>
          {premiumFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-start gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10"
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                <feature.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-white">{feature.title}</h4>
                <p className="text-sm text-white/70">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Free Features */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
            {language === "en" ? "Free Features" : "Funciones Gratis"}
          </h3>
          {freeFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5"
            >
              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="h-5 w-5 text-white/70" />
              </div>
              <div className="flex items-center gap-2 flex-1">
                <div>
                  <h4 className="font-semibold text-white/80">{feature.title}</h4>
                  <p className="text-sm text-white/50">{feature.description}</p>
                </div>
                <Check className="h-5 w-5 text-primary ml-auto" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-red-950 via-red-950 to-transparent pt-8 pb-[calc(1rem+var(--safe-area-bottom))]">
        <div className="max-w-2xl mx-auto space-y-3">
          <Button
            onClick={() => handlePurchase(monthlyPackage)}
            disabled={isProcessing}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold text-lg shadow-lg shadow-amber-500/25"
          >
            {isProcessing ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <Crown className="h-5 w-5 mr-2" />
                {language === "en" ? "Get Premium" : "Obtener Premium"}
              </>
            )}
          </Button>
          <p className="text-center text-white/50 text-sm">
            {language === "en" 
              ? "Cancel anytime • Restore purchases in settings" 
              : "Cancela cuando quieras • Restaura compras en ajustes"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
