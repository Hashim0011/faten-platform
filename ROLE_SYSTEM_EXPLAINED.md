# 🔐 نظام الأدوار في منصة فطن - توضيح شامل

## ❓ كيف يعمل نظام الأدوار؟

### 📊 بنية النظام:

```
┌─────────────────────────────────────────────────┐
│            جدول users (الرئيسي)                 │
├─────────────────────────────────────────────────┤
│  id    │ email           │ role   │ full_name  │
├────────┼─────────────────┼────────┼────────────┤
│  abc   │ user@ex.com     │ user   │ أحمد       │
│  def   │ expert@ex.com   │ expert │ د. سارة   │
│  ghi   │ admin@ex.com    │ admin  │ المدير    │
└────────┴─────────────────┴────────┴────────────┘
```

---

## ✅ سيناريو 1: إنشاء حساب مستخدم عادي

### 🎯 الخطوات:

1. **المستخدم يضغط على "مستخدم"** في RoleSelection
2. **ينتقل لصفحة التسجيل** `/register`
3. **يملأ البيانات**:
   - الاسم الكامل
   - البريد الإلكتروني
   - كلمة المرور
   - رقم الهاتف
4. **يضغط "إنشاء الحساب"**

### 💾 ما يحدث في الداتا بيس:

```javascript
// في ملف auth.ts → registerUser()

// 1. إنشاء المستخدم في Supabase Auth
supabase.auth.signUp({
  email: "user@example.com",
  password: "******",
  options: {
    data: {
      full_name: "أحمد محمد",
      role: "user" // ← هنا يُحدد الدور تلقائياً
    }
  }
});

// 2. إضافة سجل في جدول users
INSERT INTO users (id, email, full_name, role)
VALUES ('uuid-123', 'user@example.com', 'أحمد محمد', 'user');
```

### 🔒 الحماية:
- ✅ عند تسجيل الدخول، الدالة `loginUser()` تتحقق من `role = 'user'`
- ✅ إذا كان الدور غير `user` → رفض الدخول
- ✅ التوجيه **فقط** إلى `/dashboard`

---

## ✅ سيناريو 2: إنشاء حساب خبير

### ⚠️ هام: الخبراء لا يسجلون أنفسهم!

الخبراء يتم إنشاؤهم من قبل **المدير** أو يدوياً في Supabase.

### طريقة 1: من خلال Supabase Dashboard

```
1. الذهاب إلى Supabase Dashboard
2. Authentication → Users → Add User
3. إدخال البيانات:
   - Email: expert@faten.com
   - Password: ******
4. بعد الإنشاء، الذهاب إلى Table Editor → users
5. تعديل السجل وتغيير role من 'user' إلى 'expert'
6. (اختياري) إضافة معلومات في جدول experts
```

### طريقة 2: باستخدام SQL

```sql
-- خطوة 1: سجّل الدخول أولاً من واجهة التطبيق باستخدام البريد وكلمة المرور
-- (هذا سينشئ مستخدم عادي بـ role = 'user')

-- خطوة 2: قم بتحديث الدور إلى expert
UPDATE users
SET role = 'expert'
WHERE email = 'expert@faten.com';

-- خطوة 3: أضف معلومات الخبير في جدول experts
INSERT INTO experts (user_id, specialization, verified)
SELECT id, 'أمن فكري', true
FROM users
WHERE email = 'expert@faten.com';
```

### طريقة 3: من خلال لوحة الأدمن (مستقبلاً)

```
المدير → إدارة المستخدمين → ترقية مستخدم إلى خبير
```

### 🔒 الحماية:
- ✅ عند تسجيل الدخول من `/expert-login`، الدالة `loginExpert()` تتحقق من `role = 'expert'`
- ✅ إذا كان الدور غير `expert` → رفض الدخول مع رسالة خطأ
- ✅ التوجيه **فقط** إلى `/expert-dashboard`

---

## ✅ سيناريو 3: إنشاء حساب مدير

### ⚠️ هام: المدراء يتم إنشاؤهم يدوياً فقط!

نفس طريقة الخبير، ولكن بدور `admin`.

### SQL مثال:

```sql
-- خطوة 1: سجّل الدخول أولاً من واجهة التطبيق
-- (هذا سينشئ مستخدم عادي بـ role = 'user')

-- خطوة 2: قم بتحديث الدور إلى admin
UPDATE users
SET role = 'admin'
WHERE email = 'admin@faten.com';

-- خطوة 3: أضف صلاحيات المدير في جدول admins
INSERT INTO admins (user_id, permissions)
SELECT id, ARRAY['manage_users', 'manage_content', 'manage_discussions', 'manage_events']
FROM users
WHERE email = 'admin@faten.com';
```

### 🔒 الحماية:
- ✅ عند تسجيل الدخول من `/admin-login`، الدالة `loginAdmin()` تتحقق من `role = 'admin'`
- ✅ إذا كان الدور غير `admin` → رفض الدخول
- ✅ التوجيه **فقط** إلى `/admin-dashboard`

---

## 🚫 ماذا يحدث إذا حاول شخص الدخول بدور خاطئ؟

### مثال 1: مستخدم عادي يحاول الدخول من بوابة الخبير

```javascript
// المستخدم: user@example.com (role = 'user')
// يضغط على "خبير" من RoleSelection
// ينتقل لـ /expert-login
// يدخل بياناته

// في ملف auth.ts → loginExpert()
const { data: userData } = await supabase
  .from('users')
  .select('role')
  .eq('id', user.id)
  .single();

if (userData.role !== 'expert') {
  throw new Error('هذا الحساب ليس حساب خبير');
  // ← رفض الدخول ❌
}
```

### مثال 2: خبير يحاول الدخول من بوابة المستخدم

```javascript
// الخبير: expert@faten.com (role = 'expert')
// يحاول الدخول من /login

// في ملف auth.ts → loginUser()
if (userData.role !== 'user') {
  throw new Error('هذا الحساب ليس حساب مستخدم عادي');
  // ← رفض الدخول ❌
}
```

---

## 🎯 ملخص القواعد:

| الدور | كيف يُنشأ؟ | صفحة الدخول | اللوحة |
|------|----------|-------------|--------|
| **user** | ✅ من `/register` (أي شخص) | `/login` | `/dashboard` |
| **expert** | ⚠️ يدوياً من Supabase أو المدير | `/expert-login` | `/expert-dashboard` |
| **admin** | ⚠️ يدوياً من Supabase فقط | `/admin-login` | `/admin-dashboard` |

---

## 🔐 الحماية على مستوى قاعدة البيانات (RLS):

```sql
-- مثال: سياسة إنشاء محتوى
CREATE POLICY "Experts and admins can create content" ON content
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('expert', 'admin')  -- ← فقط الخبراء والمديرون
    )
  );
```

---

## ✅ لا لخبطة! كل شيء واضح:

1. ✅ **المستخدم العادي**: يسجل نفسه → `role = 'user'` → يدخل فقط من `/login` → `/dashboard`
2. ✅ **الخبير**: يُنشأ يدوياً → `role = 'expert'` → يدخل فقط من `/expert-login` → `/expert-dashboard`
3. ✅ **المدير**: يُنشأ يدوياً → `role = 'admin'` → يدخل فقط من `/admin-login` → `/admin-dashboard`

---

## 🚀 الآن واضح؟

- لا يوجد تداخل ❌
- كل دور له بوابة منفصلة ✅
- الداتا بيس تتحقق من الدور في كل عملية ✅
- مستحيل شخص يدخل لوحة غير لوحته ✅

كل شي محمي 100%! 🛡️
