import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Brain } from 'lucide-react';
import { useState } from 'react';
import { signIn, getUserRole } from '../lib/auth';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { user } = await signIn({ email, password });
      
      if (user) {
        const userRole = await getUserRole(user.id);
        
        // توجيه المستخدم حسب دوره
        switch (userRole) {
          case 'admin':
            navigate('/admin-dashboard');
            break;
          case 'expert':
            navigate('/expert-dashboard');
            break;
          default:
            navigate('/dashboard');
        }
      }
    } catch (error: any) {
      console.error('خطأ في تسجيل الدخول:', error);
      setError('بيانات الدخول غير صحيحة، يرجى المحاولة مرة أخرى');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pattern p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/10 to-[#8B7355]/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-[#8B7355]/10 to-[#654321]/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1.5s'}}></div>
      
      <div className="glass-effect p-10 rounded-3xl max-w-lg w-full card-hover">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#8B7355] to-[#654321] flex items-center justify-center">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-3">مرحباً بعودتك</h1>
          <p className="text-[#6B7280] -mt-1">سجل دخولك للوصول إلى حسابك في فطن</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[#2D2D2D] font-semibold mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#8B7355]" />
              البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
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
                className="input-modern w-full has-both-icons"
                placeholder="أدخل كلمة المرور"
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
          
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 mb-6">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-4 text-lg font-semibold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
        
        <div className="section-divider"></div>
        
        <p className="text-center text-[#6B7280]">
          ليس لديك حساب؟{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-[#8B7355] hover:text-[#D4AF37] font-semibold transition-colors underline decoration-2 underline-offset-4"
          >
            إنشاء حساب جديد
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;