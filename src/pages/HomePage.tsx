import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, BookOpen, Users, Shield, Phone } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      // تسجيل الدخول - الانتقال مباشرة للوحة التحكم
      const email = formData.email.toLowerCase();
      
      if (email === 'admin@faten.com') {
        navigate('/admin-dashboard');
      } else if (email === 'expert@faten.com') {
        navigate('/expert-dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      // التسجيل الجديد - الانتقال لصفحة التحقق بخطوتين
      navigate('/two-factor-verification');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-pattern flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/20 to-[#8B7355]/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-[#8B7355]/20 to-[#654321]/20 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1.5s'}}></div>
      
      {/* Header Section - Logo and Title */}
      <div className="text-center mb-12 animate-float">
        <div className="flex items-center justify-center gap-4 mb-6">
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-[#D4AF37] animate-pulse" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold gradient-text text-shadow leading-relaxed py-2" style={{fontFeatureSettings: '"liga" 1, "calt" 1'}}>فطن</h1>
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-[#D4AF37] animate-pulse" style={{animationDelay: '0.5s'}} />
        </div>
        
        <div className="logo-container mx-auto animate-float mb-4 sm:mb-6" style={{animationDelay: '0.5s'}}>
          <div className="logo-shield"></div>
          <Brain className="logo-brain" />
        </div>
        
        <p className="text-base sm:text-lg text-[#6B7280] leading-relaxed font-medium max-w-2xl mx-auto px-4">
          منصة فطن هي بوابتك للتعلم والنمو في مجال الأمن الفكري
        </p>
      </div>

      {/* Main Login Form */}
      <div className="w-full max-w-md mx-auto mb-8 sm:mb-12 px-4">
        <div className="glass-effect p-6 sm:p-8 lg:p-10 rounded-3xl card-hover">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2D2D2D] mb-3">
              {isLogin ? 'مرحباً بعودتك' : 'انضم إلى فطن'}
            </h2>
            <p className="text-sm sm:text-base text-[#6B7280]">
              {isLogin ? 'سجل دخولك للوصول إلى حسابك' : 'أنشئ حساباً جديداً وابدأ رحلتك التعليمية'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-[#2D2D2D] font-semibold mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-[#8B7355]" />
                  الاسم الكامل
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-modern w-full has-right-icon"
                    placeholder="أدخل اسمك الكامل"
                    required={!isLogin}
                  />
                  <Brain className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5 pointer-events-none" />
                </div>
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-[#2D2D2D] font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#8B7355]" />
                  نوع المستخدم
                </label>
                <div className="relative">
                  <select
                    name="role"
                    value={formData.role || ''}
                    onChange={handleInputChange}
                    className="input-modern w-full has-right-icon appearance-none cursor-pointer"
                    required={!isLogin}
                  >
                    <option value="">اختر نوع المستخدم</option>
                    <option value="parent">ولي أمر</option>
                    <option value="teacher">معلم</option>
                    <option value="student">طالب</option>
                    <option value="other">غير ذلك</option>
                  </select>
                  <Users className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5 pointer-events-none" />
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            )}
            {!isLogin && (
              <div>
                <label className="block text-[#2D2D2D] font-semibold mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#8B7355]" />
                  رقم الجوال
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-modern w-full has-right-icon"
                    placeholder="05xxxxxxxx"
                    style={{ textAlign: 'right' }}
                    required={!isLogin}
                  />
                  <Phone className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5 pointer-events-none" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[#2D2D2D] font-semibold mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#8B7355]" />
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-modern w-full has-right-icon"
                  placeholder="example@domain.com"
                  required
                />
                <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[#2D2D2D] font-semibold mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#8B7355]" />
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-modern w-full has-both-icons"
                  placeholder={isLogin ? "أدخل كلمة المرور" : "أدخل كلمة مرور قوية"}
                  required
                />
                <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8B7355] hover:text-[#654321] transition-colors z-10"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-[#8B7355] border-2 border-[#8B7355]/30 rounded focus:ring-[#8B7355]" />
                  <span className="text-[#6B7280] text-sm">تذكرني</span>
                </label>
                <button
                  type="button"
                  className="text-[#8B7355] hover:text-[#D4AF37] text-sm font-medium transition-colors"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full py-3 sm:py-4 text-base sm:text-lg font-semibold flex items-center justify-center gap-3"
            >
              <span>{isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="section-divider"></div>

          <p className="text-center text-sm sm:text-base text-[#6B7280]">
            {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#8B7355] hover:text-[#D4AF37] font-semibold transition-colors underline decoration-2 underline-offset-4"
            >
              {isLogin ? 'أنشئ حساب جديد' : 'تسجيل الدخول'}
            </button>
          </p>
        </div>
      </div>

      {/* Features Section - Bottom */}
      <div className="flex items-center justify-center gap-4 sm:gap-8 max-w-4xl mx-auto px-4">
        <div className="flex flex-col items-center gap-3 group">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <span className="text-xs sm:text-sm text-[#6B7280] font-medium text-center">محتوى تعليمي<br/>موثوق</span>
        </div>
        
        <div className="flex flex-col items-center gap-3 group">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <span className="text-xs sm:text-sm text-[#6B7280] font-medium text-center">مجتمع<br/>تفاعلي</span>
        </div>
        
        <div className="flex flex-col items-center gap-3 group">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <span className="text-xs sm:text-sm text-[#6B7280] font-medium text-center">أمن<br/>فكري</span>
        </div>
      </div>
    </div>
  );
};

export default HomePage;