import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';

const Register = () => {
  const navigate = useNavigate();
  const { showSuccess, showError: showErrorToast, showWarning } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Validation
    if (password !== confirmPassword) {
      const errorMsg = 'كلمات المرور غير متطابقة';
      setError(errorMsg);
      showErrorToast(errorMsg);
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      const errorMsg = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
      setError(errorMsg);
      showErrorToast(errorMsg);
      setLoading(false);
      return;
    }

    try {
      // استخدام Supabase Email OTP للتسجيل
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            role: 'user',
          },
          shouldCreateUser: true,
        },
      });

      if (error) throw error;

      console.log('✅ OTP sent successfully to:', email);

      // حفظ البيانات للصفحة التالية
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userFullName', fullName);
      localStorage.setItem('userPhone', phone);

      // عرض رسالة نجاح
      showSuccess('تم إرسال رمز التحقق إلى بريدك الإلكتروني! تفقد بريدك.');

      // الانتقال لصفحة التحقق
      setTimeout(() => {
        navigate(
          `/two-factor-verification?email=${encodeURIComponent(email)}&name=${encodeURIComponent(fullName)}`
        );
      }, 1500);
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      const errorMsg = error.message || 'حدث خطأ أثناء التسجيل';
      setError(errorMsg);
      showErrorToast(errorMsg);
    }

    setLoading(false);
  };

  return (
    <div className="bg-pattern relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Background decorative elements */}
      <div className="animate-pulse-slow absolute right-10 top-10 h-32 w-32 rounded-full bg-gradient-to-br from-[#D4AF37]/10 to-[#8B7355]/10 blur-3xl"></div>
      <div
        className="animate-pulse-slow absolute bottom-10 left-10 h-40 w-40 rounded-full bg-gradient-to-br from-[#8B7355]/10 to-[#654321]/10 blur-3xl"
        style={{ animationDelay: '1s' }}
      ></div>

      <div className="glass-effect card-hover w-full max-w-lg rounded-3xl p-10">
        <div className="mb-8 text-center">
          <h1 className="gradient-text mb-3 text-4xl font-bold">إنشاء حساب مستخدم</h1>
          <p className="text-[#6B7280]">انضم إلى مجتمع فطن وابدأ رحلتك التعليمية</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="mb-3 block flex items-center gap-2 font-semibold text-[#2D2D2D]">
              <User className="h-4 w-4 text-[#8B7355]" />
              الاسم الكامل
            </label>
            <div className="relative">
              <input
                type="text"
                name="fullName"
                className="input-modern has-right-icon w-full"
                placeholder="أدخل اسمك الكامل"
                required
              />
              <User className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-[#8B7355]" />
            </div>
          </div>

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
              <Phone className="h-4 w-4 text-[#8B7355]" />
              رقم الجوال
            </label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                className="input-modern has-right-icon w-full"
                placeholder="+966 5X XXX XXXX"
                required
              />
              <Phone className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-[#8B7355]" />
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
                placeholder="أدخل كلمة مرور قوية"
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
          </div>

          <div>
            <label className="mb-3 block flex items-center gap-2 font-semibold text-[#2D2D2D]">
              <Lock className="h-4 w-4 text-[#8B7355]" />
              تأكيد كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                className="input-modern has-both-icons w-full"
                placeholder="أعد إدخال كلمة المرور"
                required
              />
              <Lock className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-[#8B7355]" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 transform text-[#8B7355] transition-colors hover:text-[#654321]"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
            <span>{loading ? 'جاري التسجيل...' : 'إنشاء الحساب'}</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </form>

        <div className="section-divider"></div>

        <p className="text-center text-[#6B7280]">
          لديك حساب بالفعل؟{' '}
          <button
            onClick={() => navigate('/login')}
            className="font-semibold text-[#8B7355] underline decoration-2 underline-offset-4 transition-colors hover:text-[#D4AF37]"
          >
            تسجيل الدخول
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
