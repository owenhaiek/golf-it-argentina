import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const ProfileSetup = () => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim() || !username.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Todos los campos son requeridos",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          full_name: fullName.trim(),
          username: username.trim(),
        });
      
      if (error) throw error;

      toast({
        title: "Perfil Completado",
        description: "Tu perfil ha sido configurado exitosamente.",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al configurar el perfil.",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
              Completa tu Perfil
            </CardTitle>
            <CardDescription className="text-white/90">
              Ingresa tu nombre completo y nombre de usuario para continuar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Nombre completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:border-white/40 focus:ring-white/20"
                />
                <Input
                  type="text"
                  placeholder="Nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:border-white/40 focus:ring-white/20"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-white hover:bg-white/90 text-primary font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Guardando..." : "Completar Perfil"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSetup;