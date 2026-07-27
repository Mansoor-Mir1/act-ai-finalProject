import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, isAdminEmail } from '../context/AuthContext';
import { UserRole } from '../types/auth';

interface ProtectedRouteProps {
  allowedRole?: UserRole;
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRole, children }) => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(79,70,229,0.5)]"></div>
        <p className="text-sm font-mono text-slate-400 tracking-wider uppercase animate-pulse">Authenticating Session...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const isUserAdmin = isAdminEmail(currentUser.email);

  if (allowedRole === 'admin' && (!isUserAdmin || userProfile?.role !== 'admin')) {
    return <Navigate to="/student/dashboard" replace />;
  }

  if (allowedRole === 'student' && isUserAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (allowedRole && userProfile?.role !== allowedRole) {
    return <Navigate to={isUserAdmin ? "/admin/dashboard" : "/student/dashboard"} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
