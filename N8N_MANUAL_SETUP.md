# 🔧 n8n Manual Workflow Setup - إعداد يدوي

إذا لم ينجح استيراد الـ JSON، اتبع هذه الخطوات لإنشاء الـ workflow يدوياً.

---

## 📝 الخطوات التفصيلية

### 1️⃣ إنشاء Workflow جديد

1. في n8n Dashboard، اضغط **"New Workflow"**
2. سمّه: `Faten Chatbot`

---

### 2️⃣ إضافة Webhook Node

1. **اضغط "+" لإضافة node**
2. ابحث عن **"Webhook"**
3. اسحبه للوحة

**الإعدادات:**
```
HTTP Method: POST
Path: faten-chat
Response Mode: When Last Node Finishes
```

4. اضغط **"Listen for Test Event"**
5. **انسخ الـ Webhook URL** (ستحتاجه لاحقاً)

---

### 3️⃣ إضافة Code Node (Extract Message)

1. اضغط **"+"** بعد الـ Webhook
2. ابحث عن **"Code"**
3. صل الـ Webhook به

**الكود:**
```javascript
// استخراج الرسالة من الطلب
const message = $input.first().json.message || '';
const userId = $input.first().json.userId || 'anonymous';

return {
  json: {
    userMessage: message,
    userId: userId,
    timestamp: new Date().toISOString()
  }
};
```

---

### 4️⃣ إضافة HTTP Request Node (OpenAI)

#### الطريقة A: استخدام OpenAI (موصى به)

1. اضغط **"+"** بعد الـ Code node
2. ابحث عن **"HTTP Request"**
3. صله بـ Code node

**الإعدادات:**

**Authentication:**
- اختر: **"Header Auth"**
- اضغط **"Create New Credential"**
- Name: `Authorization`
- Value: `Bearer YOUR_OPENAI_API_KEY` (ضع مفتاحك هنا)

**Request Settings:**
```
Method: POST
URL: https://api.openai.com/v1/chat/completions

Headers:
- Name: Content-Type
- Value: application/json
```

**Body:**
- اختر: **"JSON"**
- ضع هذا الكود:

```json
{
  "model": "gpt-3.5-turbo",
  "messages": [
    {
      "role": "system",
      "content": "أنت مساعد ذكي لمنصة فطن التعليمية المتخصصة في الأمن الفكري. مهمتك مساعدة المستخدمين بالإجابة على أسئلتهم حول: الأمن الفكري، المحتوى التعليمي المتاح، كيفية حجز النقاشات مع الخبراء، التنقل في المنصة. استخدم لغة عربية فصحى واضحة ومهذبة."
    },
    {
      "role": "user",
      "content": "={{ $json.userMessage }}"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 800
}
```

---

#### الطريقة B: استخدام Google Gemini (مجاني)

**الإعدادات:**
```
Method: POST
URL: https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_GEMINI_API_KEY

Headers:
- Name: Content-Type
- Value: application/json
```

**Body (JSON):**
```json
{
  "contents": [{
    "parts": [{
      "text": "{{ $json.userMessage }}"
    }]
  }],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 800
  }
}
```

---

### 5️⃣ إضافة Code Node (Format Response)

1. اضغط **"+"** بعد HTTP Request
2. اختر **"Code"**
3. صله بـ HTTP Request node

**الكود لـ OpenAI:**
```javascript
// استخراج الرد من OpenAI
const response = $input.first().json;

let aiResponse = '';

if (response.choices && response.choices[0] && response.choices[0].message) {
  aiResponse = response.choices[0].message.content;
} else {
  aiResponse = 'عذراً، حدث خطأ في معالجة الرد.';
}

return {
  json: {
    response: aiResponse,
    timestamp: new Date().toISOString(),
    success: true
  }
};
```

**الكود لـ Gemini:**
```javascript
// استخراج الرد من Gemini
const response = $input.first().json;

let aiResponse = '';

if (response.candidates && response.candidates[0]) {
  aiResponse = response.candidates[0].content.parts[0].text;
} else {
  aiResponse = 'عذراً، حدث خطأ في معالجة الرد.';
}

return {
  json: {
    response: aiResponse,
    timestamp: new Date().toISOString(),
    success: true
  }
};
```

---

### 6️⃣ إضافة Respond to Webhook Node

1. اضغط **"+"** بعد Code node الثاني
2. ابحث عن **"Respond to Webhook"**
3. صله بـ Code node

**الإعدادات:**
```
Respond With: JSON
Response Body: {{ $json }}
```

**إضافة CORS Headers (مهم!):**

في **Options** → **Response Headers**:

```
Header 1:
- Name: Access-Control-Allow-Origin
- Value: *

Header 2:
- Name: Access-Control-Allow-Methods
- Value: POST, OPTIONS, GET

Header 3:
- Name: Access-Control-Allow-Headers
- Value: Content-Type, Authorization
```

---

## 🧪 اختبار الـ Workflow

### 1. اختبار من n8n

1. اضغط **"Execute Workflow"**
2. في node الـ Webhook، اضغط **"Listen for Test Event"**
3. استخدم **Postman** أو **cURL**:

```bash
curl -X POST YOUR_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "message": "مرحبا",
    "userId": "test_user"
  }'
```

4. يجب أن ترى رد مثل:
```json
{
  "response": "مرحباً! كيف يمكنني مساعدتك اليوم؟",
  "timestamp": "2025-10-23T...",
  "success": true
}
```

---

### 2. تفعيل الـ Workflow

1. اضغط **"Active"** في الأعلى (يتحول للون الأخضر)
2. الآن الـ webhook يعمل 24/7

---

### 3. ربط بالتطبيق

1. افتح ملف `.env` في مشروع Faten
2. أضف:
```env
VITE_N8N_WEBHOOK_URL=YOUR_WEBHOOK_URL_HERE
```
3. أعد تشغيل التطبيق:
```bash
npm run dev
```

---

## 🔑 الحصول على API Keys

### OpenAI (مدفوع - جودة عالية)

1. اذهب إلى: https://platform.openai.com
2. سجل دخول أو أنشئ حساب
3. اذهب إلى: **API Keys**
4. اضغط **"Create new secret key"**
5. انسخ المفتاح (يظهر مرة واحدة فقط!)

**التكلفة:**
- GPT-3.5-turbo: ~$0.002 لكل رسالة
- يحتاج إضافة رصيد ($5 على الأقل)

---

### Google Gemini (مجاني!)

1. اذهب إلى: https://makersuite.google.com/app/apikey
2. سجل دخول بحساب Google
3. اضغط **"Create API Key"**
4. انسخ المفتاح

**التكلفة:**
- مجاناً! ✅
- الحد: 60 طلب/دقيقة

---

## ✅ هيكل الـ Workflow النهائي

```
Webhook
   ↓
Extract Message (Code)
   ↓
OpenAI/Gemini (HTTP Request)
   ↓
Format Response (Code)
   ↓
Respond to Webhook
```

---

## 🐛 حل المشاكل

### ❌ Error: "Invalid API key"
- تأكد من نسخ API key بالكامل
- تأكد من عدم وجود مسافات
- للـ OpenAI: تأكد من صيغة `Bearer YOUR_KEY`

### ❌ Error: "CORS policy"
- أضف Response Headers كما في الخطوة 6
- أعد تفعيل الـ workflow

### ❌ Webhook returns 404
- تأكد من أن الـ workflow **Active**
- تأكد من نسخ URL بالكامل
- جرب إعادة إنشاء الـ Webhook node

### ❌ البطء في الرد
- قلل `max_tokens` إلى 500
- استخدم GPT-3.5 بدلاً من GPT-4
- تحقق من اتصال الإنترنت

---

## 🎯 التأكد من النجاح

✅ الـ workflow يعمل إذا:
1. Status = **Active** (أخضر)
2. Webhook يرجع status code **200**
3. الرد يحتوي على `response` و `success: true`
4. التطبيق يعرض رد الـ AI في الـ Chat

---

## 📞 المساعدة

إذا واجهت مشاكل:
- راجع `CHATBOT_TROUBLESHOOTING.md`
- تحقق من **Executions** في n8n
- افحص **Browser Console** (F12)

---

🎉 **الآن الـ Chatbot جاهز للعمل!**
