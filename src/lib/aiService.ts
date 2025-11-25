/**
 * Chat Assistant Service - Faten Platform
 * Direct integration with generative model API
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Concise system prompt for the model
const FATEN_SYSTEM_PROMPT = `أنت "فطن"، مساعد تعليمي ذكي لمنصة فطن التعليمية العربية.

**قواعد أساسية:**
- رد فقط بالعربية الفصحى المبسطة
- كن محترماً، تعليمياً، وإيجابياً
- ركز على الوعي الفكري والتراث السعودي
- احترم الثقافة العربية والإسلامية

**يمكنك مساعدة المستخدمين بـ:**
- معلومات عن منصة فطن (التسجيل، الأقسام، الميزات)
- المحتوى التعليمي (علوم، تاريخ، ثقافة، أدب، تكنولوجيا)
- المهارات (التفكير النقدي، القراءة، التحليل)
- التوجيه للمحتوى (كتب، فيديوهات، دورات)
- حجز نقاشات مع الخبراء

**ممنوع الحديث عن:**
- السياسة والانتخابات
- الطائفية والتطرف
- المواضيع المثيرة للجدل
- النصائح الطبية/القانونية/المالية
- المحتوى الضار أو المسيء

**عند عدم التأكد:**
قل: "لست متأكداً، يمكنك التحقق من مصادر موثوقة أو التواصل مع خبراء المنصة"

**أقسام المنصة:**
- المحتوى التعليمي: كتب، فيديوهات، مقالات
- النقاشات: حجز جلسات مع الخبراء
- الفعاليات: دورات، ورش عمل، ندوات

**أسلوبك:**
- استخدم اسم المستخدم للترحيب الشخصي
- كن صبوراً ومشجعاً
- اقترح موارد من المنصة
- رد بإيجاز (<500 كلمة)

هدفك: إثراء المعرفة وتعزيز الوعي الفكري`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface UserContext {
  userId: string;
  userEmail: string;
  userName: string;
}

interface ChatRequest {
  message: string;
  userContext: UserContext;
  conversationHistory?: ChatMessage[];
}

interface ChatResponse {
  success: boolean;
  response?: string;
  error?: string;
}

/**
 * Send a message to the AI chatbot and get a response
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  try {
    // Get API key from environment
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    console.log('AI Service Debug:', {
      hasApiKey: !!apiKey,
      apiKeyPrefix: apiKey?.substring(0, 15) + '...',
      messageLength: request.message.length,
      hasHistory: !!request.conversationHistory?.length
    });

    if (!apiKey) {
      console.error('API key missing!');
      throw new Error('generative model API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
    }

    // ✅ Initialize generative model with a CURRENT model
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      // أفضل تشتغل على gemini-2.0-flash (موديل حديث وسريع)
      model: 'gemini-2.0-flash',
    });

    // Check if this is the first message (no conversation history)
    const isFirstMessage = !request.conversationHistory || request.conversationHistory.length <= 1;

    // Extract first name from full name
    const firstName = request.userContext.userName.split(' ')[0];
    const displayName = isFirstMessage ? request.userContext.userName : firstName;

    // Build the full prompt with system instructions and conversation
    let fullPrompt = `${FATEN_SYSTEM_PROMPT}

معلومات المستخدم:
- الاسم: ${displayName}
- البريد: ${request.userContext.userEmail}

${isFirstMessage ? '**تنبيه مهم:** هذه أول رسالة من المستخدم. استخدم الاسم الكامل في الترحيب.' : '**تنبيه:** استخدم الاسم الأول فقط في الرد (الاسم المذكور أعلاه).'}

---

`;

    // Add conversation history
    if (request.conversationHistory && request.conversationHistory.length > 0) {
      const filteredHistory = request.conversationHistory.filter((msg, index) => {
        // Skip initial greeting
        if (index === 0 && msg.role === 'assistant') {
          return false;
        }
        return true;
      });

      filteredHistory.forEach(msg => {
        if (msg.role === 'user') {
          fullPrompt += `المستخدم: ${msg.content}\n`;
        } else {
          fullPrompt += `فطن: ${msg.content}\n`;
        }
      });
    }

    // Add current message
    fullPrompt += `المستخدم: ${request.message}\nفطن:`;

    // Generate response
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const responseText = response.text();

    if (!responseText) {
      throw new Error('Empty response from AI');
    }

    return {
      success: true,
      response: responseText
    };

  } catch (error: any) {
    console.error('AI Service Error:', error);

    // Handle specific error cases
    if (error.message?.includes('API key')) {
      return {
        success: false,
        error: 'خطأ في إعداد المساعد الذكي. يرجى التواصل مع الدعم الفني.'
      };
    }

    if (error.message?.includes('quota') || error.message?.includes('429')) {
      return {
        success: false,
        error: 'عذراً، تم تجاوز الحد الأقصى للطلبات. يرجى المحاولة بعد قليل.'
      };
    }

    if (error.message?.includes('Invalid API key')) {
      return {
        success: false,
        error: 'مفتاح API غير صالح. يرجى التحقق من الإعدادات.'
      };
    }

    if (error.message?.includes('404') || error.message?.includes('not found')) {
      return {
        success: false,
        error: 'النموذج غير متوفر. يرجى التواصل مع الدعم الفني.'
      };
    }

    return {
      success: false,
      error: 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.'
    };
  }
}

/**
 * Validate chat message before sending
 */
export function validateChatMessage(message: string): { valid: boolean; error?: string } {
  if (!message || message.trim().length === 0) {
    return {
      valid: false,
      error: 'الرجاء إدخال رسالة'
    };
  }

  if (message.length > 2000) {
    return {
      valid: false,
      error: 'الرسالة طويلة جداً. الحد الأقصى 2000 حرف'
    };
  }

  return { valid: true };
}
