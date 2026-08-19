import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Mail, Phone, ArrowRight, Brain, Sparkles, RefreshCw, Clock } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';

// Temporary auth functions (replace with real API calls)
const verifyOTPCode = async (userId: string, code: string) => {
  return { success: true, message: 'تم التحقق بنجاح' };
};

const sendVerificationCode = async (userId: string, method: string) => {
  return { success: true, message: 'تم إرسال الكود' };
};

const getCurrentUserProfile = async (userId: string) => {
  return { role: 'user', name: 'مستخدم' };
};

const getDashboardRoute = (role: string) => {
  if (role === 'admin') return '/admin-dashboard';
  if (role === 'expert') return '/expert-dashboard';
  return '/dashboard';
};

const TwoFactorVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const contact = searchParams.get('contact') || searchParams.get('email'); // Support both contact and email params
  const type = (searchParams.get('type') as 'email' | 'phone') || 'email';
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const [selectedMethod, setSelectedMethod] = useState<'email' | 'phone'>(type);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isCodeSent, setIsCodeSent] = useState(true); // Already sent from registration
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [inputError, setInputError] = useState(false);
  const codeInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleMethodSelect = (method: 'email' | 'phone') => {
    setSelectedMethod(method);
    setIsCodeSent(false);
    setVerificationCode(['', '', '', '', '', '']);
  };

  const handleSendCode = () => {
    setIsCodeSent(true);
    setCountdown(60);
    // محاكاة إرسال الكود
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendCode = async () => {
    if (!contact) return;

    setIsResending(true);
    setError('');

    try {
      // إعادة إرسال OTP من Supabase
      const { error } = await supabase.auth.signInWithOtp({
        email: contact,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) throw error;

      setIsResending(false);
      handleSendCode(); // Start countdown
      showSuccess('تم إعادة إرسال رمز التحقق إلى بريدك الإلكتروني');
      console.log('✅ OTP resent to:', contact);
    } catch (err: any) {
      const errorMsg = err.message || 'حدث خطأ أثناء إعادة الإرسال';
      setError(errorMsg);
      setIsResending(false);
      showError(errorMsg);
      console.error('❌ Resend error:', err);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // الانتقال للحقل التالي تلقائياً
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const triggerInputError = () => {
    setInputError(true);
    // Reset animation after it completes
    setTimeout(() => setInputError(false), 500);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = verificationCode.join('');

    if (code.length !== 6) {
      setError('يرجى إدخال رمز التحقق كاملاً');
      showWarning('يرجى إدخال رمز التحقق المكون من 6 أرقام');
      triggerInputError();
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // Get email from URL params or localStorage
      const email = contact || localStorage.getItem('userEmail') || '';

      if (!email) {
        setError('لم يتم العثور على البريد الإلكتروني');
        setIsVerifying(false);
        showError('لم يتم العثور على البريد الإلكتروني. يرجى إعادة التسجيل');
        triggerInputError();
        return;
      }

      console.log('🔍 Verifying OTP for email:', email, 'Code:', code);

      // التحقق من OTP باستخدام Supabase
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: code,
        type: 'email',
      });

      if (error) throw error;

      console.log('✅ OTP verified successfully!', data);

      // إذا كان هذا تسجيل جديد، نضيف البيانات في جدول users
      if (data.user) {
        const fullName = localStorage.getItem('userFullName') || '';
        const phone = localStorage.getItem('userPhone') || '';

        // التحقق من وجود المستخدم في جدول users
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .single();

        if (!existingUser) {
          // إضافة المستخدم لجدول users
          const { error: insertError } = await supabase.from('users').insert({
            id: data.user.id,
            email: email,
            full_name: fullName,
            phone: phone || null,
            role: 'user',
            is_verified: true,
          });

          if (insertError) {
            console.error('⚠️ Error inserting user:', insertError);
          } else {
            console.log('✅ User added to database');
          }
        }
      }

      // Clear localStorage
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userFullName');
      localStorage.removeItem('userPhone');

      // Show success message
      showSuccess('تم التحقق بنجاح! جاري توجيهك إلى لوحة التحكم...');

      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err: any) {
      console.error('❌ Verification error:', err);
      const errorMsg = err.message || 'رمز التحقق غير صحيح أو منتهي الصلاحية';
      setError(errorMsg);
      setIsVerifying(false);
      showError(errorMsg);
      triggerInputError();
      // Clear the code inputs
      setVerificationCode(['', '', '', '', '', '']);
      codeInputsRef.current[0]?.focus();
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="bg-pattern relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Background decorative elements */}
      <div className="animate-pulse-slow absolute left-10 top-10 h-32 w-32 rounded-full bg-gradient-to-br from-[#D4AF37]/10 to-[#8B7355]/10 blur-3xl"></div>
      <div
        className="animate-pulse-slow absolute bottom-10 right-10 h-40 w-40 rounded-full bg-gradient-to-br from-[#8B7355]/10 to-[#654321]/10 blur-3xl"
        style={{ animationDelay: '1.5s' }}
      ></div>

      <div className="glass-effect card-hover w-full max-w-lg rounded-3xl p-8 sm:p-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <Sparkles className="h-6 w-6 animate-pulse text-[#D4AF37]" />
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B7355] to-[#654321]">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <Sparkles
              className="h-6 w-6 animate-pulse text-[#D4AF37]"
              style={{ animationDelay: '0.5s' }}
            />
          </div>
          <h1 className="gradient-text mb-3 text-3xl font-bold sm:text-4xl">التحقق من الهوية</h1>
          <p className="text-sm text-[#6B7280] sm:text-base">
            لحماية حسابك، يرجى اختيار طريقة التحقق المناسبة
          </p>
        </div>

        {!isCodeSent ? (
          <>
            {/* Method Selection */}
            <div className="mb-8 space-y-4">
              <h3 className="mb-6 text-center text-lg font-semibold text-[#2D2D2D]">
                اختر طريقة التحقق
              </h3>

              <button
                onClick={() => handleMethodSelect('email')}
                className={`w-full rounded-2xl border-2 p-6 transition-all ${
                  selectedMethod === 'email'
                    ? 'border-[#8B7355] bg-[#8B7355]/5 shadow-lg'
                    : 'border-[#8B7355]/20 hover:border-[#8B7355]/40 hover:bg-[#8B7355]/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      selectedMethod === 'email'
                        ? 'bg-gradient-to-br from-[#10B981] to-[#059669]'
                        : 'bg-[#8B7355]/10'
                    }`}
                  >
                    <Mail
                      className={`h-6 w-6 ${selectedMethod === 'email' ? 'text-white' : 'text-[#8B7355]'}`}
                    />
                  </div>
                  <div className="flex-1 text-right">
                    <h4
                      className={`text-lg font-semibold ${selectedMethod === 'email' ? 'text-[#8B7355]' : 'text-[#2D2D2D]'}`}
                    >
                      البريد الإلكتروني
                    </h4>
                    <p className="text-sm text-[#6B7280]">سنرسل رمز التحقق إلى بريدك الإلكتروني</p>
                    <p className="mt-1 text-sm font-medium text-[#8B7355]">
                      {contact || 'user@example.com'}
                    </p>
                  </div>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                      selectedMethod === 'email'
                        ? 'border-[#8B7355] bg-[#8B7355]'
                        : 'border-[#8B7355]/30'
                    }`}
                  >
                    {selectedMethod === 'email' && (
                      <div className="h-3 w-3 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleMethodSelect('phone')}
                className={`w-full rounded-2xl border-2 p-6 transition-all ${
                  selectedMethod === 'phone'
                    ? 'border-[#8B7355] bg-[#8B7355]/5 shadow-lg'
                    : 'border-[#8B7355]/20 hover:border-[#8B7355]/40 hover:bg-[#8B7355]/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      selectedMethod === 'phone'
                        ? 'bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]'
                        : 'bg-[#8B7355]/10'
                    }`}
                  >
                    <Phone
                      className={`h-6 w-6 ${selectedMethod === 'phone' ? 'text-white' : 'text-[#8B7355]'}`}
                    />
                  </div>
                  <div className="flex-1 text-right">
                    <h4
                      className={`text-lg font-semibold ${selectedMethod === 'phone' ? 'text-[#8B7355]' : 'text-[#2D2D2D]'}`}
                    >
                      رسالة نصية
                    </h4>
                    <p className="text-sm text-[#6B7280]">سنرسل رمز التحقق إلى رقم جوالك</p>
                    <p className="mt-1 text-sm font-medium text-[#8B7355]">+966 *** *** **45</p>
                  </div>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                      selectedMethod === 'phone'
                        ? 'border-[#8B7355] bg-[#8B7355]'
                        : 'border-[#8B7355]/30'
                    }`}
                  >
                    {selectedMethod === 'phone' && (
                      <div className="h-3 w-3 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={handleSendCode}
              className="btn-primary flex w-full items-center justify-center gap-3 py-4 text-lg font-semibold"
            >
              <span>إرسال رمز التحقق</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </>
        ) : (
          <>
            {/* Code Verification */}
            <div className="mb-8 text-center">
              <div
                className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${
                  selectedMethod === 'email'
                    ? 'bg-gradient-to-br from-[#10B981] to-[#059669]'
                    : 'bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]'
                }`}
              >
                {selectedMethod === 'email' ? (
                  <Mail className="h-8 w-8 text-white" />
                ) : (
                  <Phone className="h-8 w-8 text-white" />
                )}
              </div>
              <h3 className="mb-2 text-xl font-bold text-[#2D2D2D]">أدخل رمز التحقق</h3>
              <p className="text-sm text-[#6B7280]">
                تم إرسال رمز التحقق إلى{' '}
                {selectedMethod === 'email' ? 'بريدك الإلكتروني' : 'رقم جوالك'}
              </p>
              <p className="mt-1 text-sm font-medium text-[#8B7355]">
                {contact || 'user@example.com'}
              </p>
              <p className="mt-2 text-xs text-[#6B7280]">
                أدخل الرمز من اليسار إلى اليمين كما هو في الإيميل
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-8">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-center text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Code Input - من اليسار لليمين */}
              <div
                className={`flex justify-center gap-3 ${inputError ? 'animate-shake' : ''}`}
                dir="ltr"
              >
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (codeInputsRef.current[index] = el)}
                    id={`code-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`h-12 w-12 rounded-xl border-2 text-center text-xl font-bold transition-all focus:outline-none focus:ring-4 sm:h-14 sm:w-14 ${
                      inputError
                        ? 'border-red-500 bg-red-50'
                        : 'border-[#8B7355]/20 focus:border-[#8B7355] focus:ring-[#8B7355]/10'
                    }`}
                    placeholder="0"
                    autoComplete="off"
                  />
                ))}
              </div>

              {/* Countdown and Resend */}
              <div className="text-center">
                {countdown > 0 ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-[#6B7280]">
                    <Clock className="h-4 w-4" />
                    <span>إعادة الإرسال خلال {countdown} ثانية</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isResending}
                    className="mx-auto flex items-center justify-center gap-2 font-medium text-[#8B7355] transition-colors hover:text-[#D4AF37]"
                  >
                    <RefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
                    <span>{isResending ? 'جاري الإرسال...' : 'إعادة إرسال الرمز'}</span>
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={verificationCode.join('').length !== 6 || isVerifying}
                className="btn-primary flex w-full items-center justify-center gap-3 py-4 text-lg font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isVerifying ? (
                  <span>جاري التحقق...</span>
                ) : (
                  <>
                    <span>تحقق والمتابعة</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <button
              onClick={() => setIsCodeSent(false)}
              className="mt-4 w-full font-medium text-[#8B7355] transition-colors hover:text-[#D4AF37]"
            >
              تغيير طريقة التحقق
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TwoFactorVerification;
