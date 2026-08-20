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
    <div className="bg-pattern relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Background decorative elements */}
      <div className="animate-pulse-slow absolute left-10 top-10 h-32 w-32 rounded-full bg-gradient-to-br from-[#8B5CF6]/10 to-[#7C3AED]/10 blur-3xl"></div>
      <div
        className="animate-pulse-slow absolute bottom-10 right-10 h-40 w-40 rounded-full bg-gradient-to-br from-[#7C3AED]/10 to-[#6D28D9]/10 blur-3xl"
        style={{ animationDelay: '1.5s' }}
      ></div>

      <div className="glass-effect card-hover w-full max-w-md rounded-3xl p-10">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]">
              <UserCog className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="gradient-text mb-3 text-4xl font-bold">تسجيل دخول الخبراء</h1>
          <p className="text-[#6B7280]">مرحباً بك في بوابة الخبراء</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="mb-3 block flex items-center gap-2 font-semibold text-[#2D2D2D]">
              <Mail className="h-4 w-4 text-[#8B5CF6]" />
              البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                className="input-modern has-right-icon w-full"
                placeholder="expert@domain.com"
                required
              />
              <Mail className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-[#8B5CF6]" />
            </div>
          </div>

          <div>
            <label className="mb-3 block flex items-center gap-2 font-semibold text-[#2D2D2D]">
              <Lock className="h-4 w-4 text-[#8B5CF6]" />
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="input-modern has-both-icons w-full"
                placeholder="أدخل كلمة المرور"
                required
              />
              <Lock className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-[#8B5CF6]" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 transform text-[#8B5CF6] transition-colors hover:text-[#7C3AED]"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <div className="mt-2 text-left">
              <button
                type="button"
                className="text-sm font-medium text-[#8B5CF6] transition-colors hover:text-[#7C3AED]"
              >
                نسيت كلمة المرور؟
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] py-4 text-lg font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>{loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </form>

        <div className="section-divider"></div>

        <p className="text-center text-[#6B7280]">
          العودة إلى{' '}
          <button
            onClick={() => navigate('/')}
            className="font-semibold text-[#8B5CF6] underline decoration-2 underline-offset-4 transition-colors hover:text-[#7C3AED]"
          >
            الصفحة الرئيسية
          </button>
        </p>
      </div>
    </div>
  );
};

export default ExpertLogin;
