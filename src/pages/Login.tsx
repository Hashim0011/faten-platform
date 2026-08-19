import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Brain } from 'lucide-react';
import { loginUser } from '../lib/auth';
import { useToast } from '../contexts/ToastContext';

const Login = () => {
  const navigate = useNavigate();
  const { showSuccess, showError: showErrorToast } = useToast();
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

    const result = await loginUser(email, password);

    if (result.success) {
      showSuccess('تم تسجيل الدخول بنجاح! جاري التوجيه...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } else {
      const errorMsg = result.error || 'حدث خطأ أثناء تسجيل الدخول';
      setError(errorMsg);
      showErrorToast(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="bg-pattern relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Background decorative elements */}
      <div className="animate-pulse-slow absolute left-10 top-10 h-32 w-32 rounded-full bg-gradient-to-br from-[#D4AF37]/10 to-[#8B7355]/10 blur-3xl"></div>
      <div
        className="animate-pulse-slow absolute bottom-10 right-10 h-40 w-40 rounded-full bg-gradient-to-br from-[#8B7355]/10 to-[#654321]/10 blur-3xl"
        style={{ animationDelay: '1.5s' }}
      ></div>

      <div className="glass-effect card-hover w-full max-w-md rounded-3xl p-10">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B7355] to-[#654321]">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="gradient-text mb-3 text-4xl font-bold">تسجيل دخول المستخدم</h1>
          <p className="text-[#6B7280]">مرحباً بك في بوابة المستخدمين</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="mb-3 block flex items-center gap-2 font-semibold text-[#2D2D2D]">
              <Mail className="h-4 w-4 text-[#8B7355]" />
              البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                className="input-modern has-right-icon w-full"
                placeholder="example@domain.com"
                required
              />
              <Mail className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-[#8B7355]" />
            </div>
          </div>

          <div>
            <label className="mb-3 block flex items-center gap-2 font-semibold text-[#2D2D2D]">
              <Lock className="h-4 w-4 text-[#8B7355]" />
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
              <Lock className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-[#8B7355]" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 transform text-[#8B7355] transition-colors hover:text-[#654321]"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <div className="mt-2 text-left">
              <button
                type="button"
                className="text-sm font-medium text-[#8B7355] transition-colors hover:text-[#D4AF37]"
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
            className="btn-primary flex w-full items-center justify-center gap-3 py-4 text-lg font-semibold disabled:cursor-not-allowed disabled:opacity-50"
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
            className="font-semibold text-[#8B7355] underline decoration-2 underline-offset-4 transition-colors hover:text-[#D4AF37]"
          >
            الصفحة الرئيسية
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
