import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const SetupAccounts = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const setupAccounts = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Create admin account
      const { data: adminSignUp, error: adminError } = await supabase.auth.signUp({
        email: 'admin@example.com',
        password: 'Admin@123',
        options: {
          data: {
            role: 'admin',
            full_name: 'Platform Admin',
          },
        },
      });

      if (adminError && !adminError.message.includes('already')) {
        throw new Error('Admin creation failed: ' + adminError.message);
      }

      if (adminSignUp.user) {
        await supabase.from('admins').upsert({
          user_id: adminSignUp.user.id,
          full_name: 'Platform Admin',
          email: 'admin@example.com',
          status: 'active',
          permissions: { full_access: true },
        }, { onConflict: 'user_id' });
      }

      // Create expert account
      const { data: expertSignUp, error: expertError } = await supabase.auth.signUp({
        email: 'expert@example.com',
        password: 'Expert@123',
        options: {
          data: {
            role: 'expert',
            full_name: 'Platform Expert',
          },
        },
      });

      if (expertError && !expertError.message.includes('already')) {
        throw new Error('Expert creation failed: ' + expertError.message);
      }

      if (expertSignUp.user) {
        await supabase.from('experts').upsert({
          user_id: expertSignUp.user.id,
          full_name: 'Platform Expert',
          email: 'expert@example.com',
          specialization: 'Intellectual Security',
          status: 'active',
          bio: 'Platform expert account',
        }, { onConflict: 'user_id' });
      }

      setMessage('Accounts created successfully! Admin: admin@example.com / Admin@123, Expert: expert@example.com / Expert@123');

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Setup error:', err);
      setError(err.message || 'Failed to setup accounts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pattern p-4">
      <div className="glass-effect p-10 rounded-3xl max-w-lg w-full">
        <h1 className="text-3xl font-bold gradient-text mb-6 text-center">
          إعداد الحسابات
        </h1>

        <div className="space-y-4">
          <p className="text-center text-gray-600">
            سيتم إنشاء الحسابات التالية:
          </p>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="font-semibold text-[#8B7355]">Admin Account:</p>
            <p className="text-sm">Email: admin@example.com</p>
            <p className="text-sm">Password: Admin@123</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="font-semibold text-[#8B7355]">Expert Account:</p>
            <p className="text-sm">Email: expert@example.com</p>
            <p className="text-sm">Password: Expert@123</p>
          </div>

          {message && (
            <div className="p-4 rounded-xl bg-green-50 border border-green-200">
              <p className="text-green-600 text-sm text-center">{message}</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          <button
            onClick={setupAccounts}
            disabled={loading}
            className="btn-primary w-full py-4 text-lg font-semibold"
          >
            {loading ? 'جاري الإعداد...' : 'إنشاء الحسابات'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupAccounts;
