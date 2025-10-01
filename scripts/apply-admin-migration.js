const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyAdminMigration() {
  try {
    console.log('🚀 بدء تطبيق migration حساب الإدارة...');

    // 1. إضافة قيد فريد على البريد الإلكتروني إذا لم يكن موجود
    console.log('📧 إضافة قيد فريد على البريد الإلكتروني...');
    const { error: constraintError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'users_email_key' 
            AND table_name = 'users'
          ) THEN
            ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
            RAISE NOTICE 'Added unique constraint on email column';
          ELSE
            RAISE NOTICE 'Unique constraint on email already exists';
          END IF;
        END $$;
      `
    });

    if (constraintError) {
      console.log('⚠️  تحذير في إضافة القيد:', constraintError.message);
    }

    // 2. إنشاء حساب الإدارة في auth.users
    console.log('👤 إنشاء حساب الإدارة في نظام المصادقة...');
    
    // تشفير كلمة المرور
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    const adminId = '00000000-0000-0000-0000-000000000001';
    const adminEmail = 'admin@faten.com';
    
    // إدراج في auth.users
    const { error: authError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO auth.users (
          id,
          instance_id,
          email,
          encrypted_password,
          email_confirmed_at,
          created_at,
          updated_at,
          role,
          aud,
          confirmation_token,
          email_change_token_new,
          recovery_token
        ) VALUES (
          '${adminId}',
          '00000000-0000-0000-0000-000000000000',
          '${adminEmail}',
          '${hashedPassword}',
          now(),
          now(),
          now(),
          'authenticated',
          'authenticated',
          '',
          '',
          ''
        )
        ON CONFLICT (email) DO UPDATE SET
          encrypted_password = EXCLUDED.encrypted_password,
          email_confirmed_at = now(),
          updated_at = now();
      `
    });

    if (authError) {
      console.log('⚠️  تحذير في إنشاء حساب المصادقة:', authError.message);
    }

    // 3. إدراج في جدول users
    console.log('📝 إضافة بيانات المستخدم...');
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: adminId,
        email: adminEmail,
        full_name: 'مدير النظام',
        role: 'other',
        status: 'active',
        phone: '+966500000000'
      }, {
        onConflict: 'email'
      });

    if (userError) {
      console.log('⚠️  تحذير في إضافة بيانات المستخدم:', userError.message);
    }

    console.log('✅ تم تطبيق migration حساب الإدارة بنجاح!');
    console.log('');
    console.log('🔐 بيانات تسجيل الدخول:');
    console.log('📧 البريد الإلكتروني: admin@faten.com');
    console.log('🔑 كلمة المرور: Admin123!');
    console.log('');

  } catch (error) {
    console.error('❌ خطأ في تطبيق migration:', error);
    process.exit(1);
  }
}

// تشغيل المهمة
applyAdminMigration();