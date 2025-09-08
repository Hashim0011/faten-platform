import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#D2B48C]/10 to-white p-4 bg-pattern">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-[#8B7355] mb-8">تسجيل الدخول</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[#8B7355] mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355]"
              required
            />
          </div>
          
          <div>
            <label className="block text-[#8B7355] mb-2">كلمة المرور</label>
            <input
              type="password"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355]"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-[#8B7355] text-white py-3 rounded-lg hover:bg-[#654321] transition-colors"
          >
            دخول
          </button>
        </form>
        
        <p className="text-center mt-6 text-[#8B7355]">
          ليس لديك حساب؟{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-[#654321] hover:underline"
          >
            إنشاء حساب جديد
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;