import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { authService } from './services/authService';
import Background3D from './components/Background3D';
import HomePage from './components/HomePage';
import Auth from './components/Auth';
import StudentDashboard from './components/StudentDashboard';
import TrainerDashboard from './components/TrainerDashboard';
import AdminDashboard from './components/AdminDashboard';
import { Shield, RefreshCw, AlertCircle } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  
  // Track current path cleanly: '/', '/login', '/signup', '/dashboard'
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthError(null);
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          localStorage.setItem('firebaseIdToken', idToken);

          // Fetch authenticated role & profile strictly from backend /api/auth/me
          const backendProfile = await authService.getMe();
          setUser(backendProfile);

          // Automatically route authenticated users to /dashboard if currently on /login or /signup
          if (window.location.pathname === '/login' || window.location.pathname === '/signup') {
            navigate('/dashboard');
          }
        } catch (err) {
          console.error("Failed to verify user profile with backend:", err);
          setAuthError(err.message || "Failed to retrieve user profile from backend.");
          setUser(null);
        }
      } else {
        setUser(null);
        localStorage.removeItem('firebaseIdToken');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setAuthError(null);
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    setLoading(true);
    await authService.logout();
    setUser(null);
    setAuthError(null);
    navigate('/');
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#0a0910] text-slate-100 flex flex-col items-center justify-center p-4">
        <Background3D />
        <div className="relative z-10 text-center bg-[#13111c]/90 backdrop-blur-xl border border-[#27213b] p-8 rounded-3xl shadow-2xl space-y-4 max-w-sm w-full">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="font-bold text-white text-lg">ResQVerse Security</h3>
          <p className="text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
            Authenticating identity with backend...
          </p>
        </div>
      </div>
    );
  }

  // 1. Login Route /login
  if (currentPath === '/login') {
    return (
      <div className="relative min-h-screen bg-[#0a0910] text-slate-100 overflow-x-hidden">
        <Background3D />
        <Auth 
          initialMode="login" 
          onLogin={handleLoginSuccess} 
          onBackToHome={() => navigate('/')} 
        />
      </div>
    );
  }

  // 2. Signup Route /signup
  if (currentPath === '/signup') {
    return (
      <div className="relative min-h-screen bg-[#0a0910] text-slate-100 overflow-x-hidden">
        <Background3D />
        <Auth 
          initialMode="signup" 
          onLogin={handleLoginSuccess} 
          onBackToHome={() => navigate('/')} 
        />
      </div>
    );
  }

  // 3. Authenticated Role Dashboard Route /dashboard
  if (currentPath === '/dashboard' && user) {
    return (
      <div className="relative min-h-screen bg-[#0a0910] text-slate-100 overflow-x-hidden">
        <Background3D />
        {user.role === 'admin' ? (
          <AdminDashboard user={user} onLogout={handleLogout} />
        ) : user.role === 'trainer' ? (
          <TrainerDashboard user={user} onLogout={handleLogout} />
        ) : (
          <StudentDashboard user={user} onLogout={handleLogout} />
        )}
      </div>
    );
  }

  // 4. Default Public Route / (Home Page)
  return (
    <HomePage 
      onNavigate={navigate} 
      currentPath={currentPath} 
      user={user} 
      onLogout={handleLogout} 
    />
  );
}
