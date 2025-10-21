# 🚀 دليل نشر مشروع فطن

## 📋 الخطوات المطلوبة قبل النشر

### 1️⃣ **إصلاح مشكلة CORS في n8n (مهم جداً!)**

لكي يعمل الشات بوت بعد النشر، يجب عليك تعديل n8n workflow:

#### الخطوات:
1. افتح n8n workflow الخاص بك
2. اذهب إلى **Webhook node** أو أضف **Respond to Webhook node**
3. في إعدادات Node، أضف Response Headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

أو أضف **HTTP Response node** مع هذه الإعدادات:

```json
{
  "statusCode": 200,
  "headers": {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  },
  "body": {
    "response": "الرد هنا"
  }
}
```

---

## 🌐 خيارات النشر

### **الخيار 1: Vercel (موصى به - مجاني)**

#### الخطوات:
1. اذهب إلى: https://vercel.com
2. سجل دخول بحساب GitHub
3. اضغط **Import Project**
4. اختر مستودع GitHub الخاص بك
5. أضف Environment Variables:
   - `VITE_SUPABASE_URL` = رابط Supabase
   - `VITE_SUPABASE_ANON_KEY` = مفتاح Supabase
   - `VITE_N8N_WEBHOOK_URL` = رابط n8n webhook
6. اضغط **Deploy**

✅ **المميزات:**
- نشر تلقائي عند كل push لـ GitHub
- SSL مجاني
- CDN عالمي
- سريع جداً

---

### **الخيار 2: Netlify (مجاني)**

#### الخطوات:
1. اذهب إلى: https://netlify.com
2. سجل دخول بحساب GitHub
3. اضغط **Add new site** → **Import an existing project**
4. اختر مستودع GitHub
5. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. أضف Environment Variables في Settings
7. اضغط **Deploy**

---

### **الخيار 3: GitHub Pages (مجاني - للمواقع الثابتة)**

#### تحديث `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/اسم-المستودع/',
  plugins: [react()],
  // ... باقي الإعدادات
});
```

#### الخطوات:
1. أضف في `package.json`:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

2. نفذ الأوامر:
```bash
npm install --save-dev gh-pages
npm run deploy
```

3. في GitHub Repository → Settings → Pages
4. اختر Branch: `gh-pages`

---

### **الخيار 4: Supabase Hosting (متكامل)**

نظراً لأنك تستخدم Supabase، يمكنك نشر المشروع عليه مباشرة.

---

## 📦 بناء المشروع للنشر

### قبل البناء:
تأكد من ملف `.env` يحتوي على:
```env
VITE_SUPABASE_URL=https://zwqpabxpeagerfanpmpm.supabase.co
VITE_SUPABASE_ANON_KEY=مفتاحك_هنا
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.app.n8n.cloud/webhook/REDACTED
```

### بناء المشروع:
```bash
npm run build
```

سيتم إنشاء مجلد `dist` يحتوي على الملفات الجاهزة للنشر.

---

## ✅ اختبار المشروع قبل النشر

```bash
npm run preview
```

سيفتح السيرفر على: `http://localhost:4173`

---

## 🔧 إعدادات مهمة

### 1. تأكد من Supabase Settings:

في Supabase Dashboard → Authentication → URL Configuration:

أضف رابط موقعك المنشور في:
- **Site URL**
- **Redirect URLs**

### 2. تأكد من n8n Workflow:

- الـ workflow يجب أن يكون **Active**
- تأكد من CORS headers (الخطوة 1 أعلاه)

---

## 📝 ملاحظات مهمة

⚠️ **CORS Issue:**
- مشكلة CORS تظهر فقط محلياً (localhost)
- بعد النشر على دومين حقيقي، يجب أن تعمل بشكل طبيعي **إذا أضفت CORS headers في n8n**

⚠️ **Environment Variables:**
- لا تنسى إضافة المتغيرات في منصة النشر
- لا تضع مفاتيح سرية في الكود

⚠️ **Database Tables:**
- تأكد من إنشاء جداول Supabase (انظر `database/` folder)

---

## 🎯 توصيتي لك:

**استخدم Vercel** لأنه:
- ✅ سهل وسريع
- ✅ مجاني للمشاريع الشخصية
- ✅ نشر تلقائي
- ✅ يدعم Environment Variables
- ✅ SSL مجاني
- ✅ CDN عالمي

---

## 🆘 في حالة المشاكل:

### الشات بوت لا يعمل بعد النشر:
1. تحقق من n8n CORS headers
2. افتح Console في المتصفح (F12)
3. شوف الأخطاء

### الموقع لا يفتح:
1. تحقق من Build logs
2. تأكد من Environment Variables

### Database لا يتصل:
1. تحقق من Supabase URL و Keys
2. تأكد من إضافة الدومين في Supabase Settings
