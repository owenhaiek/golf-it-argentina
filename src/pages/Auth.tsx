
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from "react-icons/fc";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

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
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
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
          redirectTo: window.location.origin
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted">
      <Card className="w-full max-w-md animate-in">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isLogin ? t("auth", "welcomeBack") : t("auth", "createAccount")}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin
              ? t("auth", "emailSignInDescription")
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
              />
              <Input
                type="password"
                placeholder={t("auth", "password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-hover"
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
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-muted px-2 text-muted-foreground">
                {t("auth", "orContinueWith")}
              </span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            type="button" 
            className="w-full" 
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <FcGoogle className="mr-2 h-5 w-5" />
            Google
          </Button>
          
          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:text-primary-hover underline"
            >
              {isLogin 
                ? t("auth", "needAccount") 
                : t("auth", "haveAccount")}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
