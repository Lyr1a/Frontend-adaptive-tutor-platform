import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores';
import type { UserRole } from '../../types';
import Loading from '../common/Loading';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user, token } = useAuthStore();
  const location = useLocation();

  // Still loading
  if (!token && isAuthenticated === false) {
    return <Loading fullPage tip="Đang kiểm tra đăng nhập..." />;
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if specified
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on role
    switch (user.role) {
      case 'Student':
        return <Navigate to="/student/dashboard" replace />;
      case 'Tutor':
        return <Navigate to="/tutor/dashboard" replace />;
      case 'Administrator':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
