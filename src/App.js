import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CreditProvider } from './contexts/CreditContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import ToolPage from './pages/ToolPage';
import PaymentPage from './pages/PaymentPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import PrivateRoute from './components/auth/PrivateRoute';
import PublicRoute from './components/auth/PublicRoute';

function App() {
  return (
    <AuthProvider>
      <CreditProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
            <Routes>
              <Route path="/" element={<HomePage />} />
              
              <Route path="/login" element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } />
              
              <Route path="/signup" element={
                <PublicRoute>
                  <SignupPage />
                </PublicRoute>
              } />
              
              <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
              
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              } />
              
              <Route path="/tools/:tool" element={
                <PrivateRoute>
                  <ToolPage />
                </PrivateRoute>
              } />
              
              <Route path="/payment" element={
                <PrivateRoute>
                  <PaymentPage />
                </PrivateRoute>
              } />
              
              <Route path="/profile" element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              } />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
        <ToastContainer position="bottom-right" />
      </CreditProvider>
    </AuthProvider>
  );
}

export default App;
