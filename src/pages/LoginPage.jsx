import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Brain, AlertCircle, Loader } from 'lucide-react';
import { supabase, getUserRole, redirectByRole } from '../lib/supabaseClient';

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('يرجى تأكيد بريدك الإلكتروني أولاً');
        } else {
          setError('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى');
        }
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى');
        setLoading(false);
        return;
      }

      const role = await getUserRole(data.user.id);

      if (!role) {
        setError('لم يتم العثور على صلاحيات لهذا الحساب. يرجى التواصل مع الإدارة');
        setLoading(false);
        return;
      }

      redirectByRole(role, navigate);
    } catch (err) {
      console.error('Login error:', err);
      setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pattern p-4 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/10 to-[#8B7355]/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-[#8B7355]/10 to-[#654321]/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1.5s'}}></div>

      <div className="glass-effect p-10 rounded-3xl max-w-lg w-full card-hover relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#8B7355] to-[#654321] flex items-center justify-center shadow-lg">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-3">مرحباً بعودتك</h1>
          <p className="text-[#6B7280]">سجل دخولك للوصول إلى حسابك في فطن</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 text-sm flex-1">{error}</p>
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
                onChange={handleChange}
                className="input-modern w-full has-right-icon"
                placeholder="example@domain.com"
                required
                disabled={loading}
                autoComplete="email"
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
                onChange={handleChange}
                className="input-modern w-full has-both-icons"
                placeholder="أدخل كلمة المرور"
                required
                disabled={loading}
                autoComplete="current-password"
              />
              <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8B7355] hover:text-[#654321] transition-colors z-10"
                disabled={loading}
                aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-[#8B7355] border-2 border-[#8B7355]/30 rounded focus:ring-[#8B7355]"
                disabled={loading}
              />
              <span className="text-[#6B7280] text-sm">تذكرني</span>
            </label>
            <button
              type="button"
              className="text-[#8B7355] hover:text-[#D4AF37] text-sm font-medium transition-colors disabled:opacity-50"
              disabled={loading}
            >
              نسيت كلمة المرور؟
            </button>
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-4 text-lg font-semibold flex items-center justify-center gap-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>جاري تسجيل الدخول...</span>
              </>
            ) : (
              <>
                <span>تسجيل الدخول</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <div className="bg-gradient-to-r from-[#8B7355]/5 to-[#D4AF37]/5 p-4 rounded-xl border border-[#8B7355]/10">
            <p className="text-xs text-[#6B7280] text-center mb-2 font-semibold">حسابات التجربة:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/50 p-2 rounded">
                <p className="font-semibold text-[#8B7355]">Admin:</p>
                <p className="text-gray-600">admin@example.com</p>
              </div>
              <div className="bg-white/50 p-2 rounded">
                <p className="font-semibold text-[#8B7355]">Expert:</p>
                <p className="text-gray-600">expert@example.com</p>
              </div>
            </div>
          </div>
        </form>

        <div className="section-divider"></div>

        <p className="text-center text-[#6B7280]">
          ليس لديك حساب؟{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-[#8B7355] hover:text-[#D4AF37] font-semibold transition-colors underline decoration-2 underline-offset-4"
            disabled={loading}
          >
            إنشاء حساب جديد
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
