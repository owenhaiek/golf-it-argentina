
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import GolfAnimationLoader from "@/components/ui/GolfAnimationLoader";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log("Index page - User:", user?.id, "Loading:", loading);
    
    if (!loading) {
      // Check for successful auth flag
      const authSuccess = localStorage.getItem('golfit_auth_success');
      
      if (user) {
        console.log("User authenticated, redirecting to home");
        // Clear the auth success flag
        if (authSuccess) {
          localStorage.removeItem('golfit_auth_success');
        }
        navigate("/home", { replace: true });
      } else {
        console.log("No user found, redirecting to auth");
        navigate("/auth", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // Show loading while checking authentication
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <GolfAnimationLoader />
    </div>
  );
};

export default Index;
