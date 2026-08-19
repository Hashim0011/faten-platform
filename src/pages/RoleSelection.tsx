import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Shield, Users, UserCog, Sparkles, ArrowLeft } from 'lucide-react';

const RoleSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-pattern relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
      {/* Background decorative elements */}
      <div className="animate-pulse-slow absolute right-20 top-20 h-32 w-32 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#8B7355]/20 blur-3xl"></div>
      <div
        className="animate-pulse-slow absolute bottom-20 left-20 h-40 w-40 rounded-full bg-gradient-to-br from-[#8B7355]/20 to-[#654321]/20 blur-3xl"
        style={{ animationDelay: '1.5s' }}
      ></div>

      <div className="animate-float mb-16 px-6 text-center">
        <div className="mb-6 flex items-center justify-center gap-3">
          <Sparkles className="h-1 w-8 animate-pulse text-[#D4AF37]" />
          <h1 className="gradient-text text-shadow py-3 text-7xl font-bold leading-relaxed">فطن</h1>
          <Sparkles
            className="h-8 w-8 animate-pulse text-[#D4AF37]"
            style={{ animationDelay: '0.5s' }}
          />
        </div>
        <div className="logo-container animate-float mb-6" style={{ animationDelay: '0.5s' }}>
          <div className="logo-shield"></div>
          <Brain className="logo-brain" />
        </div>
        <p className="mx-auto max-w-xl px-4 text-lg font-medium leading-relaxed text-[#6B7280]">
          منصة فطن هي بوابتك للتعلم والنمو في مجال الأمن الفكري. اكتشف المحتوى التعليمي، شارك في
          النقاشات، وتواصل مع الخبراء.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-[#8B7355]">
          <span className="text-sm font-medium">اختر دورك للبدء</span>
          <ArrowLeft className="h-4 w-4 animate-bounce" style={{ animationDelay: '1s' }} />
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
        <button
          onClick={() => navigate('/register')}
          className="glass-effect card-hover group relative overflow-hidden rounded-3xl p-10"
        >
          <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-transparent blur-2xl"></div>
          <div className="relative">
            <div className="mx-auto mb-8 flex h-24 w-24 transform items-center justify-center rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] shadow-lg transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
              <Users className="h-12 w-12 text-white" />
            </div>
            <span className="status-badge status-new mb-4">الأكثر شيوعاً</span>
            <h2 className="mb-4 text-2xl font-bold text-[#2D2D2D]">مستخدم</h2>
            <p className="text-base leading-relaxed text-[#6B7280]">
              تصفح المحتوى التعليمي الموثوق وشارك في النقاشات التفاعلية مع المجتمع
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate('/expert-login')}
          className="glass-effect card-hover group relative overflow-hidden rounded-3xl p-10"
        >
          <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-gradient-to-br from-[#8B5CF6]/20 to-transparent blur-2xl"></div>
          <div className="relative">
            <div className="mx-auto mb-8 flex h-24 w-24 transform items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] shadow-lg transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
              <UserCog className="h-12 w-12 text-white" />
            </div>
            <span className="status-badge status-featured mb-4">مميز</span>
            <h2 className="mb-4 text-2xl font-bold text-[#2D2D2D]">خبير</h2>
            <p className="text-base leading-relaxed text-[#6B7280]">
              شارك خبراتك المتخصصة وقدم استشارات قيمة للمجتمع
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate('/admin-login')}
          className="glass-effect card-hover group relative overflow-hidden rounded-3xl p-10"
        >
          <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-gradient-to-br from-[#EF4444]/20 to-transparent blur-2xl"></div>
          <div className="relative">
            <div className="mx-auto mb-8 flex h-24 w-24 transform items-center justify-center rounded-2xl bg-gradient-to-br from-[#EF4444] to-[#DC2626] shadow-lg transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
              <Shield className="h-12 w-12 text-white" />
            </div>
            <span className="status-badge status-featured mb-4">مميز</span>
            <h2 className="mb-4 text-2xl font-bold text-[#2D2D2D]">مدير</h2>
            <p className="text-base leading-relaxed text-[#6B7280]">
              إدارة المنصة والإشراف على المحتوى والمستخدمين
            </p>
          </div>
        </button>
      </div>

      <div className="mt-16 text-center">
        <p className="text-sm text-[#8B7355]">
          لديك حساب بالفعل؟{' '}
          <button
            onClick={() => navigate('/login')}
            className="font-semibold text-[#654321] underline decoration-2 underline-offset-4 transition-colors hover:text-[#D4AF37]"
          >
            تسجيل الدخول
          </button>
        </p>
      </div>
    </div>
  );
};

export default RoleSelection;
