
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import GolfAnimationLoader from '@/components/ui/GolfAnimationLoader';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      console.log("AuthGuard: No user found, redirecting to auth");
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <GolfAnimationLoader />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <GolfAnimationLoader />
      </div>
    );
  }

  return <>{children}</>;
};
