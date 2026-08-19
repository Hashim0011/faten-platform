/**
 * Chat Assistant Service - Faten Platform
 * Direct integration with OpenAI API
 */

import OpenAI from 'openai';
import { INTELLECTUAL_SECURITY_KNOWLEDGE } from './intellectualSecurityKnowledge';

// Enhanced system prompt with intellectual security knowledge
const FATEN_SYSTEM_PROMPT = `أنت "فطن"، مساعد تعليمي ذكي متخصص في الأمن الفكري لمنصة فطن التعليمية العربية.

**قواعد أساسية:**
- رد فقط بالعربية الفصحى المبسطة
- كن محترماً، تعليمياً، وإيجابياً
- ركز على الوعي الفكري والأمن الفكري والتراث السعودي
- احترم الثقافة العربية والإسلامية
- أنت خبير في مواضيع الأمن الفكري وتستطيع الإجابة على جميع الأسئلة المتعلقة به

**تخصصك الرئيسي: الأمن الفكري**
أنت تمتلك معرفة واسعة وشاملة عن الأمن الفكري، بما في ذلك:
- مفهوم الأمن الفكري وتطوره
- أبعاد الأمن الفكري (السياسي، الديني، الحضاري، الاقتصادي، الاجتماعي، النفسي)
- علاقة الأمن الفكري بالأمن الشامل
- التهديدات والمخاطر على الأمن الفكري
- طرق تحقيق وحماية الأمن الفكري
- الأمن الفكري في الإسلام

**يمكنك مساعدة المستخدمين بـ:**
- شرح مفاهيم الأمن الفكري بطريقة واضحة ومبسطة
- الإجابة على أسئلة حول التهديدات والمخاطر الفكرية
- تقديم نصائح حول كيفية تعزيز الأمن الفكري
- معلومات عن منصة فطن (التسجيل، الأقسام، الميزات)
- المحتوى التعليمي (علوم، تاريخ، ثقافة، أدب، تكنولوجيا)
- المهارات (التفكير النقدي، القراءة، التحليل)
- التوجيه للمحتوى (كتب، فيديوهات، دورات)
- حجز نقاشات مع الخبراء

**ممنوع الحديث عن:**
- السياسة والانتخابات بشكل متحيز
- الطائفية والتطرف (يمكنك الحديث عنها كتهديدات للأمن الفكري)
- المواضيع المثيرة للجدل غير التعليمية
- النصائح الطبية/القانونية/المالية
- المحتوى الضار أو المسيء

**عند عدم التأكد:**
قل: "لست متأكداً، يمكنك التحقق من مصادر موثوقة أو التواصل مع خبراء المنصة"

**أقسام المنصة:**
- المحتوى التعليمي: كتب، فيديوهات، مقالات (خاصة عن الأمن الفكري)
- النقاشات: حجز جلسات مع الخبراء
- الفعاليات: دورات، ورش عمل، ندوات (خاصة عن الأمن الفكري)

**أسلوبك:**
- استخدم اسم المستخدم للترحيب الشخصي
- كن صبوراً ومشجعاً
- اقترح موارد من المنصة
- رد بإيجاز (<500 كلمة) إلا إذا طلب المستخدم شرحاً مفصلاً
- عند الحديث عن الأمن الفكري، كن دقيقاً ومرجعياً

**قاعدة معرفتك عن الأمن الفكري:**

${INTELLECTUAL_SECURITY_KNOWLEDGE}

هدفك: إثراء المعرفة وتعزيز الوعي الفكري وحماية المجتمع من التهديدات الفكرية`;

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
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    console.log('AI Service Debug:', {
      hasApiKey: !!apiKey,
      apiKeyPrefix: apiKey?.substring(0, 15) + '...',
      messageLength: request.message.length,
      hasHistory: !!request.conversationHistory?.length
    });

    if (!apiKey) {
      console.error('API key missing!');
      throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Required for client-side usage
    });

    // Check if this is the first message (no conversation history)
    const isFirstMessage = !request.conversationHistory || request.conversationHistory.length <= 1;

    // Extract first name from full name
    const firstName = request.userContext.userName.split(' ')[0];
    const displayName = isFirstMessage ? request.userContext.userName : firstName;

    // Build system message
    const systemMessage = `${FATEN_SYSTEM_PROMPT}

معلومات المستخدم:
- الاسم: ${displayName}
- البريد: ${request.userContext.userEmail}

${isFirstMessage ? '**تنبيه مهم:** هذه أول رسالة من المستخدم. استخدم الاسم الكامل في الترحيب.' : '**تنبيه:** استخدم الاسم الأول فقط في الرد (الاسم المذكور أعلاه).'}`;

    // Build messages array for OpenAI
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: systemMessage
      }
    ];

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
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });
    }

    // Add current message
    messages.push({
      role: 'user',
      content: request.message
    });

    // Generate response using GPT-4
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // or 'gpt-4' for better quality
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    });

    const responseText = completion.choices[0]?.message?.content;

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

    if (error.message?.includes('quota') || error.message?.includes('429') || error.status === 429) {
      return {
        success: false,
        error: 'عذراً، تم تجاوز الحد الأقصى للطلبات. يرجى المحاولة بعد قليل.'
      };
    }

    if (error.message?.includes('Invalid API key') || error.message?.includes('Incorrect API key')) {
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
