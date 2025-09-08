import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Shield, Users, UserCog } from 'lucide-react';

const RoleSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D2B48C]/30 via-[#F4EFE9] to-[#8B7355]/20 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-16">
        <h1 className="text-6xl font-bold text-[#654321] mb-4">فطن</h1>
        <div className="logo-container mb-8">
          <div className="logo-shield"></div>
          <Brain className="logo-brain" />
        </div>
        <p className="text-[#8B7355] text-xl max-w-2xl mx-auto leading-relaxed">
          منصة فطن هي بوابتك للتعلم والنمو في مجال الأمن الفكري. اكتشف المحتوى التعليمي، شارك في النقاشات، وتواصل مع الخبراء.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/register', { state: { role: 'user' } })}
          className="bg-white bg-opacity-90 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-[#8B7355]/20 hover:border-[#8B7355]/40 transition-all group"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#8B7355] to-[#654321] flex items-center justify-center transform group-hover:rotate-12 transition-transform">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#654321] mb-3">مستخدم</h2>
          <p className="text-[#8B7355] text-sm">تصفح المحتوى وشارك في النقاشات</p>
        </button>

        <button
          onClick={() => navigate('/register', { state: { role: 'expert' } })}
          className="bg-white bg-opacity-90 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-[#8B7355]/20 hover:border-[#8B7355]/40 transition-all group"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#8B7355] to-[#654321] flex items-center justify-center transform group-hover:rotate-12 transition-transform">
            <UserCog className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#654321] mb-3">خبير</h2>
          <p className="text-[#8B7355] text-sm">قدم استشارات وشارك خبراتك</p>
        </button>

        <button
          onClick={() => navigate('/register', { state: { role: 'admin' } })}
          className="bg-white bg-opacity-90 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-[#8B7355]/20 hover:border-[#8B7355]/40 transition-all group"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#8B7355] to-[#654321] flex items-center justify-center transform group-hover:rotate-12 transition-transform">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#654321] mb-3">مشرف</h2>
          <p className="text-[#8B7355] text-sm">إدارة المحتوى والمستخدمين</p>
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;