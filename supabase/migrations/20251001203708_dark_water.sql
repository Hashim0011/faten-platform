/*
  # إصلاح نظام المصادقة والتسجيل مع فصل الأدوار

  1. الجداول الجديدة
    - `users` - المستخدمون العاديون (طلاب، معلمون، أولياء أمور)
    - `experts` - الخبراء (يتم إنشاؤهم يدوياً)
    - `admins` - المديرون (يتم إنشاؤهم يدوياً)

  2. الأمان
    - تمكين RLS على جميع الجداول
    - سياسات مناسبة لكل دور
    - ربط آمن مع نظام المصادقة

  3. الحسابات المُعدة مسبقاً
    - حساب إدارة: admin@faten.com
    - حساب خبير: expert@faten.com
*/

-- إنشاء دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- فحص وإنشاء جدول المستخدمين العاديين
DO $$
BEGIN
    -- إنشاء الجدول إذا لم يكن موجوداً
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE TABLE users (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
            email text NOT NULL,
            full_name text NOT NULL,
            phone text,
            role user_role DEFAULT 'student',
            status user_status DEFAULT 'active',
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now(),
            last_active timestamptz DEFAULT now(),
            hours_spent numeric DEFAULT 0,
            engagement_rate numeric DEFAULT 0,
            content_engaged integer DEFAULT 0,
            discussions_participated integer DEFAULT 0
        );
    END IF;

    -- إضافة القيود المطلوبة إذا لم تكن موجودة
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'users_user_id_key') THEN
        ALTER TABLE users ADD CONSTRAINT users_user_id_key UNIQUE (user_id);
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'users_email_key') THEN
        ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
    END IF;

    -- إضافة الفهارس
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_users_email') THEN
        CREATE INDEX idx_users_email ON users(email);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_users_role') THEN
        CREATE INDEX idx_users_role ON users(role);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_users_status') THEN
        CREATE INDEX idx_users_status ON users(status);
    END IF;

    -- إضافة trigger لتحديث updated_at
    IF NOT EXISTS (SELECT FROM information_schema.triggers WHERE trigger_name = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at
            BEFORE UPDATE ON users
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- فحص وإنشاء جدول الخبراء
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'experts') THEN
        CREATE TABLE experts (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
            specialization text NOT NULL,
            bio text,
            rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
            discussions_handled integer DEFAULT 0,
            activity_hours numeric DEFAULT 0,
            engagement_rate numeric DEFAULT 0,
            verified boolean DEFAULT false,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
        );
    END IF;

    -- إضافة القيود المطلوبة
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'experts_user_id_key') THEN
        ALTER TABLE experts ADD CONSTRAINT experts_user_id_key UNIQUE (user_id);
    END IF;

    -- إضافة الفهارس
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_experts_user_id') THEN
        CREATE INDEX idx_experts_user_id ON experts(user_id);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_experts_specialization') THEN
        CREATE INDEX idx_experts_specialization ON experts(specialization);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_experts_rating') THEN
        CREATE INDEX idx_experts_rating ON experts(rating);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_experts_verified') THEN
        CREATE INDEX idx_experts_verified ON experts(verified);
    END IF;

    -- إضافة trigger لتحديث updated_at
    IF NOT EXISTS (SELECT FROM information_schema.triggers WHERE trigger_name = 'update_experts_updated_at') THEN
        CREATE TRIGGER update_experts_updated_at
            BEFORE UPDATE ON experts
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- فحص وإنشاء جدول المديرين
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admins') THEN
        CREATE TABLE admins (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
            email text NOT NULL,
            full_name text NOT NULL,
            permissions text[] DEFAULT ARRAY['read', 'write', 'delete', 'manage_users', 'manage_content'],
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
        );
    END IF;

    -- إضافة القيود المطلوبة
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'admins_user_id_key') THEN
        ALTER TABLE admins ADD CONSTRAINT admins_user_id_key UNIQUE (user_id);
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'admins_email_key') THEN
        ALTER TABLE admins ADD CONSTRAINT admins_email_key UNIQUE (email);
    END IF;

    -- إضافة الفهارس
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_admins_user_id') THEN
        CREATE INDEX idx_admins_user_id ON admins(user_id);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_admins_email') THEN
        CREATE INDEX idx_admins_email ON admins(email);
    END IF;

    -- إضافة trigger لتحديث updated_at
    IF NOT EXISTS (SELECT FROM information_schema.triggers WHERE trigger_name = 'update_admins_updated_at') THEN
        CREATE TRIGGER update_admins_updated_at
            BEFORE UPDATE ON admins
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- تمكين RLS على جميع الجداول
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان لجدول المستخدمين
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
    ON users FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data"
    ON users FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own data" ON users;
CREATE POLICY "Users can insert own data"
    ON users FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all users" ON users;
CREATE POLICY "Admins can manage all users"
    ON users FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid()
        )
    );

-- سياسات الأمان لجدول الخبراء
DROP POLICY IF EXISTS "Experts can read own data" ON experts;
CREATE POLICY "Experts can read own data"
    ON experts FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Experts can update own data" ON experts;
CREATE POLICY "Experts can update own data"
    ON experts FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can read verified experts" ON experts;
CREATE POLICY "Anyone can read verified experts"
    ON experts FOR SELECT
    TO authenticated
    USING (verified = true);

DROP POLICY IF EXISTS "Admins can manage all experts" ON experts;
CREATE POLICY "Admins can manage all experts"
    ON experts FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid()
        )
    );

-- سياسات الأمان لجدول المديرين
DROP POLICY IF EXISTS "Admins can read own data" ON admins;
CREATE POLICY "Admins can read own data"
    ON admins FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update own data" ON admins;
CREATE POLICY "Admins can update own data"
    ON admins FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- دالة لإنشاء المستخدم تلقائياً عند التسجيل
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- إنشاء مستخدم عادي فقط إذا لم يكن خبير أو مدير
    IF NOT EXISTS (SELECT 1 FROM experts WHERE user_id = NEW.id) 
       AND NOT EXISTS (SELECT 1 FROM admins WHERE user_id = NEW.id) THEN
        INSERT INTO users (user_id, email, full_name, phone, role)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
            NEW.raw_user_meta_data->>'phone',
            'student'
        )
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = COALESCE(EXCLUDED.full_name, users.full_name),
            phone = COALESCE(EXCLUDED.phone, users.phone),
            updated_at = now();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ربط الدالة بـ trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- إنشاء الحسابات المُعدة مسبقاً
DO $$
DECLARE
    admin_user_id uuid;
    expert_user_id uuid;
    admin_encrypted_password text;
    expert_encrypted_password text;
BEGIN
    -- تشفير كلمات المرور
    admin_encrypted_password := crypt('Admin123!', gen_salt('bf'));
    expert_encrypted_password := crypt('Expert123!', gen_salt('bf'));

    -- إنشاء حساب المدير
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        role,
        aud
    ) VALUES (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'admin@faten.com',
        admin_encrypted_password,
        now(),
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"role": "admin", "full_name": "مدير النظام"}',
        false,
        'authenticated',
        'authenticated'
    )
    ON CONFLICT (email) DO UPDATE SET
        encrypted_password = EXCLUDED.encrypted_password,
        email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
        updated_at = now(),
        raw_user_meta_data = EXCLUDED.raw_user_meta_data
    RETURNING id INTO admin_user_id;

    -- إضافة بيانات المدير
    INSERT INTO admins (user_id, email, full_name)
    VALUES (
        COALESCE(admin_user_id, (SELECT id FROM auth.users WHERE email = 'admin@faten.com')),
        'admin@faten.com',
        'مدير النظام'
    )
    ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = now();

    -- إنشاء حساب الخبير
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        role,
        aud
    ) VALUES (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'expert@faten.com',
        expert_encrypted_password,
        now(),
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"role": "expert", "full_name": "د. أحمد السالم"}',
        false,
        'authenticated',
        'authenticated'
    )
    ON CONFLICT (email) DO UPDATE SET
        encrypted_password = EXCLUDED.encrypted_password,
        email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
        updated_at = now(),
        raw_user_meta_data = EXCLUDED.raw_user_meta_data
    RETURNING id INTO expert_user_id;

    -- إضافة بيانات الخبير
    INSERT INTO experts (user_id, specialization, bio, verified, rating)
    VALUES (
        COALESCE(expert_user_id, (SELECT id FROM auth.users WHERE email = 'expert@faten.com')),
        'الأمن الفكري',
        'خبير متخصص في مجال الأمن الفكري والتربية الإسلامية',
        true,
        4.8
    )
    ON CONFLICT (user_id) DO UPDATE SET
        specialization = EXCLUDED.specialization,
        bio = EXCLUDED.bio,
        verified = EXCLUDED.verified,
        rating = EXCLUDED.rating,
        updated_at = now();

END $$;