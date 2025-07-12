import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/SimpleAuthContext';
import { useManagerAssignment } from '../../../hooks/useManagerAssignment';

interface AssignedManagerRouteProps {
  children: React.ReactNode;
}

/**
 * Route component that only allows access to assigned managers or admins
 * Unassigned managers will be redirected to movies page
 */
export const AssignedManagerRoute: React.FC<AssignedManagerRouteProps> = ({ children }) => {
  const { user } = useAuth();
  const { isAssigned, loading } = useManagerAssignment();

  // Show loading while checking assignment
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#FFD875]"></div>
      </div>
    );
  }

  // Allow admins full access
  if (user?.role === 'Admin') {
    return <>{children}</>;
  }

  // For managers, check if they are assigned
  if (user?.role === 'Manager') {
    if (isAssigned) {
      return <>{children}</>;
    } else {
      // Redirect unassigned managers to movies page
      return <Navigate to="/admin/movies" replace />;
    }
  }

  // For any other case, redirect to login
  return <Navigate to="/login" replace />;
};
