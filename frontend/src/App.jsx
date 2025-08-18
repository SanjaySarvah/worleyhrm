import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';

import Login from './pages/Login';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

import roleRoutes from './routes/roleRoutes.jsx';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { ThemeProvider } from './context/ThemeContext';

function AppLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const hideSidebar = /^\/(login|forgot-password|reset-password)/.test(location.pathname);
  const userRole = user?.role?.toLowerCase();

  return (
    <div className="d-flex">
      {!hideSidebar && (
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      )}

      <div
        className="flex-grow-1 transition-all duration-300"
        style={{
          marginLeft: hideSidebar ? 0 : collapsed ? '4rem' : '16rem', // 64px or 256px
          width: '100%',
        }}
      >
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
