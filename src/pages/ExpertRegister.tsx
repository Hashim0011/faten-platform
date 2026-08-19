import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, User, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ExpertRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 1. إنشاء المستخدم في Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            role: 'expert',
          },
        },
      });

      if (authError) throw authError;

      // 2. إضافة بيانات الخبير في جدول users
      if (authData.user) {
        const { error: dbError } = await supabase.from('users').insert({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.fullName,
          phone: formData.phone,
          role: 'expert',
        });

        if (dbError) throw dbError;
      }

      setSuccess('✅ تم إنشاء حساب الخبير بنجاح!');
      setFormData({ email: '', password: '', fullName: '', phone: '' });

      // عرض معلومات الحساب
      console.log('═══════════════════════════════════');
      console.log('✅ تم إنشاء حساب خبير جديد');
      console.log('📧 البريد:', formData.email);
      console.log('👤 الاسم:', formData.fullName);
      console.log('═══════════════════════════════════');
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'حدث خطأ أثناء إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50 p-4"
      dir="rtl"
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">إنشاء حساب خبير</h1>
          <p className="text-gray-600">صفحة خاصة لإنشاء حسابات الخبراء</p>
        </div>

        {/* Form */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-600">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">الاسم الكامل</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 py-3 pl-4 pr-12 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                  placeholder="أدخل الاسم الكامل"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 py-3 pl-4 pr-12 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                  placeholder="example@domain.com"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">رقم الجوال</label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 py-3 pl-4 pr-12 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                  placeholder="05xxxxxxxx"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 py-3 pl-4 pr-12 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                  placeholder="أدخل كلمة مرور قوية"
                  minLength={6}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 py-3 font-semibold text-white transition-all hover:from-purple-700 hover:to-purple-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'جاري الإنشاء...' : 'إنشاء حساب الخبير'}
            </button>
          </form>

          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="mt-4 w-full font-medium text-purple-600 hover:text-purple-700"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
}
