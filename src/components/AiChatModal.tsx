import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Brain, Sparkles, Minimize2, Loader2 } from 'lucide-react';
import { sendChatMessage, validateChatMessage } from '../lib/aiService';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AiChatModal: React.FC<AiChatModalProps> = ({ isOpen, onClose }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: 'مرحباً بك في فطن! كيف يمكنني مساعدتك اليوم؟',
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Ref for messages container to enable auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [isOpen, isMinimized]);

  // إغلاق الشات عند النقر خارج المساحة
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    // Validate message
    const validation = validateChatMessage(newMessage);
    if (!validation.valid) {
      const errorMessage: Message = {
        id: messages.length + 1,
        role: 'assistant',
        content: validation.error || 'خطأ في الرسالة',
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage: Message = {
      id: messages.length + 1,
      role: 'user',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    const currentMessage = newMessage;
    setNewMessage('');
    setIsLoading(true);

    try {
      // Get current user from Supabase
      const { supabase } = await import('../lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('يجب تسجيل الدخول لاستخدام المساعد الذكي');
      }

      // Get user details
      const { data: userData } = await supabase
        .from('users')
        .select('id, email, full_name')
        .eq('id', user.id)
        .single();

      // Prepare conversation history (last 10 messages for context)
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Send message to AI service
      const result = await sendChatMessage({
        message: currentMessage,
        userContext: {
          userId: user.id,
          userEmail: userData?.email || user.email || '',
          userName: userData?.full_name || 'مستخدم'
        },
        conversationHistory
      });

      if (!result.success) {
        throw new Error(result.error || 'فشل في الحصول على الرد');
      }

      // Add assistant response to chat
      const assistantMessage: Message = {
        id: messages.length + 2,
        role: 'assistant',
        content: result.response || 'عذراً، لم أتمكن من معالجة الرد.',
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);

      // Add error message
      const errorMessage: Message = {
        id: messages.length + 2,
        role: 'assistant',
        content: error.message || 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.',
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Re-focus input after sending message
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop للإغلاق عند النقر خارج المساحة */}
      <div
        className="fixed inset-0 z-40"
        onClick={handleBackdropClick}
      />

      <div className={`fixed bottom-3 sm:bottom-6 left-3 right-3 sm:left-6 sm:right-auto w-auto sm:w-[420px] lg:w-[460px] z-50 transition-all duration-300 ${
        isMinimized ? 'h-14 sm:h-16' : 'h-auto'
      }`}>
        <div className="glass-effect rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden border border-[#8B7355]/20 backdrop-blur-xl">
          {/* Header */}
          <div className="p-3 sm:p-4 bg-gradient-to-r from-[#8B7355]/10 to-[#D4AF37]/10 flex justify-between items-center border-b border-[#8B7355]/20">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#8B7355] to-[#654321] flex items-center justify-center relative shadow-lg flex-shrink-0">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 text-[#D4AF37] absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 animate-pulse" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm sm:text-base text-[#2D2D2D] truncate">المساعد الذكي</h3>
                <p className="text-[10px] sm:text-xs text-[#6B7280] truncate">متاح الآن للمساعدة</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 sm:p-2 hover:bg-[#8B7355]/10 rounded-xl transition-colors"
                title={isMinimized ? "توسيع" : "تصغير"}
              >
                <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4 text-[#8B7355]" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-red-100 hover:text-red-600 rounded-xl transition-colors"
                title="إغلاق"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4 text-[#8B7355]" />
              </button>
            </div>
          </div>

          {/* Messages Area - يظهر فقط عندما لا يكون مصغراً */}
          {!isMinimized && (
            <>
              <div ref={messagesContainerRef} className="h-64 sm:h-80 lg:h-96 overflow-y-scroll p-3 sm:p-4 bg-gradient-to-b from-white/50 to-white/30" style={{ scrollbarWidth: 'thin', scrollbarColor: '#8B7355 transparent' }}>
                <div className="space-y-3 sm:space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'} animate-fade-in`}>
                      <div className={`max-w-[90%] sm:max-w-[85%] rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm ${
                        message.role === 'assistant'
                          ? 'bg-gradient-to-br from-[#8B7355]/10 to-[#D4AF37]/10 border border-[#8B7355]/20'
                          : 'bg-gradient-to-br from-[#8B7355] to-[#654321] text-white shadow-lg'
                      }`}>
                        <p className="text-xs sm:text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                        <span className={`text-[10px] sm:text-xs mt-2 block ${message.role === 'assistant' ? 'text-[#8B7355]' : 'text-white/70'}`}>
                          {message.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                  {/* Auto-scroll marker */}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-[#8B7355]/10 bg-white/80">
                <div className="flex gap-2 sm:gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="اكتب سؤالك هنا..."
                    className="input-modern flex-1 text-xs sm:text-sm min-w-0"
                    style={{ paddingTop: '0.625rem', paddingBottom: '0.625rem', paddingRight: '0.75rem', paddingLeft: '0.75rem', lineHeight: '1.5' }}
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isLoading}
                    className="btn-primary px-3 sm:px-4 py-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    {isLoading ? (
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                    ) : (
                      <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AiChatModal;