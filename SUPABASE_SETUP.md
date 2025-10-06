# 🚀 دليل إعداد Supabase لمنصة فطن

## 📋 الخطوات المطلوبة

### 1️⃣ الحصول على بيانات Supabase

1. اذهب إلى [dashboard.supabase.com](https://dashboard.supabase.com)
2. افتح مشروعك
3. من القائمة الجانبية، اختر **Settings** → **API**
4. انسخ القيم التالية:
   - **Project URL** (رابط المشروع)
   - **anon/public key** (المفتاح العام)

### 2️⃣ تحديث ملف .env

افتح ملف `.env` في جذر المشروع وضع القيم:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3️⃣ تنفيذ SQL Script في Supabase

1. في Supabase Dashboard، اذهب إلى **SQL Editor**
2. انسخ محتويات ملف `supabase-setup.sql`
3. الصق في SQL Editor
4. اضغط **Run** لتنفيذ الأوامر

سيتم إنشاء:
- ✅ جدول المستخدمين (users)
- ✅ جدول الخبراء (experts)
- ✅ جدول المديرين (admins)
- ✅ جدول المحتوى (content)
- ✅ جدول النقاشات (discussions)
- ✅ جدول الرسائل (messages)
- ✅ جدول الإشعارات (notifications)
- ✅ Row Level Security (RLS) Policies
- ✅ Functions & Triggers

### 4️⃣ إنشاء حسابات تجريبية للخبراء والمديرين

#### طريقة 1: من خلال Supabase Dashboard

1. اذهب إلى **Authentication** → **Users**
2. اضغط **Add User**
3. أضف البريد وكلمة المرور
4. بعد الإنشاء، اذهب إلى **Table Editor** → **users**
5. ابحث عن المستخدم وغير `role` إلى:
   - `expert` للخبير
   - `admin` للمدير

#### طريقة 2: باستخدام SQL

```sql
-- إنشاء خبير
-- أولاً: سجل المستخدم من واجهة التطبيق
-- ثم: قم بتحديث الدور

UPDATE users
SET role = 'expert'
WHERE email = 'expert@faten.com';

-- إضافة معلومات الخبير
INSERT INTO experts (user_id, specialization, verified)
SELECT id, 'أمن فكري', true
FROM users
WHERE email = 'expert@faten.com';

-- إنشاء مدير
UPDATE users
SET role = 'admin'
WHERE email = 'admin@faten.com';

-- إضافة صلاحيات المدير
INSERT INTO admins (user_id, permissions)
SELECT id, ARRAY['manage_users', 'manage_content', 'manage_discussions']
FROM users
WHERE email = 'admin@faten.com';
```

### 5️⃣ التحقق من الإعداد

شغّل المشروع:
```bash
npm run dev
```

جرب:
1. إنشاء حساب مستخدم عادي ✅
2. تسجيل دخول خبير ✅
3. تسجيل دخول مدير ✅

---

## 🔐 نظام الأدوار (Role-Based Access)

### المستخدم العادي (user)
- يمكنه إنشاء حساب جديد
- يمكنه المشاركة في النقاشات
- يمكنه عرض المحتوى التعليمي
- **التوجيه**: `/dashboard`

### الخبير (expert)
- حساب جاهز مسبقاً
- يمكنه إضافة محتوى تعليمي
- يمكنه إدارة النقاشات
- يمكنه حذف الرسائل غير المناسبة
- **التوجيه**: `/expert-dashboard`

### المدير (admin)
- حساب جاهز مسبقاً
- صلاحيات كاملة على المنصة
- إدارة المستخدمين
- إدارة المحتوى
- إدارة النقاشات
- **التوجيه**: `/admin-dashboard`

---

## 📊 بنية قاعدة البيانات

```
users (المستخدمون)
├── id (UUID)
├── email (نص)
├── full_name (نص)
├── phone (نص، اختياري)
├── role (user | expert | admin)
└── created_at (تاريخ)

experts (الخبراء)
├── user_id → users.id
├── specialization (تخصص)
├── bio (السيرة الذاتية)
└── verified (موثق؟)

admins (المديرون)
├── user_id → users.id
└── permissions (الصلاحيات)

content (المحتوى)
├── title (العنوان)
├── content_type (book | video | article)
├── created_by → users.id
└── likes_count (عدد الإعجابات)

discussions (النقاشات)
├── title (العنوان)
├── created_by → users.id
└── status (active | closed)

messages (الرسائل)
├── discussion_id → discussions.id
├── user_id → users.id
└── content (المحتوى)

notifications (الإشعارات)
├── user_id → users.id
├── title (العنوان)
├── message (الرسالة)
└── is_read (مقروءة؟)
```

---

## 🛡️ الأمان (Row Level Security)

تم تفعيل RLS على جميع الجداول:

- ✅ المستخدمون يمكنهم رؤية بياناتهم فقط
- ✅ الخبراء والمديرون فقط يمكنهم إضافة محتوى
- ✅ المستخدمون يمكنهم حذف رسائلهم فقط
- ✅ الجميع يمكنهم عرض المحتوى والنقاشات

---

## 📝 ملاحظات مهمة

1. **لا تشارك ملف `.env`** في Git (موجود في `.gitignore`)
2. استخدم `.env.example` كمرجع للمتغيرات المطلوبة
3. الحسابات التجريبية للخبراء والمديرين يجب إنشاؤها يدوياً
4. تأكد من تفعيل Email Confirmations في Supabase إذا أردت

---

## 🆘 حل المشاكل الشائعة

### مشكلة: "Invalid API key"
- تأكد من نسخ `anon key` وليس `service_role key`
- تأكد من عدم وجود مسافات زائدة

### مشكلة: "Table does not exist"
- تأكد من تنفيذ `supabase-setup.sql` كاملاً
- تحقق من وجود الجداول في Table Editor

### مشكلة: "Row Level Security policy violation"
- تحقق من أن المستخدم مسجل دخول
- تأكد من تطبيق الـ Policies بشكل صحيح

---

## 🎉 جاهز للاستخدام!

بعد اتباع الخطوات أعلاه، منصة فطن جاهزة للعمل مع Supabase! 🚀
