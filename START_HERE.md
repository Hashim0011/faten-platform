# 🚀 ابدأ من هنا - تشغيل المساعد الذكي

## مرحباً! 👋

هذا دليل سريع لتشغيل المساعد الذكي في منصة فطن.

**الوقت المتوقع: 5 دقائق** ⏱️

---

## ✅ قائمة التحقق السريعة (خطوتين فقط!)

### ☐ الخطوة 1: n8n (3 دقائق)

1. افتح: https://ommdh.app.n8n.cloud
2. سجل دخول
3. اضغط: `Import from File` أو `+` → `Import workflow`
4. اختر ملف: `faten-chatbot-workflow.json`
5. اضغط: `Import`

**تفعيل الـ Workflow:**

6. افتح الـ Workflow المستورد
7. اضغط: `Active` في أعلى اليمين (يجب أن يتحول للأخضر ✅)
8. اضغط على أول عقدة: `Webhook - Receive Chat Message`
9. انسخ: `Production URL`
    - يجب أن يكون مثل:
    ```
    https://your-n8n-instance.app.n8n.cloud/webhook/REDACTED
    ```

**✅ اكتمل! انتقل للخطوة 2**

---

### ☐ الخطوة 2: ملف .env واختبار (2 دقيقة)

1. افتح مجلد المشروع
2. تأكد من وجود ملف `.env` (أو أنشئه)
3. افتح `.env` في محرر نصوص
4. أضف السطر التالي:
   ```env
   VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.app.n8n.cloud/webhook/REDACTED
   ```
   (استخدم الرابط الذي نسخته من الخطوة 1)

5. احفظ الملف
6. شغل المشروع:
   ```bash
   npm run dev
   ```
7. سجل دخول بحساب مستخدم
8. افتح المساعد الذكي 🧠
9. اكتب سؤال: **"ما هو الأمن الفكري؟"**

**✅ نجح! إذا حصلت على رد بالعربية، كل شيء يعمل!** 🎉

---

## 🎯 ما تم تبسيطه

### ✅ لا حاجة لـ:
- ❌ Environment Variables في n8n (كل شيء موجود في الـ Workflow)
- ❌ SUPABASE_URL (موجود في الـ Workflow)
- ❌ SUPABASE_ANON_KEY (موجود في الـ Workflow)

### ✅ فقط تحتاج:
- ✅ استيراد الـ Workflow في n8n
- ✅ تفعيله (Active)
- ✅ نسخ Webhook URL
- ✅ إضافته في `.env` للمشروع

---

## 🔑 معلومات مهمة

### ما تم دمجه في الـ Workflow:

**Gemini API Key:**
```
REDACTED_GOOGLE_KEY
```

**Supabase URL:**
```
https://zwqpabxpeagerfanpmpm.supabase.co
```

**Supabase Key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**كل شيء جاهز في الـ Workflow! لا حاجة لإعداد أي شيء في n8n!**

---

## 💰 التكلفة

### حالياً: **مجاني 100%** 🎉

- ✅ n8n Free: 5,000 messages/month
- ✅ Gemini Free: Unlimited (with rate limits)
- ✅ Supabase Free: 500MB

---

## 🎨 الميزات

### ما يفعله المساعد:
- ✅ يجيب بالعربية فقط
- ✅ متخصص في الأمن الفكري
- ✅ يرفض الأسئلة غير المتعلقة بأدب
- ✅ يقترح محتوى من قاعدة البيانات
- ✅ للمستخدمين المسجلين فقط
- ✅ بدون حدود على عدد الرسائل

---

## 🆘 استكشاف الأخطاء

### 1. **المساعد لا يرد؟**
**الحل:**
- ✅ تحقق: n8n Workflow Active (أخضر)
- ✅ تحقق: VITE_N8N_WEBHOOK_URL صحيح في .env
- ✅ افتح: n8n → Executions → شاهد آخر تنفيذ
- ✅ تحقق من رسالة الخطأ في n8n

### 2. **خطأ 500؟**
**الحل:**
- ✅ راجع: n8n Executions log
- ✅ افتح node "Fetch Published Content"
- ✅ تحقق من URL: `https://zwqpabxpeagerfanpmpm.supabase.co/rest/v1/content...`
- ✅ جرب الـ URL في المتصفح (يجب أن يرجع JSON)

### 3. **رد بالإنجليزية؟**
**الحل:**
- ✅ افتح: n8n Workflow
- ✅ اضغط: node "Build AI Prompt with Context"
- ✅ تحقق من System Prompt:
  ```
  "استخدم اللغة العربية الفصحى المبسطة"
  "أجب دائماً بالعربية"
  ```

### 4. **لا يقترح محتوى؟**
**الحل:**
- ✅ تحقق من Supabase:
  ```sql
  SELECT COUNT(*) FROM content WHERE status = 'منشور';
  ```
- ✅ يجب أن يكون هناك محتوى منشور في الجدول

### 5. **خطأ في الاتصال بـ Supabase؟**
**الحل:**
- ✅ في n8n، افتح node "Fetch Published Content"
- ✅ تحقق من Headers:
  - `apikey`: يجب أن تكون موجودة
  - `Authorization`: يجب أن تبدأ بـ `Bearer`
- ✅ جرب URL كامل في المتصفح مع إضافة `?apikey=...` في النهاية

---

## 🎨 تدفق البيانات

```
مستخدم → يكتب سؤال
    ↓
AiChatModal.tsx → يرسل لـ n8n
    ↓
n8n Webhook → يستقبل
    ↓
Fetch Content → يجلب من Supabase
    ↓ (Supabase URL & Key موجودة في الـ Workflow)
Build Prompt → يجمع السياق
    ↓
Gemini API → يولد الرد
    ↓ (Gemini Key موجود في الـ Workflow)
Process Response → يضيف اقتراحات
    ↓
Return JSON → يرجع للموقع
    ↓
واجهة الشات → تعرض الرد ✅
```

---

## 📞 روابط مفيدة

- **n8n Dashboard**: https://ommdh.app.n8n.cloud
- **Gemini API Keys**: https://aistudio.google.com/app/apikey
- **Supabase Dashboard**: https://zwqpabxpeagerfanpmpm.supabase.co
- **الدليل الكامل**: `CHATBOT_GUIDE.md`

---

## 🎉 تهانينا مقدماً!

بمجرد إكمال الخطوتين، ستحصل على:

✅ مساعد ذكي يعمل بالكامل
✅ متصل بقاعدة البيانات
✅ يجيب بالعربية
✅ مجاني 100%
✅ جاهز للإنتاج
✅ بدون حدود على الرسائل
✅ **بدون إعداد Environment Variables معقدة!**

**وقت سعيد! 🚀**

---

**آخر تحديث**: 23 أكتوبر 2025
**الإصدار**: 3.0 (Super Simple - No Env Vars in n8n!)
