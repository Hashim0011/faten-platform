import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

const SetupAccounts = () => {
  const [loading, setLoading] = useState(true);
  const [accountsExist, setAccountsExist] = useState({ admin: false, expert: false });
  const navigate = useNavigate();

  useEffect(() => {
    checkAccounts();
  }, []);

  const checkAccounts = async () => {
    try {
      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('email, role')
        .eq('email', 'admin@example.com')
        .eq('role', 'admin')
        .maybeSingle();

      const { data: expertProfile } = await supabase
        .from('profiles')
        .select('email, role')
        .eq('email', 'expert@example.com')
        .eq('role', 'expert')
        .maybeSingle();

      setAccountsExist({
        admin: !!adminProfile,
        expert: !!expertProfile
      });
    } catch (err) {
      console.error('Error checking accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pattern p-4">
        <div className="glass-effect p-10 rounded-3xl max-w-lg w-full text-center">
          <Loader className="w-12 h-12 mx-auto mb-4 animate-spin text-[#8B7355]" />
          <p className="text-gray-600">جاري التحقق من الحسابات...</p>
        </div>
      </div>
    );
  }

  const allAccountsReady = accountsExist.admin && accountsExist.expert;

  return (
    <div className="min-h-screen flex items-center justify-center bg-pattern p-4">
      <div className="glass-effect p-10 rounded-3xl max-w-lg w-full">
        <h1 className="text-3xl font-bold gradient-text mb-6 text-center">
          حالة حسابات المنصة
        </h1>

        {allAccountsReady ? (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-semibold text-gray-700 mb-2">
                الحسابات جاهزة للاستخدام!
              </p>
              <p className="text-sm text-gray-600">
                يمكنك تسجيل الدخول باستخدام الحسابات التالية:
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="font-semibold text-green-900">حساب المدير - Admin Account</p>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-gray-700">
                  <span className="font-medium">البريد الإلكتروني:</span> admin@example.com
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">كلمة المرور:</span> Admin@123
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <p className="font-semibold text-blue-900">حساب الخبير - Expert Account</p>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-gray-700">
                  <span className="font-medium">البريد الإلكتروني:</span> expert@example.com
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">كلمة المرور:</span> Expert@123
                </p>
              </div>
            </div>

            <button
              onClick={handleGoToLogin}
              className="btn-primary w-full py-4 text-lg font-semibold"
            >
              الانتقال لتسجيل الدخول
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-orange-500" />
              <p className="text-lg font-semibold text-gray-700 mb-2">
                الحسابات غير جاهزة
              </p>
              <p className="text-sm text-gray-600">
                يرجى تشغيل CREATE_PROFILES_TABLE.sql في قاعدة البيانات
              </p>
            </div>

            <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
              <p className="text-sm text-gray-700 mb-4">
                حالة الحسابات:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {accountsExist.admin ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="text-sm">
                    حساب المدير: {accountsExist.admin ? 'موجود' : 'غير موجود'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {accountsExist.expert ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="text-sm">
                    حساب الخبير: {accountsExist.expert ? 'موجود' : 'غير موجود'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={checkAccounts}
                className="btn-secondary flex-1 py-3"
              >
                إعادة التحقق
              </button>
              <button
                onClick={handleGoToLogin}
                className="btn-primary flex-1 py-3"
              >
                تسجيل الدخول
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetupAccounts;
