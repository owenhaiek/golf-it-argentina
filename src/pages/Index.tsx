
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import GolfAnimationLoader from "@/components/ui/GolfAnimationLoader";

const Index = () => {
  const navigate = useNavigate();
  const { user, session, loading } = useAuth();
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);

  useEffect(() => {
    const handleAuthFlow = async () => {
      // Check for OAuth callback parameters
      const urlParams = new URLSearchParams(window.location.search);
      const hasAuthParams = urlParams.get('code') || urlParams.get('access_token') || urlParams.get('refresh_token');
      
      if (hasAuthParams) {
        console.log("OAuth callback detected, processing...");
        setIsProcessingOAuth(true);
        
        // Wait a bit for the auth state to update
        setTimeout(() => {
          if (user && session) {
            console.log("OAuth successful, redirecting to home");
            navigate("/home", { replace: true });
          } else {
            console.log("OAuth processing, waiting for session...");
            // Wait a bit more for session to establish
            setTimeout(() => {
              if (user && session) {
                navigate("/home", { replace: true });
              } else {
                console.log("OAuth failed, redirecting to auth");
                navigate("/auth", { replace: true });
              }
              setIsProcessingOAuth(false);
            }, 2000);
          }
        }, 1000);
        return;
      }

      // Normal auth flow
      if (!loading && !isProcessingOAuth) {
        if (user && session) {
          console.log("User authenticated, redirecting to home");
          navigate("/home", { replace: true });
        } else {
          console.log("No authenticated user, redirecting to auth");
          navigate("/auth", { replace: true });
        }
      }
    };

    handleAuthFlow();
  }, [user, session, loading, navigate, isProcessingOAuth]);

  // Show loading while processing
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <GolfAnimationLoader />
      {isProcessingOAuth && (
        <div className="absolute bottom-20 text-center">
          <p className="text-muted-foreground">Completing sign in...</p>
        </div>
      )}
    </div>
  );
};

export default Index;
