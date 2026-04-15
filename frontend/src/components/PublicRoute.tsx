import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface PublicRouteProps {
  children: ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user, isLoading, token } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (token && user) {
    const isReg = localStorage.getItem('artiset_registration_complete') === 'true';
    if (user.role === 'admin' || user.role === 'tpo') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (isReg) {
      return <Navigate to="/student/dashboard" replace />;
    }
    return <Navigate to="/registration" replace />;
  }

  return <>{children}</>;
};
