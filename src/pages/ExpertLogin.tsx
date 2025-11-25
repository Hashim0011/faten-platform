import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, UserCog } from 'lucide-react';
import { loginExpert } from '../lib/auth';

const ExpertLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const result = await loginExpert(email, password);

    if (result.success) {
      navigate('/expert-dashboard');
    } else {
      setError(result.error || 'حدث خطأ أثناء تسجيل الدخول');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pattern p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-[#8B5CF6]/10 to-[#7C3AED]/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-[#7C3AED]/10 to-[#6D28D9]/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1.5s'}}></div>

      <div className="glass-effect p-10 rounded-3xl max-w-md w-full card-hover">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center">
              <UserCog className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-3">تسجيل دخول الخبراء</h1>
          <p className="text-[#6B7280]">مرحباً بك في بوابة الخبراء</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[#2D2D2D] font-semibold mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#8B5CF6]" />
              البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                className="input-modern w-full has-right-icon"
                placeholder="expert@domain.com"
                required
              />
              <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8B5CF6] w-5 h-5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[#2D2D2D] font-semibold mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#8B5CF6]" />
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
              <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8B5CF6] w-5 h-5 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8B5CF6] hover:text-[#7C3AED] transition-colors z-10"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="mt-2 text-left">
              <button
                type="button"
                className="text-sm text-[#8B5CF6] hover:text-[#7C3AED] transition-colors font-medium"
              >
                نسيت كلمة المرور؟
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-lg font-semibold flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="section-divider"></div>

        <p className="text-center text-[#6B7280]">
          العودة إلى{' '}
          <button
            onClick={() => navigate('/')}
            className="text-[#8B5CF6] hover:text-[#7C3AED] font-semibold transition-colors underline decoration-2 underline-offset-4"
          >
            الصفحة الرئيسية
          </button>
        </p>
      </div>
    </div>
  );
};

export default ExpertLogin;
