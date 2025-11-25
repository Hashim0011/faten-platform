import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import RoleSelection from './pages/RoleSelection';
import Register from './pages/Register';
import Login from './pages/Login';
import ExpertLogin from './pages/ExpertLogin';
import ExpertRegister from './pages/ExpertRegister';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import Dashboard from './pages/Dashboard';
import ExpertDashboard from './pages/ExpertDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TwoFactorVerification from './pages/TwoFactorVerification';
import SettingsSimple from './pages/SettingsSimple';

// مكون صغير يغير العنوان حسب الصفحة
function PageTitleUpdater() {
  const location = useLocation();

  useEffect(() => {
    switch (location.pathname) {
      case '/':
        document.title = 'فطن';
        break;
      case '/register':
        document.title = 'إنشاء حساب | فطن';
        break;
      case '/login':
        document.title = 'تسجيل الدخول | فطن';
        break;
      case '/two-factor-verification':
        document.title = 'التحقق بخطوتين | فطن';
        break;
      case '/dashboard':
        document.title = 'الواجهة الرئيسية | فطن';
        break;
      case '/expert-register':
        document.title = 'إنشاء حساب خبير | فطن';
        break;
      case '/expert-dashboard':
        document.title = 'لوحة الخبراء | فطن';
        break;
      case '/admin-register':
        document.title = 'إنشاء حساب مدير | فطن';
        break;
      case '/admin-dashboard':
        document.title = 'لوحة الإدارة | فطن';
        break;
      case '/settings':
        document.title = 'الإعدادات | فطن';
        break;
      default:
        document.title = 'فطن';
    }
  }, [location]);

  return null;
}

function App() {
  // Initialize theme on app load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <Router>
      <ToastProvider>
        <PageTitleUpdater />

        <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
          <Routes>
            <Route path="/" element={<RoleSelection />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/expert-register" element={<ExpertRegister />} />
            <Route path="/expert-login" element={<ExpertLogin />} />
            <Route path="/admin-register" element={<AdminRegister />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/two-factor-verification" element={<TwoFactorVerification />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/expert-dashboard" element={<ExpertDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/settings" element={<SettingsSimple />} />
          </Routes>
        </div>
      </ToastProvider>
    </Router>
  );
}

export default App;
