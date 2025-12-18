import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";
import { getPasswordStrength } from "@/utils/security";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Las contraseñas no coinciden",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth?confirmed=true`,
          },
        });
        if (error) throw error;
        toast({
          title: t("auth", "checkEmail"),
          description: t("auth", "confirmationEmailSent"),
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("common", "error"),
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth?provider=google`
        }
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("common", "error"),
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Try Supabase native email first
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        console.log('Supabase email failed, trying backup service:', error.message);
        
        // Use edge function with Admin API to generate proper recovery link
        const backupResponse = await supabase.functions.invoke('send-password-reset', {
          body: {
            email: email,
            redirectUrl: `${window.location.origin}/reset-password`
          }
        });
        
        if (backupResponse.error) {
          console.error('Backup email service error:', backupResponse.error);
          
          let errorMessage = 'No se pudo enviar el correo electrónico.';
          
          if (backupResponse.error.message?.includes('domain')) {
            errorMessage = 'El dominio de correo no está verificado. Por favor contacta al administrador.';
          } else if (backupResponse.error.message?.includes('API key')) {
            errorMessage = 'Error de configuración del servicio de correo. Por favor contacta al soporte.';
          } else if (backupResponse.error.message?.includes('rate limit')) {
            errorMessage = 'Demasiados intentos. Por favor espera unos minutos antes de volver a intentar.';
          } else if (backupResponse.error.message?.includes('non-2xx')) {
            errorMessage = 'El servicio de correo está temporalmente no disponible. Por favor intenta más tarde.';
          }
          
          throw new Error(errorMessage);
        }
        
        if (!backupResponse.data?.success) {
          console.error('Backup email service failed:', backupResponse.data);
          throw new Error('El servicio de correo de respaldo falló. Por favor contacta al soporte.');
        }
      }
      
      toast({
        title: "Email de Recuperación Enviado",
        description: "Revisa tu correo electrónico para las instrucciones de recuperación de contraseña.",
      });
      
      setShowForgotPassword(false);
    } catch (error: any) {
      console.error('Password reset error:', error);
      let errorMessage = error.message;
      
      if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Tu cuenta no ha sido confirmada. Por favor revisa tu correo electrónico.';
      } else if (error.message.includes('User not found')) {
        errorMessage = 'No se encontró una cuenta con este correo electrónico.';
      } else if (error.message.includes('domain not verified') || error.message.includes('domain')) {
        errorMessage = 'Error de configuración del dominio de correo. Por favor contacta al soporte.';
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Demasiados intentos. Por favor espera unos minutos antes de volver a intentar.';
      } else if (error.message.includes('API key') || error.message.includes('configuration')) {
        errorMessage = 'Error de configuración del servicio de correo. Por favor contacta al soporte.';
      } else if (error.message.includes('Email service') || error.message.includes('temporarily unavailable')) {
        errorMessage = 'El servicio de correo electrónico no está disponible temporalmente. Por favor contacta al soporte.';
      } else if (error.message.includes('SMTP') || error.message.includes('smtp')) {
        errorMessage = 'Error de configuración del servidor de correo. Por favor contacta al soporte.';
      }
      
      toast({
        variant: "destructive",
        title: "Error al Enviar Email",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      const confirmed = urlParams.get('confirmed');
      const provider = urlParams.get('provider');
      const reset = urlParams.get('reset');
      
      // Check for OAuth tokens in hash (from Google callback)
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (confirmed === 'true') {
        toast({
          title: t("auth", "emailConfirmed") || "Email Confirmed",
          description: t("auth", "accountConfirmed") || "Your account has been confirmed. You can now sign in.",
        });
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      // Handle OAuth callback with tokens in hash
      if (accessToken && refreshToken) {
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (error) {
            console.error('Error setting session:', error);
            toast({
              variant: "destructive",
              title: "Error de autenticación",
              description: "No se pudo completar el inicio de sesión.",
            });
          } else if (data.session) {
            window.history.replaceState({}, document.title, window.location.pathname);
            navigate("/");
            return;
          }
        } catch (err) {
          console.error('OAuth callback error:', err);
        }
      }
      
      // Fallback: check if provider=google and session exists
      if (provider === 'google') {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate("/");
          return;
        }
      }
      
      if (reset === 'true') {
        toast({
          title: "Password Reset",
          description: "You can now enter a new password.",
        });
        setIsLogin(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };
    
    handleAuthCallback();
  }, [navigate, toast, t]);

  React.useEffect(() => {
    setConfirmPassword("");
  }, [isLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-zinc-950 to-zinc-950" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md space-y-8 relative z-10"
      >
        {/* Logo Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col items-center"
        >
          <div className="w-24 h-24 mb-4">
            <img 
              src="/lovable-uploads/0f8f9459-f386-41e8-a1f0-1466dcce96cc.png" 
              alt="Golf Flag" 
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>
          <h1 className="text-5xl font-bebas tracking-widest text-white">
            GOLFIT
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Tu compañero de golf
          </p>
        </motion.div>

        {/* Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl shadow-black/50"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-white">
              {showForgotPassword 
                ? "Recuperar Contraseña" 
                : (isLogin ? "Iniciar Sesión" : "Crear Cuenta")}
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              {showForgotPassword
                ? "Te enviaremos un email para recuperar tu contraseña"
                : (isLogin
                  ? "Ingresa tus credenciales para continuar"
                  : "Completa tus datos para registrarte")}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={showForgotPassword ? handleForgotPassword : handleSubmit} className="space-y-4">
            <div className="space-y-3">
              {/* Email Input */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <Input
                  type="email"
                  placeholder={t("auth", "email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-11 h-12 bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                />
              </div>
              
              {/* Password Input */}
              {!showForgotPassword && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative"
                >
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                  <Input
                    type="password"
                    placeholder={t("auth", "password")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`pl-11 h-12 bg-zinc-800/50 text-white placeholder:text-zinc-500 rounded-xl transition-all duration-300 ${
                      !isLogin && passwordsMatch
                        ? 'border-emerald-500/70 focus:border-emerald-500 focus:ring-emerald-500/20'
                        : 'border-zinc-700/50 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                    }`}
                  />
                </motion.div>
              )}

              {/* Password Strength Indicator - Only on signup */}
              {!isLogin && !showForgotPassword && password && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2 px-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Fortaleza:</span>
                    <span className={`font-medium ${
                      passwordStrength.score <= 25 ? 'text-red-400' :
                      passwordStrength.score <= 50 ? 'text-orange-400' :
                      passwordStrength.score <= 75 ? 'text-yellow-400' :
                      'text-emerald-400'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${passwordStrength.score}%` }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className={`h-full rounded-full transition-colors duration-300 ${passwordStrength.color}`}
                    />
                  </div>
                </motion.div>
              )}

              {/* Confirm Password Input - Only on signup */}
              {!isLogin && !showForgotPassword && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative"
                >
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                  <Input
                    type="password"
                    placeholder="Confirmar contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`pl-11 h-12 bg-zinc-800/50 text-white placeholder:text-zinc-500 rounded-xl transition-all duration-300 ${
                      confirmPassword && password !== confirmPassword 
                        ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/20' 
                        : passwordsMatch 
                          ? 'border-emerald-500/70 focus:border-emerald-500 focus:ring-emerald-500/20' 
                          : 'border-zinc-700/50 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                    }`}
                  />
                </motion.div>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-900/30"
              disabled={isLoading || (!isLogin && !showForgotPassword && password !== confirmPassword)}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Cargando...</span>
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  {showForgotPassword
                    ? "Enviar Email"
                    : (isLogin ? "Iniciar Sesión" : "Crear Cuenta")}
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>
          
          {/* Google Sign In */}
          {!showForgotPassword && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-zinc-900 px-3 text-zinc-500">
                    o continúa con
                  </span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                type="button" 
                className="w-full h-12 bg-zinc-800/50 border-zinc-700/50 text-white hover:bg-zinc-800 hover:text-white rounded-xl transition-all" 
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <FcGoogle className="mr-2 h-5 w-5" />
                Google
              </Button>
            </>
          )}
          
          {/* Forgot Password Link */}
          {isLogin && !showForgotPassword && (
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-zinc-400 hover:text-emerald-400 text-sm transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}
          
          {/* Toggle Login/Register */}
          <div className="mt-6 pt-6 border-t border-zinc-800">
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                if (showForgotPassword) {
                  setShowForgotPassword(false);
                } else {
                  setIsLogin(!isLogin);
                }
              }}
              className="w-full h-11 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-xl transition-all"
            >
              {showForgotPassword ? (
                <span className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Volver al inicio de sesión
                </span>
              ) : (
                isLogin 
                  ? "¿No tienes cuenta? Regístrate"
                  : "¿Ya tienes cuenta? Inicia sesión"
              )}
            </Button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-zinc-600 text-xs"
        >
          Al continuar, aceptas nuestros términos y condiciones
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Auth;
