import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(75_20%_95%)] flex flex-col items-center justify-center gap-4">
        <div className="animate-spin text-4xl">⏳</div>
        <p className="text-sm font-medium text-muted-foreground">Verifying access credentials...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    // Redirect unauthorized users to login page
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};
