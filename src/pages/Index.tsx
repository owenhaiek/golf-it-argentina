
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate("/home");
      } else {
        navigate("/auth");
      }
    }
  }, [user, loading, navigate]);

  // Show nothing while redirecting
  return null;
};

export default Index;
