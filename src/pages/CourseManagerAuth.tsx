
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Building2, ArrowLeft } from "lucide-react";

const CourseManagerAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .rpc('authenticate_course_manager', {
          manager_email: email,
          manager_password: password
        });

      if (error) throw error;

      if (data && data.length > 0) {
        const managerData = data[0];
        
        // Store manager session data
        localStorage.setItem('courseManager', JSON.stringify(managerData));
        
        toast({
          title: "Welcome back!",
          description: `Logged in as ${managerData.name} for ${managerData.course_name}`,
        });
        
        navigate("/course-dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: "Invalid email or password. Please try again.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred during login",
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
            Course Manager Login
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to manage your golf course reservations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
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
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-hover"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
          
          <Separator />
          
          <div className="text-center text-sm text-muted-foreground">
            Need access? Contact your golf course administrator
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseManagerAuth;
