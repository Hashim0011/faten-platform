import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Phone, ArrowRight, Brain, Sparkles, RefreshCw, Clock } from 'lucide-react';

const TwoFactorVerification = () => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'phone'>('email');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);

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

  const handleResendCode = () => {
    setIsResending(true);
    setTimeout(() => {
      setIsResending(false);
      handleSendCode();
    }, 2000);
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

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const code = verificationCode.join('');
    if (code.length === 6) {
      // محاكاة التحقق
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-pattern flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/10 to-[#8B7355]/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-[#8B7355]/10 to-[#654321]/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1.5s'}}></div>
      
      <div className="glass-effect p-8 sm:p-10 rounded-3xl max-w-lg w-full card-hover">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-[#D4AF37] animate-pulse" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8B7355] to-[#654321] flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <Sparkles className="w-6 h-6 text-[#D4AF37] animate-pulse" style={{animationDelay: '0.5s'}} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-3">التحقق من الهوية</h1>
          <p className="text-[#6B7280] text-sm sm:text-base">لحماية حسابك، يرجى اختيار طريقة التحقق المناسبة</p>
        </div>

        {!isCodeSent ? (
          <>
            {/* Method Selection */}
            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-semibold text-[#2D2D2D] text-center mb-6">اختر طريقة التحقق</h3>
              
              <button
                onClick={() => handleMethodSelect('email')}
                className={`w-full p-6 rounded-2xl border-2 transition-all ${
                  selectedMethod === 'email'
                    ? 'border-[#8B7355] bg-[#8B7355]/5 shadow-lg'
                    : 'border-[#8B7355]/20 hover:border-[#8B7355]/40 hover:bg-[#8B7355]/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedMethod === 'email' 
                      ? 'bg-gradient-to-br from-[#10B981] to-[#059669]' 
                      : 'bg-[#8B7355]/10'
                  }`}>
                    <Mail className={`w-6 h-6 ${selectedMethod === 'email' ? 'text-white' : 'text-[#8B7355]'}`} />
                  </div>
                  <div className="flex-1 text-right">
                    <h4 className={`font-semibold text-lg ${selectedMethod === 'email' ? 'text-[#8B7355]' : 'text-[#2D2D2D]'}`}>
                      البريد الإلكتروني
                    </h4>
                    <p className="text-[#6B7280] text-sm">سنرسل رمز التحقق إلى بريدك الإلكتروني</p>
                    <p className="text-[#8B7355] text-sm font-medium mt-1">user@example.com</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod === 'email' 
                      ? 'border-[#8B7355] bg-[#8B7355]' 
                      : 'border-[#8B7355]/30'
                  }`}>
                    {selectedMethod === 'email' && <div className="w-3 h-3 bg-white rounded-full"></div>}
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleMethodSelect('phone')}
                className={`w-full p-6 rounded-2xl border-2 transition-all ${
                  selectedMethod === 'phone'
                    ? 'border-[#8B7355] bg-[#8B7355]/5 shadow-lg'
                    : 'border-[#8B7355]/20 hover:border-[#8B7355]/40 hover:bg-[#8B7355]/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedMethod === 'phone' 
                      ? 'bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]' 
                      : 'bg-[#8B7355]/10'
                  }`}>
                    <Phone className={`w-6 h-6 ${selectedMethod === 'phone' ? 'text-white' : 'text-[#8B7355]'}`} />
                  </div>
                  <div className="flex-1 text-right">
                    <h4 className={`font-semibold text-lg ${selectedMethod === 'phone' ? 'text-[#8B7355]' : 'text-[#2D2D2D]'}`}>
                      رسالة نصية
                    </h4>
                    <p className="text-[#6B7280] text-sm">سنرسل رمز التحقق إلى رقم جوالك</p>
                    <p className="text-[#8B7355] text-sm font-medium mt-1">+966 *** *** **45</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod === 'phone' 
                      ? 'border-[#8B7355] bg-[#8B7355]' 
                      : 'border-[#8B7355]/30'
                  }`}>
                    {selectedMethod === 'phone' && <div className="w-3 h-3 bg-white rounded-full"></div>}
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={handleSendCode}
              className="btn-primary w-full py-4 text-lg font-semibold flex items-center justify-center gap-3"
            >
              <span>إرسال رمز التحقق</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            {/* Code Verification */}
            <div className="text-center mb-8">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                selectedMethod === 'email' 
                  ? 'bg-gradient-to-br from-[#10B981] to-[#059669]' 
                  : 'bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]'
              }`}>
                {selectedMethod === 'email' ? (
                  <Mail className="w-8 h-8 text-white" />
                ) : (
                  <Phone className="w-8 h-8 text-white" />
                )}
              </div>
              <h3 className="text-xl font-bold text-[#2D2D2D] mb-2">أدخل رمز التحقق</h3>
              <p className="text-[#6B7280] text-sm">
                تم إرسال رمز التحقق إلى {selectedMethod === 'email' ? 'بريدك الإلكتروني' : 'رقم جوالك'}
              </p>
              <p className="text-[#8B7355] text-sm font-medium mt-1">
                {selectedMethod === 'email' ? 'user@example.com' : '+966 *** *** **45'}
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-8">
              {/* Code Input */}
              <div className="flex justify-center gap-3">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-bold border-2 border-[#8B7355]/20 rounded-xl focus:border-[#8B7355] focus:outline-none focus:ring-4 focus:ring-[#8B7355]/10 transition-all"
                    placeholder="0"
                  />
                ))}
              </div>

              {/* Countdown and Resend */}
              <div className="text-center">
                {countdown > 0 ? (
                  <div className="flex items-center justify-center gap-2 text-[#6B7280] text-sm">
                    <Clock className="w-4 h-4" />
                    <span>إعادة الإرسال خلال {countdown} ثانية</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isResending}
                    className="text-[#8B7355] hover:text-[#D4AF37] font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
                  >
                    <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
                    <span>{isResending ? 'جاري الإرسال...' : 'إعادة إرسال الرمز'}</span>
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={verificationCode.join('').length !== 6}
                className="btn-primary w-full py-4 text-lg font-semibold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>تحقق والمتابعة</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            <button
              onClick={() => setIsCodeSent(false)}
              className="w-full text-[#8B7355] hover:text-[#D4AF37] font-medium transition-colors mt-4"
            >
              تغيير طريقة التحقق
            </button>
          </>
        )}

        <div className="section-divider"></div>

        <div className="text-center">
          <button
            onClick={handleSkip}
            className="text-[#6B7280] hover:text-[#8B7355] text-sm transition-colors"
          >
            تخطي التحقق مؤقتاً (غير مستحسن)
          </button>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorVerification;