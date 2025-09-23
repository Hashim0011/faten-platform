import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ExpertDashboard from './pages/ExpertDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TwoFactorVerification from './pages/TwoFactorVerification';

// مكون صغير يغير العنوان حسب الصفحة
function PageTitleUpdater() {
  const location = useLocation();

  useEffect(() => {
    switch (location.pathname) {
      case '/':
        document.title = 'Faten';
        break;
      case '/register':
        document.title = 'إنشاء حساب | Faten';
        break;
      case '/login':
        document.title = 'تسجيل الدخول | Faten';
        break;
      case '/two-factor-verification':
        document.title = 'التحقق بخطوتين | Faten';
        break;
      case '/dashboard':
        document.title = 'الواجهة الرئيسية | Faten';
        break;
      case '/expert-dashboard':
        document.title = 'لوحة الخبراء | Faten';
        break;
      case '/admin-dashboard':
        document.title = 'لوحة الإدارة | Faten';
        break;
      default:
        document.title = 'Faten';
    }
  }, [location]);

  return null;
}

function App() {
  return (
    <Router>
      {/* مبدئياً نضبط العنوان لأول واجهة */}
      <PageTitleUpdater />

      <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/two-factor-verification" element={<TwoFactorVerification />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/expert-dashboard" element={<ExpertDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
