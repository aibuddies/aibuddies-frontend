// src/App.js
import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import api from "./api";

import Header from "./components/Header";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import BuyCreditsPage from "./pages/BuyCreditsPage";
import WatchAdPage from "./pages/WatchAdPage";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const userData = await api.getMe();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
        localStorage.removeItem("accessToken");
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg font-medium">Loading AIBUDDIES...</p>
      </div>
    );
  }

  return (
    <Router>
      {user && <Header user={user} onLogout={handleLogout} />}
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={<LoginPage onLoginSuccess={fetchUser} />}
        />
        <Route
          path="/signup"
          element={
            <SignupPage
              onSignupSuccess={() => {
                alert("Signup successful! Please verify your email.");
                window.location.href = "/login";
              }}
            />
          }
        />
        <Route
          path="/verify-email/:token"
          element={<EmailVerificationPage setUser={setUser} />}
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={user ? <DashboardPage user={user} onToolComplete={fetchUser} /> : <Navigate to="/login" />}
        />
        <Route
          path="/buy-credits"
          element={user ? <BuyCreditsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/watch-ad"
          element={user ? <WatchAdPage /> : <Navigate to="/login" />}
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
