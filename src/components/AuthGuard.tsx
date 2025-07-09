
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppLoadingScreen from '@/components/ui/AppLoadingScreen';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user && location.pathname !== '/profile-setup') {
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate, location.pathname]);

  // Show loading while checking authentication
  if (loading) {
    return <AppLoadingScreen />;
  }

  // If user is not authenticated and not on profile setup page, don't render children
  if (!user && location.pathname !== '/profile-setup') {
    return null;
  }

  return <>{children}</>;
};
