import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
      case '/expert-register':
        document.title = 'إنشاء حساب خبير | Faten';
        break;
      case '/expert-dashboard':
        document.title = 'لوحة الخبراء | Faten';
        break;
      case '/admin-register':
        document.title = 'إنشاء حساب مدير | Faten';
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
