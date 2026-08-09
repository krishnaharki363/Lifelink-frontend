import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/useAuth';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { DonorRegistration } from './pages/DonorRegistration';
import { AdminDashboard } from './pages/AdminDashboard';
import { HospitalDashboard } from './pages/HospitalDashboard';
import { BloodBankDashboard } from './pages/BloodBankDashboard';
import { DonorDashboard } from './pages/DonorDashboard';
import { PendingVerification } from './pages/PendingVerification';

const ProtectedRoute = ({
  children,
  allowedRoles,
  allowPending = false,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
  allowPending?: boolean;
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--red-200)', borderTopColor: 'var(--red-600)', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!allowPending && user && user.verificationStatus !== 'APPROVED' && user.role !== 'DONOR' && user.role !== 'ADMIN') {
    return <Navigate to="/pending-verification" replace />;
  }
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to correct dashboard instead of login
    const roleRoutes: Record<string, string> = { 
      ADMIN: '/admin', 
      HOSPITAL: '/hospital', 
      BLOOD_BANK: '/blood-bank',
      DONOR: '/donor' 
    };
    return <Navigate to={roleRoutes[user.role] ?? '/login'} replace />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"         element={<Landing />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<DonorRegistration />} />
        <Route path="/pending-verification" element={<ProtectedRoute allowPending><PendingVerification /></ProtectedRoute>} />

        {/* Protected — role-gated */}
        <Route path="/admin"    element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/hospital" element={<ProtectedRoute allowedRoles={['HOSPITAL']}><HospitalDashboard /></ProtectedRoute>} />
        <Route path="/blood-bank" element={<ProtectedRoute allowedRoles={['BLOOD_BANK']}><BloodBankDashboard /></ProtectedRoute>} />
        {/* Keep the legacy typo as a compatibility alias for existing bookmarks. */}
        <Route path="/Blodd_Bank" element={<Navigate to="/blood-bank" replace />} />
        <Route path="/donor"    element={<ProtectedRoute allowedRoles={['DONOR']}><DonorDashboard /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
