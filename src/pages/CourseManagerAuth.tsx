import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { hashPassword, verifyPassword, sanitizeInput, validateEmail, validatePassword, authRateLimiter, getPasswordStrength } from "@/utils/security";
import { Building2, ArrowLeft, Mail, Lock, User, Phone, ArrowRight, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const CourseManagerAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [courseSearchOpen, setCourseSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const passwordStrength = getPasswordStrength(password);

  const { data: golfCourses } = useQuery({
    queryKey: ['golfCourses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('golf_courses')
        .select('id, name, city, state')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !isLogin
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ingresa email y contraseña",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        variant: "destructive",
        title: "Email Inválido",
        description: "Por favor ingresa un email válido",
      });
      return;
    }

    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    if (!authRateLimiter.isAllowed(sanitizedEmail)) {
      toast({
        variant: "destructive",
        title: "Demasiados Intentos",
        description: "Demasiados intentos. Intenta de nuevo en 15 minutos.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: managers, error: fetchError } = await supabase
        .from('course_managers')
        .select(`
          id, name, email, password_hash, course_id, is_active,
          golf_courses (name)
        `)
        .eq('email', sanitizedEmail)
        .eq('is_active', true);

      if (fetchError) throw fetchError;

      if (!managers || managers.length === 0) {
        toast({
          variant: "destructive",
          title: "Error de Autenticación",
          description: "No se encontró cuenta de manager activa con este email.",
        });
        return;
      }

      const manager = managers[0];
      const providedPassword = password.trim();
      const storedHash = manager.password_hash;
      
      let isValidPassword = false;
      
      try {
        isValidPassword = await verifyPassword(providedPassword, storedHash);
      } catch (bcryptError) {
        isValidPassword = 
          btoa(providedPassword) === storedHash || 
          providedPassword === storedHash;
      }
      
      if (isValidPassword) {
        authRateLimiter.reset(sanitizedEmail);
        
        const managerData = {
          manager_id: manager.id,
          name: manager.name,
          email: manager.email,
          course_id: manager.course_id,
          course_name: (manager.golf_courses as any)?.name || 'Unknown Course'
        };
        
        localStorage.setItem('courseManager', JSON.stringify(managerData));
        
        toast({
          title: "¡Bienvenido!",
          description: `Sesión iniciada como ${manager.name}`,
        });
        
        navigate(`/course-dashboard/${manager.course_id}`);
      } else {
        toast({
          variant: "destructive",
          title: "Error de Autenticación",
          description: "Contraseña incorrecta.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Ocurrió un error durante el inicio de sesión",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !selectedCourseId || !phone) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        variant: "destructive",
        title: "Email Inválido",
        description: "Por favor ingresa un email válido",
      });
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      toast({
        variant: "destructive",
        title: "Contraseña Inválida",
        description: passwordValidation.errors.join(', '),
      });
      return;
    }

    setIsLoading(true);

    try {
      const sanitizedName = sanitizeInput(name);
      const sanitizedEmail = sanitizeInput(email).toLowerCase();
      const sanitizedPhone = sanitizeInput(phone);
      const hashedPassword = await hashPassword(password.trim());
      
      const { error } = await supabase
        .from('pending_course_managers')
        .insert({
          course_id: selectedCourseId,
          name: sanitizedName,
          email: sanitizedEmail,
          password_hash: hashedPassword,
          phone: sanitizedPhone
        });

      if (error) {
        // Handle duplicate email constraint error
        if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
          toast({
            variant: "destructive",
            title: "Email ya registrado",
            description: "Este email ya tiene una solicitud pendiente o una cuenta activa. Si ya te registraste, intenta iniciar sesión.",
          });
          setIsLoading(false);
          return;
        }
        throw error;
      }

      toast({
        title: "Registro Enviado",
        description: "Tu registro ha sido enviado para aprobación del administrador.",
      });

      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setSelectedCourseId("");
      setIsLogin(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error de Registro",
        description: error.message || "Ocurrió un error durante el registro",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 mb-4 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            Course Manager
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Panel de administración de campos
          </p>
        </motion.div>

        {/* Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl shadow-black/50"
        >
          {/* Back Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/")}
            className="mb-4 text-zinc-400 hover:text-white hover:bg-zinc-800/50 -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la App
          </Button>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-white">
              {isLogin ? "Iniciar Sesión" : "Registro de Manager"}
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              {isLogin 
                ? "Accede al panel de tu campo de golf"
                : "Solicita acceso como manager (requiere aprobación)"
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
            <div className="space-y-3">
              {!isLogin && (
                <>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                    <Input
                      type="text"
                      placeholder="Nombre completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="pl-11 h-12 bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl"
                    />
                  </div>
                  
                  <Popover open={courseSearchOpen} onOpenChange={setCourseSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={courseSearchOpen}
                        className="w-full h-12 justify-start bg-zinc-800/50 border-zinc-700/50 text-white rounded-xl hover:bg-zinc-800 hover:border-emerald-500/50"
                      >
                        <Building2 className="h-5 w-5 text-zinc-500 mr-2 shrink-0" />
                        <span className={cn("truncate", !selectedCourseId && "text-zinc-500")}>
                          {selectedCourseId
                            ? golfCourses?.find((c) => c.id === selectedCourseId)?.name
                            : "Buscar campo de golf..."}
                        </span>
                        <Search className="ml-auto h-4 w-4 shrink-0 text-zinc-500" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-zinc-900 border-zinc-700" align="start">
                      <Command className="bg-transparent">
                        <CommandInput 
                          placeholder="Buscar campo..." 
                          className="h-11 text-white border-zinc-700"
                        />
                        <CommandList>
                          <CommandEmpty className="text-zinc-500 py-6 text-center text-sm">
                            No se encontraron campos
                          </CommandEmpty>
                          <CommandGroup className="max-h-60 overflow-auto">
                            {golfCourses?.map((course) => (
                              <CommandItem
                                key={course.id}
                                value={`${course.name} ${course.city || ''}`}
                                onSelect={() => {
                                  setSelectedCourseId(course.id);
                                  setCourseSearchOpen(false);
                                }}
                                className="text-white hover:bg-zinc-800 cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedCourseId === course.id ? "opacity-100 text-emerald-400" : "opacity-0"
                                  )}
                                />
                                <span>{course.name}</span>
                                {course.city && (
                                  <span className="ml-2 text-zinc-500 text-sm">- {course.city}</span>
                                )}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                    <Input
                      type="tel"
                      placeholder="Teléfono"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="pl-11 h-12 bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl"
                    />
                  </div>
                </>
              )}
              
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <Input
                  type="email"
                  placeholder="Email del manager"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-11 h-12 bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl"
                />
              </div>
              
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <Input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-11 h-12 bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl"
                />
              </div>

              {/* Password Strength - Only on register */}
              {!isLogin && password && (
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
                      transition={{ duration: 0.3 }}
                      className={`h-full rounded-full ${passwordStrength.color}`}
                    />
                  </div>
                </motion.div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-900/30"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isLogin ? "Iniciando..." : "Enviando..."}</span>
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  {isLogin ? "Iniciar Sesión" : "Enviar Solicitud"}
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>
          
          {/* Toggle Login/Register */}
          <div className="mt-6 pt-6 border-t border-zinc-800">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full h-11 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-xl"
            >
              {isLogin 
                ? "¿Necesitas registrarte como manager?" 
                : "¿Ya tienes cuenta? Inicia sesión"}
            </Button>
          </div>
          
          <p className="text-center text-zinc-600 text-xs mt-4">
            {isLogin 
              ? "¿Necesitas acceso? Contacta al administrador"
              : "El registro requiere aprobación del administrador"
            }
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CourseManagerAuth;
