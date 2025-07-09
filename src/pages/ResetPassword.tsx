import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { validatePassword } from "@/utils/security";

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
        // Check URL for recovery tokens
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
        const type = hashParams.get('type') || queryParams.get('type');
        
        console.log('Reset link validation:', { type, hasTokens: !!(accessToken && refreshToken) });
        
        // If we have recovery tokens, set the session
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
        
        // Check if user already has a valid session (fallback)
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('Existing session found');
          setIsValidToken(true);
          return;
        }
        
        // If no valid session or tokens, show error
        throw new Error('No valid reset session found');
        
      } catch (error) {
        console.error('Reset link validation failed:', error);
        timeoutId = setTimeout(() => {
          toast({
            variant: "destructive",
            title: "Invalid Reset Link",
            description: "This password reset link is invalid or has expired. Please request a new one.",
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
        description: "Passwords do not match",
      });
      return;
    }

    // Validate password strength
    const validation = validatePassword(password);
    if (!validation.isValid) {
      toast({
        variant: "destructive",
        title: "Password too weak",
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
        title: "Password Updated",
        description: "Your password has been successfully updated. You can now sign in with your new password.",
      });
      
      // Sign out and redirect to auth page
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error: any) {
      console.error('Password update error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred while updating your password.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-primary">
        <div className="w-full max-w-md">
          <Card className="animate-in border-0 shadow-xl bg-primary">
            <CardContent className="p-6 text-center">
              <p className="text-white">Validating reset link...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-primary">
      <div className="w-full max-w-md space-y-6">
        {/* Logo Section */}
        <div className="flex justify-center mb-8">
          <div className="w-32 h-32 flex items-center justify-center">
            <img 
              src="/lovable-uploads/0f8f9459-f386-41e8-a1f0-1466dcce96cc.png" 
              alt="Golf Flag" 
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>
        </div>

        <Card className="animate-in border-0 shadow-xl bg-primary">
          <CardHeader className="space-y-1 text-center pb-6">
            <CardTitle className="text-2xl font-bold text-white">
              Crear Nueva Contraseña
            </CardTitle>
            <CardDescription className="text-white/90">
              Ingresa tu nueva contraseña para continuar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:border-white/40 focus:ring-white/20"
                />
                <Input
                  type="password"
                  placeholder="Confirmar nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:border-white/40 focus:ring-white/20"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-white hover:bg-white/90 text-primary font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Actualizando..." : "Actualizar Contraseña"}
              </Button>
            </form>
            
            <div className="text-center pt-4">
              <Button
                variant="default"
                type="button"
                onClick={() => navigate('/auth')}
                className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                Volver al inicio de sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;