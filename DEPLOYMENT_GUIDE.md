# 🚀 دليل النشر والتشغيل - منصة فطن

## 📋 المحتويات
1. [إعداد قاعدة البيانات](#database-setup)
2. [تشغيل المشروع محلياً](#local-development)
3. [إنشاء الحسابات](#create-accounts)
4. [اختبار الميزات](#testing)
5. [النشر للإنتاج](#production-deployment)

---

## 🗄️ 1. إعداد قاعدة البيانات {#database-setup}

### الخطوة 1: تنفيذ SQL الأساسي
```bash
# افتح Supabase Dashboard → SQL Editor
# نفذ الملف: supabase-setup.sql
```

هذا سينشئ:
- ✅ 8 جداول (users, content, discussions, messages, events, notifications)
- ✅ Foreign Keys و Constraints

### الخطوة 2: تطبيق RLS Policies
```bash
# افتح Supabase Dashboard → SQL Editor
# نفذ الملف: setup-all-rls-policies.sql
```

هذا سيضبط الصلاحيات:
- ✅ Users: يشوفون المحتوى المنشور فقط
- ✅ Experts: يضيفون محتوى ونقاشات
- ✅ Admins: صلاحيات كاملة

### الخطوة 3: إيقاف تأكيد البريد (للتطوير)
```
1. Supabase Dashboard → Authentication → Settings
2. Email Auth → أطفئ "Enable email confirmations"
3. Save
```

---

## 💻 2. تشغيل المشروع محلياً {#local-development}

### تثبيت Dependencies
```bash
cd c:\Faten.v5\Faten
npm install
```

### إعداد Environment Variables
الملف `.env` موجود بالفعل مع:
```env
VITE_SUPABASE_URL=https://zwqpabxpeagerfanpmpm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### تشغيل السيرفر
```bash
npm run dev
```

الموقع سيعمل على: **http://localhost:5176**

---

## 👥 3. إنشاء الحسابات {#create-accounts}

### طريقة 1: عبر الواجهة (الأسهل)

**للمستخدمين العاديين:**
```
http://localhost:5176/register
```

**للخبراء:**
```
http://localhost:5176/expert-register
```

**للمديرين:**
```
http://localhost:5176/admin-register
```

### طريقة 2: بالكود (متعدد)
```bash
# عدّل الملف: create-accounts.js
# ثم شغّل:
node create-accounts.js
```

---

## ✅ 4. اختبار الميزات {#testing}

### اختبار المحتوى

**كخبير:**
1. سجل دخول: `/expert-login`
2. اذهب لـ "إدارة المحتوى"
3. اضغط "إضافة محتوى جديد"
4. املأ:
   - العنوان: "اختبار محتوى"
   - النوع: مقال
   - الوصف: "هذا محتوى تجريبي"
5. اضغط "إضافة المحتوى"

**كمستخدم:**
1. سجل دخول: `/login`
2. اذهب للمكتبة
3. ✅ تأكد ظهور المحتوى الجديد!

### اختبار النقاشات
```
# تأكد من تنفيذ:
- الخبير ينشئ نقاش جديد
- المستخدم يشاهد النقاشات
- يمكن إضافة رسائل
```

### اختبار الفعاليات
```
# تأكد من:
- إنشاء فعالية جديدة
- ظهورها في لوحة اليوزر
- وجود رابط التسجيل الخارجي
```

---

## 🌐 5. النشر للإنتاج {#production-deployment}

### Vercel (موصى به)

```bash
# 1. ثبت Vercel CLI
npm i -g vercel

# 2. سجل دخول
vercel login

# 3. انشر
vercel --prod
```

### Environment Variables في Vercel
```
VITE_SUPABASE_URL=https://zwqpabxpeagerfanpmpm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### Netlify

```bash
# 1. Build الموقع
npm run build

# 2. ارفع مجلد dist
```

---

## 📊 هيكل المشروع

```
Faten/
├── src/
│   ├── lib/
│   │   ├── supabase.ts        # إعداد Supabase
│   │   ├── auth.ts            # نظام المصادقة
│   │   ├── content.ts         # إدارة المحتوى
│   │   ├── discussions.ts     # النقاشات
│   │   ├── events.ts          # الفعاليات
│   │   └── notifications.ts   # الإشعارات
│   ├── pages/
│   │   ├── RoleSelection.tsx  # الصفحة الرئيسية
│   │   ├── Register.tsx       # تسجيل المستخدمين
│   │   ├── ExpertRegister.tsx # تسجيل الخبراء
│   │   ├── AdminRegister.tsx  # تسجيل المديرين
│   │   ├── Dashboard.tsx      # لوحة المستخدم
│   │   ├── ExpertDashboard.tsx# لوحة الخبير
│   │   └── AdminDashboard.tsx # لوحة المدير
│   └── components/            # مكونات مشتركة
├── supabase-setup.sql         # إنشاء الجداول
├── setup-all-rls-policies.sql # صلاحيات الوصول
├── create-accounts.js         # سكريبت إنشاء الحسابات
└── .env                       # متغيرات البيئة
```

---

## 🎯 الميزات المكتملة

### ✅ نظام المصادقة
- [x] تسجيل دخول بثلاثة أدوار (User/Expert/Admin)
- [x] OTP للمستخدمين الجدد
- [x] حماية بـ RLS

### ✅ إدارة المحتوى
- [x] إضافة محتوى (كتب، فيديوهات، مقالات، دورات)
- [x] عرض المحتوى حسب النوع
- [x] حذف وتعديل المحتوى

### ✅ النقاشات
- [x] إنشاء نقاشات
- [x] إضافة رسائل
- [x] حذف الرسائل (للمرسل والأدمن)

### ✅ الفعاليات
- [x] إضافة فعاليات (ورش، دورات، محاضرات)
- [x] روابط تسجيل خارجية
- [x] عرض الفعاليات القادمة

### ✅ الإشعارات
- [x] إشعارات لكل مستخدم
- [x] تحديد كمقروء
- [x] حذف الإشعارات

---

## 🔧 استكشاف الأخطاء

### خطأ: "Email not confirmed"
**الحل:**
```
Supabase Dashboard → Authentication → Settings
→ أطفئ "Enable email confirmations"
```

### خطأ: "RLS policy violation"
**الحل:**
```bash
# شغّل:
setup-all-rls-policies.sql
```

### المحتوى لا يظهر
**الحل:**
```
1. تأكد من تسجيل دخول الخبير
2. تأكد من status = 'published'
3. افتح Console وشيك الأخطاء
```

---

## 📞 الدعم

في حال واجهت أي مشكلة:
1. افتح Console في المتصفح (F12)
2. شيك الأخطاء
3. تأكد من RLS policies
4. تأكد من Environment Variables

---

## 🎉 جاهز للنشر!

المشروع الآن **كامل ومتكامل** جاهز للنشر:
- ✅ قاعدة بيانات متصلة
- ✅ جميع الميزات فعّالة
- ✅ نظام صلاحيات محكم
- ✅ واجهات متجاوبة
- ✅ جاهز للإنتاج

**الخطوة التالية:** انشر على Vercel أو Netlify! 🚀
