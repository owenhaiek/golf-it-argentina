
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { hashPassword, verifyPassword, sanitizeInput, validateEmail, validatePassword, authRateLimiter } from "@/utils/security";
import { Separator } from "@/components/ui/separator";
import { Building2, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

const CourseManagerAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch golf courses for registration
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
        description: "Please enter both email and password",
      });
      return;
    }

    // Input validation and sanitization
    if (!validateEmail(email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address",
      });
      return;
    }

    // Rate limiting check
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    if (!authRateLimiter.isAllowed(sanitizedEmail)) {
      toast({
        variant: "destructive",
        title: "Too Many Attempts",
        description: "Too many login attempts. Please try again in 15 minutes.",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Attempting course manager login with email:", email);
      
      // First, let's check if there are any active managers with this email
      const { data: managers, error: fetchError } = await supabase
        .from('course_managers')
        .select(`
          id,
          name,
          email,
          password_hash,
          course_id,
          is_active,
          golf_courses (
            name
          )
        `)
        .eq('email', sanitizedEmail)
        .eq('is_active', true);

      if (fetchError) {
        console.error("Error fetching manager:", fetchError);
        throw fetchError;
      }

      console.log("Found managers:", managers);

      if (!managers || managers.length === 0) {
        console.log("No managers found with email:", sanitizedEmail);
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: "No active course manager account found with this email. Please check your email or contact admin for approval.",
        });
        return;
      }

      const manager = managers[0];
      console.log("Manager found:", {
        id: manager.id,
        email: manager.email,
        hasPasswordHash: !!manager.password_hash,
        passwordHashLength: manager.password_hash?.length
      });
      
      // Try secure password verification methods
      const providedPassword = password.trim();
      const storedHash = manager.password_hash;
      
      let isValidPassword = false;
      
      try {
        // Try bcrypt verification first (for properly hashed passwords)
        isValidPassword = await verifyPassword(providedPassword, storedHash);
      } catch (bcryptError) {
        console.log("Bcrypt verification failed, trying legacy methods");
        
        // Fall back to legacy hash formats for backward compatibility
        isValidPassword = 
          btoa(providedPassword) === storedHash || // Base64 encoded
          providedPassword === storedHash; // Direct match (for unhashed passwords - security risk!)
      }
      
      console.log("Password verification:", {
        isValidPassword,
        method: isValidPassword ? 'verified' : 'failed'
      });
      
      if (isValidPassword) {
        // Reset rate limiter on successful login
        authRateLimiter.reset(sanitizedEmail);
        
        const managerData = {
          manager_id: manager.id,
          name: manager.name,
          email: manager.email,
          course_id: manager.course_id,
          course_name: (manager.golf_courses as any)?.name || 'Unknown Course'
        };
        
        console.log("Login successful, storing manager data:", managerData);
        localStorage.setItem('courseManager', JSON.stringify(managerData));
        
        toast({
          title: "Welcome back!",
          description: `Logged in as ${manager.name} for ${(manager.golf_courses as any)?.name || 'Unknown Course'}`,
        });
        
        // Fixed redirect: navigate to the specific course dashboard
        navigate(`/course-dashboard/${manager.course_id}`);
      } else {
        console.log("Password verification failed");
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: "Invalid password. Please check your password and try again.",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred during login",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !selectedCourseId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    // Input validation and sanitization
    if (!validateEmail(email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address",
      });
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      toast({
        variant: "destructive",
        title: "Invalid Password",
        description: passwordValidation.errors.join(', '),
      });
      return;
    }

    setIsLoading(true);

    try {
      // Sanitize inputs
      const sanitizedName = sanitizeInput(name);
      const sanitizedEmail = sanitizeInput(email).toLowerCase();
      const sanitizedPhone = phone ? sanitizeInput(phone) : null;
      
      // Use proper password hashing instead of Base64
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

      if (error) throw error;

      toast({
        title: "Registration Submitted",
        description: "Your registration has been submitted for admin approval. You'll be notified once approved.",
      });

      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setSelectedCourseId("");
      setIsLogin(true);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "An error occurred during registration",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToApp = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted">
      <Card className="w-full max-w-md animate-in">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleBackToApp}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to App
            </Button>
          </div>
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {isLogin ? "Course Manager Login" : "Course Manager Registration"}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin 
              ? "Sign in to manage your golf course reservations"
              : "Apply to become a course manager (admin approval required)"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
            {!isLogin && (
              <>
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Golf Course" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    {golfCourses?.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name} {course.city && `- ${course.city}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="tel"
                  placeholder="Phone Number (optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </>
            )}
            <Input
              type="email"
              placeholder="Manager Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-hover"
              disabled={isLoading}
            >
              {isLoading 
                ? (isLogin ? "Signing In..." : "Submitting...") 
                : (isLogin ? "Sign In" : "Submit Registration")
              }
            </Button>
          </form>
          
          <Separator />
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:text-primary-hover underline text-sm"
            >
              {isLogin 
                ? "Need to register as a course manager?" 
                : "Already have an account? Sign in"}
            </button>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            {isLogin 
              ? "Need access? Contact your golf course administrator"
              : "Registration requires admin approval"
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseManagerAuth;
