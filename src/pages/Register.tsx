import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Phone } from 'lucide-react';
import { registerUser } from '../lib/auth';

const Register = () => {
  const navigate = useNavigate();
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
      setError('كلمات المرور غير متطابقة');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      setLoading(false);
      return;
    }

    // Register user
    const result = await registerUser(email, password, fullName, phone);

    if (result.success) {
      // Generate OTP and save to localStorage
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem('otp', otp);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userId', result.user?.id || '');

      // Print OTP to console for testing
      console.log('═══════════════════════════════════');
      console.log('🔐 رمز التحقق الخاص بك:');
      console.log('📱 OTP Code:', otp);
      console.log('═══════════════════════════════════');

      // Navigate to verification page
      navigate(`/two-factor-verification?email=${encodeURIComponent(email)}`);
    } else {
      setError(result.error || 'حدث خطأ أثناء التسجيل');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pattern p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/10 to-[#8B7355]/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-gradient-to-br from-[#8B7355]/10 to-[#654321]/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>

      <div className="glass-effect p-10 rounded-3xl max-w-lg w-full card-hover">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-3">إنشاء حساب مستخدم</h1>
          <p className="text-[#6B7280]">انضم إلى مجتمع فطن وابدأ رحلتك التعليمية</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[#2D2D2D] font-semibold mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-[#8B7355]" />
              الاسم الكامل
            </label>
            <div className="relative">
              <input
                type="text"
                name="fullName"
                className="input-modern w-full has-right-icon"
                placeholder="أدخل اسمك الكامل"
                required
              />
              <User className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5 pointer-events-none" />
            </div>
          </div>

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
              <Phone className="w-4 h-4 text-[#8B7355]" />
              رقم الجوال
            </label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                className="input-modern w-full has-right-icon"
                placeholder="+966 5X XXX XXXX"
                required
              />
              <Phone className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5 pointer-events-none" />
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
                placeholder="أدخل كلمة مرور قوية"
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

          <div>
            <label className="block text-[#2D2D2D] font-semibold mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#8B7355]" />
              تأكيد كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                className="input-modern w-full has-both-icons"
                placeholder="أعد إدخال كلمة المرور"
                required
              />
              <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8B7355] hover:text-[#654321] transition-colors z-10"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
            className="btn-primary w-full py-4 text-lg font-semibold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{loading ? 'جاري التسجيل...' : 'إنشاء الحساب'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="section-divider"></div>

        <p className="text-center text-[#6B7280]">
          لديك حساب بالفعل؟{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-[#8B7355] hover:text-[#D4AF37] font-semibold transition-colors underline decoration-2 underline-offset-4"
          >
            تسجيل الدخول
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
