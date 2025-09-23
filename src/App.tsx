import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ExpertDashboard from './pages/ExpertDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TwoFactorVerification from './pages/TwoFactorVerification';

function App() {
  return (
    <Router>
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