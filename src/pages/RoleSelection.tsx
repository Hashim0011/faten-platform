import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Shield, Users, UserCog, Sparkles, ArrowLeft } from 'lucide-react';

const RoleSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-pattern flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/20 to-[#8B7355]/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-[#8B7355]/20 to-[#654321]/20 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1.5s'}}></div>
      
      <div className="text-center mb-16 animate-float px-6">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Sparkles className="w-8 h-1 text-[#D4AF37] animate-pulse" />
          <h1 className="text-7xl font-bold gradient-text text-shadow leading-relaxed py-3">فطن</h1>
          <Sparkles className="w-8 h-8 text-[#D4AF37] animate-pulse" style={{animationDelay: '0.5s'}} />
        </div>
        <div className="logo-container mb-6 animate-float" style={{animationDelay: '0.5s'}}>
          <div className="logo-shield"></div>
          <Brain className="logo-brain" />
        </div>
        <p className="text-[#6B7280] text-lg max-w-xl mx-auto leading-relaxed font-medium px-4">
          منصة فطن هي بوابتك للتعلم والنمو في مجال الأمن الفكري. اكتشف المحتوى التعليمي، شارك في النقاشات، وتواصل مع الخبراء.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-[#8B7355]">
          <span className="text-sm font-medium">اختر دورك للبدء</span>
          <ArrowLeft className="w-4 h-4 animate-bounce" style={{animationDelay: '1s'}} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/register', { state: { role: 'user' } })}
          className="glass-effect p-10 rounded-3xl card-hover group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#D4AF37]/20 to-transparent rounded-full blur-2xl"></div>
          <div className="relative">
            <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
              <Users className="w-12 h-12 text-white" />
            </div>
            <span className="status-badge status-new mb-4">الأكثر شيوعاً</span>
            <h2 className="text-2xl font-bold text-[#2D2D2D] mb-4">مستخدم</h2>
            <p className="text-[#6B7280] text-base leading-relaxed">تصفح المحتوى التعليمي الموثوق وشارك في النقاشات التفاعلية مع المجتمع</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/register', { state: { role: 'expert' } })}
          className="glass-effect p-10 rounded-3xl card-hover group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#8B5CF6]/20 to-transparent rounded-full blur-2xl"></div>
          <div className="relative">
            <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
              <UserCog className="w-12 h-12 text-white" />
            </div>
            <span className="status-badge status-featured mb-4">مميز</span>
            <h2 className="text-2xl font-bold text-[#2D2D2D] mb-4">خبير</h2>
            <p className="text-[#6B7280] text-base leading-relaxed">شارك خبراتك المتخصصة وقدم استشارات قيمة للمجتمع</p>
          </div>
        </button>
      </div>
      
      <div className="mt-16 text-center">
        <p className="text-[#8B7355] text-sm">
          لديك حساب بالفعل؟{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-[#654321] hover:text-[#D4AF37] font-semibold transition-colors underline decoration-2 underline-offset-4"
          >
            تسجيل الدخول
          </button>
        </p>
      </div>
    </div>
  );
};

export default RoleSelection;