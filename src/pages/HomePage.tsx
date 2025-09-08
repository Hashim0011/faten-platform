import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, BookOpen, Users, Shield } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // تحديد دور المستخدم بناءً على البريد الإلكتروني
    const email = formData.email.toLowerCase();
    
    if (email === 'admin@faten.com' || email === 'expert@faten.com') {
      navigate('/expert-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-pattern flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/20 to-[#8B7355]/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-[#8B7355]/20 to-[#654321]/20 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1.5s'}}></div>
      
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Welcome Content */}
        <div className="text-center lg:text-right space-y-8">
          {/* Logo and Title */}
          <div className="space-y-6">
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-8">
              <Sparkles className="w-8 h-8 text-[#D4AF37] animate-pulse" />
              <h1 className="text-5xl lg:text-6xl font-bold gradient-text text-shadow">فطن</h1>
              <Sparkles className="w-8 h-8 text-[#D4AF37] animate-pulse" style={{animationDelay: '0.5s'}} />
            </div>
            
            <div className="logo-container mx-auto lg:mx-0 animate-float mb-6">
              <div className="logo-shield"></div>
              <Brain className="logo-brain" />
            </div>
            
            <p className="text-lg lg:text-xl text-[#6B7280] leading-relaxed font-medium max-w-lg mx-auto lg:mx-0 mt-4">
              منصة فطن هي بوابتك للتعلم والنمو في مجال الأمن الفكري
            </p>
          </div>

          {/* Features Icons */}
          <div className="hidden lg:flex items-center justify-center lg:justify-start gap-8 mt-12">
            <div className="flex flex-col items-center gap-3 group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <span className="text-sm text-[#6B7280] font-medium">محتوى تعليمي</span>
            </div>
            
            <div className="flex flex-col items-center gap-3 group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <span className="text-sm text-[#6B7280] font-medium">مجتمع تفاعلي</span>
            </div>
            
            <div className="flex flex-col items-center gap-3 group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <span className="text-sm text-[#6B7280] font-medium">أمن فكري</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login/Register Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="glass-effect p-8 lg:p-10 rounded-3xl card-hover">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#2D2D2D] mb-3">
                {isLogin ? 'مرحباً بعودتك' : 'انضم إلى فطن'}
              </h2>
              <p className="text-[#6B7280]">
                {isLogin ? 'سجل دخولك للوصول إلى حسابك' : 'أنشئ حساباً جديداً وابدأ رحلتك التعليمية'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                      className="input-modern w-full pr-12"
                      placeholder="أدخل اسمك الكامل"
                      required={!isLogin}
                    />
                    <Brain className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5" />
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
                    className="input-modern w-full pr-12"
                    placeholder="example@domain.com"
                    required
                  />
                  <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5" />
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
                    className="input-modern w-full pr-12 pl-12"
                    placeholder={isLogin ? "أدخل كلمة المرور" : "أدخل كلمة مرور قوية"}
                    required
                  />
                  <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8B7355] hover:text-[#654321] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between">
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
                className="btn-primary w-full py-4 text-lg font-semibold flex items-center justify-center gap-3"
              >
                <span>{isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            <div className="section-divider"></div>

            <p className="text-center text-[#6B7280]">
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
      </div>

      {/* Mobile Features Icons */}
      <div className="lg:hidden absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-lg">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center shadow-lg">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center shadow-lg">
          <Shield className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default HomePage;