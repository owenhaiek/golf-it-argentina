import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { validatePassword } from "@/utils/security";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const validateResetLink = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
        const type = hashParams.get('type') || queryParams.get('type');
        
        console.log('Reset link validation:', { type, hasTokens: !!(accessToken && refreshToken) });
        
        if (type === 'recovery' && accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (error) {
            console.error('Session error:', error);
            throw error;
          }
          
          if (data.session) {
            console.log('Recovery session established');
            setIsValidToken(true);
            return;
          }
        }
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('Existing session found');
          setIsValidToken(true);
          return;
        }
        
        throw new Error('No valid reset session found');
        
      } catch (error) {
        console.error('Reset link validation failed:', error);
        timeoutId = setTimeout(() => {
          toast({
            variant: "destructive",
            title: "Enlace Inválido",
            description: "Este enlace de restablecimiento es inválido o ha expirado. Por favor solicita uno nuevo.",
          });
          navigate('/auth');
        }, 1000);
      }
    };

    validateResetLink();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Las contraseñas no coinciden",
      });
      return;
    }

    const validation = validatePassword(password);
    if (!validation.isValid) {
      toast({
        variant: "destructive",
        title: "Contraseña muy débil",
        description: validation.errors.join(", "),
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) throw error;

      toast({
        title: "Contraseña Actualizada",
        description: "Tu contraseña ha sido actualizada exitosamente.",
      });
      
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error: any) {
      console.error('Password update error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Ocurrió un error al actualizar tu contraseña.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-zinc-950 to-zinc-950" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center gap-4"
        >
          <div className="w-20 h-20">
            <img 
              src="/lovable-uploads/0f8f9459-f386-41e8-a1f0-1466dcce96cc.png" 
              alt="Golf Flag" 
              className="w-full h-full object-contain drop-shadow-2xl animate-pulse"
            />
          </div>
          <p className="text-zinc-400 text-sm">Validando enlace...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-zinc-950 to-zinc-950" />
      
      {/* Ambient glow */}
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
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">
              Nueva Contraseña
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              Ingresa tu nueva contraseña segura
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              {/* New Password Input */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <Input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-11 h-12 bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                />
              </div>
              
              {/* Confirm Password Input */}
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <Input
                  type="password"
                  placeholder="Confirmar nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`pl-11 h-12 bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all ${
                    confirmPassword && password !== confirmPassword 
                      ? 'border-red-500/50 focus:border-red-500/50' 
                      : confirmPassword && password === confirmPassword 
                        ? 'border-emerald-500/50' 
                        : ''
                  }`}
                />
                {/* Password match indicator */}
                {confirmPassword && (
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${
                      password === confirmPassword ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {password === confirmPassword ? '✓' : '✗'}
                  </motion.span>
                )}
              </div>
            </div>

            {/* Password requirements hint */}
            <div className="text-xs text-zinc-500 space-y-1 px-1">
              <p>La contraseña debe tener:</p>
              <ul className="list-disc list-inside space-y-0.5 text-zinc-600">
                <li>Mínimo 8 caracteres</li>
                <li>Al menos una mayúscula</li>
                <li>Al menos un número</li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-900/30"
              disabled={isLoading || password !== confirmPassword}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Actualizando...</span>
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  Actualizar Contraseña
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>
          
          {/* Back to Login */}
          <div className="mt-6 pt-6 border-t border-zinc-800">
            <Button
              variant="ghost"
              type="button"
              onClick={() => navigate('/auth')}
              className="w-full h-11 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-xl transition-all"
            >
              <span className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio de sesión
              </span>
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
          Tu contraseña será actualizada de forma segura
        </motion.p>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
