
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';
import GolfAnimationLoader from '@/components/ui/GolfAnimationLoader';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard = ({ children }: AdminGuardProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      console.log("AdminGuard: Starting admin role check");
      console.log("AdminGuard: User loading state:", loading);
      console.log("AdminGuard: Current user:", user);
      
      if (!user) {
        console.log("AdminGuard: No user found, denying admin access");
        setIsAdmin(false);
        setCheckingRole(false);
        return;
      }

      try {
        console.log("AdminGuard: Checking admin role for user:", user.email);
        
        // Updated to use only the dedicated admin email
        const adminEmail = 'admin@golfitargentina.com';
        const isUserAdmin = user.email === adminEmail;
        
        console.log("AdminGuard: User email:", user.email);
        console.log("AdminGuard: Required admin email:", adminEmail);
        console.log("AdminGuard: Is admin:", isUserAdmin);
        
        setIsAdmin(isUserAdmin);
      } catch (error) {
        console.error('AdminGuard: Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setCheckingRole(false);
        console.log("AdminGuard: Admin role check completed");
      }
    };

    if (!loading) {
      checkAdminRole();
    }
  }, [user, loading]);

  const handleGoBack = () => {
    navigate('/');
  };

  console.log("AdminGuard: Render state - loading:", loading, "checkingRole:", checkingRole, "isAdmin:", isAdmin);

  // Show loading while checking authentication and role
  if (loading || checkingRole) {
    console.log("AdminGuard: Showing loading state");
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <GolfAnimationLoader />
      </div>
    );
  }

  // If user is not authenticated or not admin, show access denied
  if (!user || !isAdmin) {
    console.log("AdminGuard: Access denied. User:", user?.email, "Is admin:", isAdmin);
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-6">
            <Shield className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access this page. Administrator privileges are required.
            </p>
            {user && (
              <p className="text-sm text-muted-foreground mb-6">
                Current user: {user.email}
              </p>
            )}
            <Button onClick={handleGoBack} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log("AdminGuard: Admin access granted for user:", user.email);
  return <>{children}</>;
};
