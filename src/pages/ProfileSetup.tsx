import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Camera, User, Hash, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const ProfileSetup = () => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (avatarFile) {
      const url = URL.createObjectURL(avatarFile);
      setAvatarPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [avatarFile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

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
      let avatarUrl = null;

      // Upload avatar if provided
      if (avatarFile && user?.id) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
        const filePath = `${user.id}/${fileName}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);
          
        if (uploadError) {
          console.error("Avatar upload failed:", uploadError);
          throw uploadError;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
          
        avatarUrl = publicUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          full_name: fullName.trim(),
          username: username.trim(),
          avatar_url: avatarUrl,
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
    <div className="h-screen flex flex-col bg-background">
      <div className="flex-shrink-0 p-4 bg-background border-b border-border">
        <div className="flex items-center justify-center">
          <h1 className="text-2xl font-bold text-foreground">Completa tu Perfil</h1>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 flex items-center justify-center min-h-full">
          <div className="w-full max-w-md">
            <Card className="overflow-hidden border-0 shadow-lg bg-zinc-900">
              <CardHeader className="pb-6 text-center">
                {/* Logo Section */}
                <div className="flex justify-center mb-6">
                  <div className="w-28 h-28 flex items-center justify-center">
                    <img 
                      src="/lovable-uploads/0f8f9459-f386-41e8-a1f0-1466dcce96cc.png" 
                      alt="Golf Flag" 
                      className="w-full h-full object-contain drop-shadow-lg"
                    />
                  </div>
                </div>

                {/* Avatar Section */}
                <div className="relative w-28 h-28 mx-auto mb-4">
                  <div 
                    className="relative w-28 h-28 rounded-full ring-2 ring-primary ring-offset-2 cursor-pointer transition-all duration-200 hover:ring-primary/80"
                    onClick={handleAvatarClick}
                  >
                    <Avatar className="w-28 h-28 border-4 border-white shadow-md hover:opacity-95 transition-opacity">
                      <AvatarImage src={avatarPreview} />
                      <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                        {fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleAvatarChange} 
                    />
                    
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full text-white">
                      <Camera className="h-6 w-6" />
                    </div>
                  </div>
                </div>

                <CardTitle className="text-xl font-bold text-white mb-2">
                  Configura tu Perfil
                </CardTitle>
                <p className="text-sm text-muted-foreground mb-8">
                  Agrega tu información personal y foto de perfil
                </p>
              </CardHeader>
              
              <CardContent className="px-6 pb-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                      <User className="h-4 w-4" /> Nombre Completo
                    </label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Ingresa tu nombre completo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="username" className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                      <Hash className="h-4 w-4" /> Nombre de Usuario
                    </label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Ingresa tu nombre de usuario"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        "Completar Perfil"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ProfileSetup;