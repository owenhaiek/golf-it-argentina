
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Building2, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { SecurePasswordInput } from "@/components/security/SecurePasswordInput";
import { validateEmail, sanitizeInput, authRateLimiter } from "@/utils/security";

const SecureCourseManagerAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
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

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }

    // Registration-specific validation
    if (!isLogin) {
      if (!name.trim()) {
        newErrors.name = 'Name is required';
      } else if (name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }

      if (!selectedCourseId) {
        newErrors.course = 'Please select a golf course';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Rate limiting check
    const clientIdentifier = email.toLowerCase();
    if (!authRateLimiter.isAllowed(clientIdentifier)) {
      toast({
        variant: "destructive",
        title: "Too Many Attempts",
        description: "Please wait 15 minutes before trying again.",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Attempting secure course manager login");
      
      const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
      
      // Call the secure authentication function
      const { data, error } = await supabase.rpc('authenticate_course_manager', {
        manager_email: sanitizedEmail,
        manager_password: password.trim()
      });

      if (error) {
        console.error("Authentication error:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: "Invalid email or password. Please check your credentials.",
        });
        return;
      }

      const manager = data[0];
      const managerData = {
        manager_id: manager.manager_id,
        name: manager.name,
        email: manager.email,
        course_id: manager.course_id,
        course_name: manager.course_name
      };
      
      console.log("Login successful, storing secure manager data");
      localStorage.setItem('courseManager', JSON.stringify(managerData));
      
      // Reset rate limiter on successful login
      authRateLimiter.reset(clientIdentifier);
      
      toast({
        title: "Welcome back!",
        description: `Logged in as ${manager.name} for ${manager.course_name}`,
      });
      
      navigate("/course-dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Invalid credentials or server error. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const sanitizedData = {
        course_id: selectedCourseId,
        name: sanitizeInput(name.trim()),
        email: sanitizeInput(email.toLowerCase().trim()),
        phone: phone?.trim() || null
      };
      
      // The actual password hashing will be done by the database function
      // when the admin approves the registration
      const { error } = await supabase
        .from('pending_course_managers')
        .insert({
          ...sanitizedData,
          password_hash: password.trim() // This will be properly hashed on approval
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
      setErrors({});
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
                <div>
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
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
                  {errors.course && <p className="text-sm text-red-500 mt-1">{errors.course}</p>}
                </div>
                <Input
                  type="tel"
                  placeholder="Phone Number (optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </>
            )}
            <div>
              <Input
                type="email"
                placeholder="Manager Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <SecurePasswordInput
                value={password}
                onChange={setPassword}
                placeholder="Password"
                showStrengthIndicator={!isLogin}
                required
              />
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
            </div>
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
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
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

export default SecureCourseManagerAuth;
