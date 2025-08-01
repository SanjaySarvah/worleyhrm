import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import { useAuth } from './context/AuthContext';

import Login from './pages/Login';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

import roleRoutes from './routes/roleRoutes.jsx'; // ✅ make sure to import the correct file
import 'bootstrap-icons/font/bootstrap-icons.css';
function AppLayout() {
  const location = useLocation();
  const { user } = useAuth();

  const hideSidebar = /^\/(login|forgot-password|reset-password)/.test(location.pathname);
  const userRole = user?.role?.toLowerCase();

  return (
    <div className="d-flex">
      {!hideSidebar && <Sidebar />}
      <div className="flex-grow-1" style={{ marginLeft: hideSidebar ? 0 : '250px', width: '100%' }}>
        {!hideSidebar && <TopBar />}
        <div className="p-3">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/reset-password" element={<Navigate to="/forgot-password" replace />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Role-Based Routes */}
            {user && roleRoutes[userRole]?.map(({ path, element }, i) => (
              <Route
                key={i}
                path={path}
                element={
                  <ProtectedRoute allowedRoles={[userRole]}>
                    {element}
                  </ProtectedRoute>
                }
              />
            ))}

            {/* Fallback */}
            <Route path="*" element={<h2>Not Found</h2>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}
