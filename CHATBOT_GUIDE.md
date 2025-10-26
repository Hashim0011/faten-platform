# 🤖 دليل المساعد الذكي - منصة فطن

## نظرة عامة

مساعد ذكي بسيط يستخدم Google Gemini API للإجابة على الأسئلة المتعلقة بالأمن الفكري باللغة العربية.

---

## ✨ الميزات

1. ✅ **يجيب بالعربية فقط** على مواضيع الأمن الفكري
2. ✅ **متصل بقاعدة البيانات** - يجلب المحتوى المتاح
3. ✅ **يقترح محتوى ذي صلة** من الكتب والفيديوهات
4. ✅ **للمستخدمين المسجلين فقط** - التحقق من الهوية
5. ✅ **بدون حدود** - لا يوجد حد على عدد الرسائل
6. ✅ **مجاني بالكامل** - Gemini Free Tier

---

## 🏗️ البنية (7 عقد في n8n)

### 1. **Webhook - Receive Chat Message**
- يستقبل الرسائل من الموقع
- Path: `/webhook/faten-chat`

**البيانات المستقبلة:**
```json
{
  "message": "ما هو الأمن الفكري؟",
  "userId": "uuid",
  "userEmail": "user@example.com",
  "userName": "أحمد",
  "timestamp": "2025-10-23T10:30:00.000Z"
}
```

---

### 2. **Fetch Published Content**
- يجلب آخر 20 محتوى منشور من Supabase
- يستخدم Environment Variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`

**الاستعلام:**
```
GET /rest/v1/content?select=id,title,content_type,description&status=eq.منشور&limit=20
```

**الرد:**
```json
[
  {
    "id": "1",
    "title": "كتاب الأمن الفكري",
    "content_type": "book",
    "description": "مقدمة شاملة..."
  }
]
```

---

### 3. **Build AI Prompt with Context**
- يبني الـ Prompt للذكاء الاصطناعي
- يضيف قائمة المحتوى المتاح كسياق
- يضيف تعليمات النظام (System Prompt)

**System Prompt:**
```
أنت مساعد ذكي في منصة "فطن" - منصة تعليمية متخصصة في الأمن الفكري.

مهمتك:
1. الإجابة على الأسئلة المتعلقة بالأمن الفكري فقط
2. إذا سأل عن موضوع آخر، قل له بأدب أنك متخصص في الأمن الفكري
3. استخدم اللغة العربية الفصحى المبسطة
4. كن مهذباً ومحترماً
5. اقترح محتوى من قاعدة البيانات إذا كان ذي صلة

القواعد:
- لا تجيب على أسئلة غير متعلقة بالأمن الفكري
- لا تعطي معلومات طبية أو قانونية أو مالية
- ركز على: المفاهيم الفكرية، الحماية من التطرف، التفكير الناقد، الوعي الفكري
- أجب دائماً بالعربية

المحتوى المتاح في منصة فطن:
- كتاب: كتاب الأمن الفكري - مقدمة شاملة...
- فيديو: فيديو الوعي الفكري - شرح مبسط...
[...]

المستخدم (أحمد): ما هو الأمن الفكري؟

المساعد:
```

---

### 4. **Google Gemini API**
- يرسل الـ Prompt لـ Gemini
- Model: `gemini-1.5-flash` (مجاني)
- API Key: `REDACTED_GOOGLE_KEY`

**الطلب:**
```json
{
  "contents": [{
    "parts": [{ "text": "[الـ Prompt الكامل]" }]
  }],
  "generationConfig": {
    "temperature": 0.7,
    "topK": 40,
    "topP": 0.95,
    "maxOutputTokens": 1024
  },
  "safetySettings": [
    { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE" },
    { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE" },
    { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE" },
    { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE" }
  ]
}
```

**الرد:**
```json
{
  "candidates": [{
    "content": {
      "parts": [{ "text": "الأمن الفكري هو..." }]
    }
  }]
}
```

---

### 5. **Process AI Response**
- يستخرج النص من رد Gemini
- يبحث عن محتوى ذي صلة
- يضيف اقتراحات المحتوى للرد

**المعالجة:**
```javascript
// استخراج النص
if (geminiResponse.candidates[0].content.parts[0].text) {
  aiResponse = geminiResponse.candidates[0].content.parts[0].text;
}

// إضافة اقتراحات المحتوى
if (relevantContent.length > 0) {
  aiResponse += '\n\n📚 محتوى مقترح قد يفيدك:\n';
  aiResponse += '1. 📖 كتاب الأمن الفكري\n';
  aiResponse += '2. 🎥 فيديو الوعي الفكري\n';
}
```

---

### 6. **Return Success Response**
- يرجع الرد للموقع بصيغة JSON

**الرد:**
```json
{
  "response": "الأمن الفكري هو...\n\n📚 محتوى مقترح:\n1. 📖 كتاب...",
  "timestamp": "2025-10-23T10:30:05.000Z",
  "success": true
}
```

---

### 7. **Return Error Response**
- يرجع رسالة خطأ عند حدوث مشكلة

**رد الخطأ:**
```json
{
  "response": "عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.",
  "timestamp": "2025-10-23T10:30:05.000Z",
  "success": false,
  "error": "unknown_error"
}
```

---

## 🔧 التخصيص

### تغيير System Prompt

افتح n8n → Workflow → node "Build AI Prompt with Context"

**مثال: إضافة شخصية:**
```javascript
const systemPrompt = `أنا فطون، المساعد الذكي في منصة فطن! 🤓

أسعد دائماً بمساعدتك في فهم الأمن الفكري...
`;
```

**مثال: تغيير مستوى اللغة:**
```javascript
// من فصحى إلى عامية
3. استخدم اللغة العربية العامية المبسطة
```

**مثال: إضافة قواعد جديدة:**
```javascript
- لا تجيب على أسئلة سياسية
- لا تناقش موضوعات جدلية
```

---

### تغيير عدد المحتوى المقترح

في node "Process AI Response":

```javascript
// الافتراضي: 3 اقتراحات
relevantContent.slice(0, 3)

// لعرض 5 اقتراحات
relevantContent.slice(0, 5)
```

---

### تغيير معايير اقتراح المحتوى

في node "Process AI Response":

```javascript
// الافتراضي: يبحث عن "أمن" أو "فكر"
const relevantContent = contentList.filter(item => {
  const title = item.title?.toLowerCase() || '';
  return title.includes('أمن') || title.includes('فكر');
});

// إضافة كلمات مفتاحية جديدة
const relevantContent = contentList.filter(item => {
  const title = item.title?.toLowerCase() || '';
  return title.includes('أمن') ||
         title.includes('فكر') ||
         title.includes('وعي') ||  // جديد
         title.includes('تطرف');   // جديد
});
```

---

## 🎨 تحسين الردود

### تغيير حرارة (Temperature) الـ AI

في node "Google Gemini API":

```json
"generationConfig": {
  "temperature": 0.7,  // القيمة الحالية
  // 0.0 = ردود متوقعة ومتسقة
  // 1.0 = ردود إبداعية ومتنوعة
}
```

**أمثلة:**
- `0.3` → ردود دقيقة ورسمية
- `0.7` → ردود متوازنة (الافتراضي)
- `0.9` → ردود إبداعية ومتنوعة

---

### تغيير طول الرد

في node "Google Gemini API":

```json
"generationConfig": {
  "maxOutputTokens": 1024,  // الافتراضي
  // 512 = ردود قصيرة
  // 1024 = ردود متوسطة
  // 2048 = ردود طويلة
}
```

---

## 💡 أمثلة على الاستخدام

### مثال 1: سؤال عن الأمن الفكري
**المستخدم:** "ما هو الأمن الفكري؟"

**الرد:**
```
الأمن الفكري هو حماية العقل من الأفكار المتطرفة والمنحرفة،
وتعزيز القيم الإيجابية والتفكير الناقد...

📚 محتوى مقترح قد يفيدك:
1. 📖 كتاب الأمن الفكري الشامل
2. 🎥 فيديو مقدمة في الأمن الفكري
3. 📄 مقال أهمية الأمن الفكري
```

---

### مثال 2: سؤال غير متعلق
**المستخدم:** "كيف أطبخ الكبسة؟"

**الرد:**
```
عذراً، أنا متخصص في المساعدة بمواضيع الأمن الفكري فقط.
لا أستطيع المساعدة في مواضيع الطبخ.

هل لديك أي أسئلة حول الأمن الفكري، الوعي الفكري،
أو التفكير الناقد؟ سأكون سعيداً بمساعدتك! 😊
```

---

## 📊 مراقبة الأداء

### في n8n Dashboard

1. اذهب إلى: `Executions`
2. شاهد جميع التنفيذات السابقة
3. افتح أي execution لرؤية:
   - البيانات المستقبلة
   - تدفق البيانات بين العقد
   - الأخطاء (إن وجدت)
   - الوقت المستغرق

---

## 🐛 الأخطاء الشائعة

### خطأ: "لا يوجد رد"
**السبب:** Workflow غير مفعل أو Webhook URL خاطئ
**الحل:** تحقق من Active ✅ في n8n

### خطأ: "رد بالإنجليزية"
**السبب:** System Prompt لا يؤكد على العربية
**الحل:** أضف "أجب دائماً بالعربية" في System Prompt

### خطأ: "لا يقترح محتوى"
**السبب:** لا يوجد محتوى منشور في Supabase
**الحل:** أضف محتوى في جدول content بـ status='منشور'

---

## 💰 التكاليف

### مجاني 100%:
- ✅ **n8n Free**: 5,000 executions/month
- ✅ **Gemini Free**: 60 requests/minute
- ✅ **Supabase Free**: 500MB database

### متى تحتاج للترقية؟
- إذا تجاوزت 5,000 رسالة شهرياً
- أو تجاوزت 500MB في Supabase

---

## 🚀 الخطوات التالية

1. ✅ اقرأ `START_HERE.md` للإعداد
2. ✅ استورد الـ Workflow في n8n
3. ✅ جرب المساعد
4. ✅ خصّص System Prompt حسب حاجتك
5. ✅ استمتع! 🎉

---

**آخر تحديث**: 23 أكتوبر 2025
**الإصدار**: 2.0 (Simple Version)
