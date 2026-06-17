import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../services/auth.service';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user, token, setAuth, clearAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      // If we have a token but no user data (e.g. on page refresh)
      if (token && !user) {
        try {
          const userData = await authService.getCurrentUser();
          setAuth(userData, token);
        } catch (error) {
          console.error("Failed to fetch user, logging out", error);
          clearAuth();
          toast.error("Session expired. Please log in again.");
        }
      }
    };
    
    fetchUser();
  }, [token, user, setAuth, clearAuth]);

  // Wait for user to load if we have a token but no user yet
  if (token && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="size-8 border-4 border-white/10 border-t-white rounded-full animate-spin" />
          <p className="text-sm text-white/50 animate-pulse">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // If the user's role is not in the allowed roles, redirect them to their respective dashboard
    toast.error("Unauthorized access.");
    
    const targetPath = user.role === 'admin' ? '/admin' : user.role === 'cashier' ? '/cashier' : '/member';
    
    // Prevent infinite redirect loop if role is somehow invalid or missing
    if (location.pathname === targetPath || !user.role) {
      clearAuth();
      return <Navigate to="/login" replace />;
    }
    
    return <Navigate to={targetPath} replace />;
  }

  return <Outlet />;
};
