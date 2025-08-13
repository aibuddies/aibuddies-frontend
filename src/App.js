import React, { useState, useEffect, useCallback } from 'react';
import api from './api';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import EmailVerificationPage from './pages/EmailVerificationPage';

export default function App() {
  const [view, setView] = useState('loading');
  const [user, setUser] = useState(null);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const userData = await api.getMe();
        setUser(userData);
        setView('dashboard');
      } catch (error) {
        localStorage.removeItem('accessToken');
        setView('login');
      }
    } else {
        const path = window.location.pathname;
        if (path.startsWith('/verify-email/')) {
            setView('verify-email');
        } else {
            setView('login');
        }
    }
  }, []);

  useEffect(() => {
    // This effect runs once on component mount to determine the initial view
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/verify-email/')) {
      setView('verify-email');
    } else {
      fetchUser();
    }
  }, [fetchUser]);


  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    setView('login');
  };
  
  const handleSignupSuccess = () => {
      alert('Signup successful! Please check your email to verify your account.');
      setView('login');
  }

  const renderView = () => {
    const path = window.location.pathname;
    // This logic ensures that if the user navigates directly to the verification link, it shows the correct page.
    if (path.startsWith('/verify-email/')) {
        const token = path.split('/verify-email/')[1];
        return <EmailVerificationPage token={token} setView={setView} />;
    }

    switch (view) {
      case 'loading':
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><p className="text-lg font-medium">Loading AIBUDDIES...</p></div>;
      case 'login':
        return <LoginPage setView={setView} onLoginSuccess={fetchUser} />;
      case 'signup':
        return <SignupPage setView={setView} onSignupSuccess={handleSignupSuccess} />;
      case 'dashboard':
        return (
          <div className="min-h-screen bg-gray-100">
            <Header user={user} onLogout={handleLogout} />
            <main>
              <DashboardPage user={user} onToolComplete={fetchUser} />
            </main>
          </div>
        );
      default:
        return <LoginPage setView={setView} onLoginSuccess={fetchUser} />;
    }
  };

  return <>{renderView()}</>;
}
