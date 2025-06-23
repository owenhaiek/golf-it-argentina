
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user, loading } = useAuth();

  // Redirect authenticated users immediately
  React.useEffect(() => {
    if (!loading && user) {
      console.log("User already authenticated, redirecting to home");
      navigate("/home", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/home", { replace: true });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/home`,
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
          redirectTo: `${window.location.origin}/home`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
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

  // Check for auth confirmation or handle OAuth callback
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const confirmed = urlParams.get('confirmed');
    
    if (confirmed === 'true') {
      toast({
        title: t("auth", "emailConfirmed") || "Email Confirmed",
        description: t("auth", "accountConfirmed") || "Your account has been confirmed. You can now sign in.",
      });
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Enhanced OAuth callback handling
    const handleOAuthCallback = async () => {
      // Check if we're returning from OAuth
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (accessToken || refreshToken) {
        console.log("OAuth callback detected, checking session...");
        
        // Wait a bit for Supabase to process the tokens
        setTimeout(async () => {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (session && !error) {
            console.log("OAuth session confirmed, redirecting to home");
            localStorage.setItem('golfit_auth_success', 'true');
            navigate("/home", { replace: true });
          }
        }, 500);
      } else {
        // Check for existing session on regular page load
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session && !error) {
          console.log("Existing session found, redirecting to home");
          navigate("/home", { replace: true });
        }
      }
    };
    
    handleOAuthCallback();
  }, [navigate, toast, t]);

  // Don't render auth form if user is already authenticated
  if (!loading && user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-primary">
      <div className="w-full max-w-md space-y-6">
        {/* Logo Section with larger golf flag image */}
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
              {isLogin ? "Bienvenido a GOLFIT" : t("auth", "createAccount")}
            </CardTitle>
            <CardDescription className="text-white/90">
              {isLogin
                ? "Ingresa tu correo electrónico y contraseña para iniciar sesión"
                : t("auth", "emailSignUpDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder={t("auth", "email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:border-white/40 focus:ring-white/20"
                />
                <Input
                  type="password"
                  placeholder={t("auth", "password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:border-white/40 focus:ring-white/20"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-white hover:bg-white/90 text-primary font-semibold"
                disabled={isLoading}
              >
                {isLoading 
                  ? t("common", "loading") 
                  : isLogin 
                    ? t("auth", "signIn") 
                    : t("auth", "signUp")}
              </Button>
            </form>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-white/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-primary px-2 text-white/70">
                  {t("auth", "orContinueWith")}
                </span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              type="button" 
              className="w-full border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white" 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <FcGoogle className="mr-2 h-5 w-5" />
              Google
            </Button>
            
            <div className="text-center pt-4">
              <Button
                variant="default"
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                {isLogin 
                  ? t("auth", "createAccount")
                  : t("auth", "haveAccount")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
