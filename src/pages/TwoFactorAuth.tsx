import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Phone } from 'lucide-react';

const TwoFactorAuth = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#D2B48C]/10 to-white p-4 bg-pattern">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-[#8B7355]/10">
            <Shield className="w-12 h-12 text-[#8B7355]" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-[#8B7355] mb-4">التحقق من الهوية</h1>
        <p className="text-center text-[#8B7355]/80 mb-8">
          للمتابعة، يرجى اختيار طريقة التحقق المناسبة
        </p>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setMethod('email')}
            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
              method === 'email'
                ? 'border-[#8B7355] bg-[#8B7355]/5'
                : 'border-gray-200 hover:border-[#8B7355]/50'
            }`}
          >
            <Mail className={`w-6 h-6 mx-auto mb-2 ${
              method === 'email' ? 'text-[#8B7355]' : 'text-gray-400'
            }`} />
            <div className={`text-center ${
              method === 'email' ? 'text-[#8B7355]' : 'text-gray-400'
            }`}>
              البريد الإلكتروني
            </div>
          </button>

          <button
            onClick={() => setMethod('phone')}
            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
              method === 'phone'
                ? 'border-[#8B7355] bg-[#8B7355]/5'
                : 'border-gray-200 hover:border-[#8B7355]/50'
            }`}
          >
            <Phone className={`w-6 h-6 mx-auto mb-2 ${
              method === 'phone' ? 'text-[#8B7355]' : 'text-gray-400'
            }`} />
            <div className={`text-center ${
              method === 'phone' ? 'text-[#8B7355]' : 'text-gray-400'
            }`}>
              رقم الجوال
            </div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[#8B7355] mb-2">
              {method === 'email' ? 'البريد الإلكتروني' : 'رقم الجوال'}
            </label>
            <input
              type={method === 'email' ? 'email' : 'tel'}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355]"
              placeholder={method === 'email' ? 'أدخل بريدك الإلكتروني' : 'أدخل رقم جوالك'}
              required
            />
          </div>

          <div>
            <label className="block text-[#8B7355] mb-2">رمز التحقق</label>
            <input
              type="text"
              maxLength={6}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] text-center text-2xl tracking-wider"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#8B7355] text-white py-3 rounded-lg hover:bg-[#654321] transition-colors"
          >
            تحقق وتابع
          </button>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-full text-[#8B7355] py-2 hover:underline"
          >
            تخطي التحقق مؤقتاً
          </button>
        </form>
      </div>
    </div>
  );
};

export default TwoFactorAuth;