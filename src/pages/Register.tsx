import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Users, Phone } from 'lucide-react';
import { signUp } from '../lib/auth';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // التحقق من تطابق كلمات المرور
    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      setIsLoading(false);
      return;
    }

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.name,
        phone: formData.phone
      });

      navigate('/two-factor-verification');
    } catch (error: any) {
      console.error('خطأ في التسجيل:', error);
      setError(error.message || 'حدث خطأ، يرجى المحاولة مرة أخرى');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pattern p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/10 to-[#8B7355]/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-gradient-to-br from-[#8B7355]/10 to-[#654321]/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
      
      <div className="glass-effect p-10 rounded-3xl max-w-lg w-full card-hover">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-3">إنشاء حساب جديد</h1>
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
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input-modern w-full has-right-icon"
                placeholder="أدخل اسمك الكامل"
                required
              />
              <User className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5 pointer-events-none" />
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
                value={formData.phone}
                onChange={handleInputChange}
                className="input-modern w-full has-right-icon"
                placeholder="05xxxxxxxx"
                style={{ textAlign: 'right' }}
              />
              <Phone className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5 pointer-events-none" />
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
                value={formData.confirmPassword}
                onChange={handleInputChange}
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
            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-4 text-lg font-semibold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}</span>
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
        
        {/* Info about account types */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-xs text-blue-700 text-center">
            <strong>ملاحظة:</strong> التسجيل متاح للمستخدمين العاديين فقط. حسابات الخبراء والإدارة يتم إنشاؤها من قبل الإدارة.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;