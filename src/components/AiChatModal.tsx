import React, { useState } from 'react';
import { X, Send, Brain, Sparkles, Minimize2, Loader2 } from 'lucide-react';

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
      timestamp: new Date().toLocaleTimeString('ar-SA')
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // إغلاق الشات عند النقر خارج المساحة
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: messages.length + 1,
      role: 'user',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('ar-SA')
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    try {
      // Get webhook URL from environment variable
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://your-n8n-instance.app.n8n.cloud/webhook/REDACTED';

      // Send message to n8n webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          timestamp: userMessage.timestamp,
          userId: 'user_' + Date.now()
        })
      });

      if (!response.ok) {
        throw new Error('فشل في الحصول على الرد');
      }

      const data = await response.json();

      // Add assistant response to chat
      const assistantMessage: Message = {
        id: messages.length + 2,
        role: 'assistant',
        content: data.response || data.message || 'عذراً، حدث خطأ في معالجة طلبك.',
        timestamp: new Date().toLocaleTimeString('ar-SA')
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);

      // Add error message
      const errorMessage: Message = {
        id: messages.length + 2,
        role: 'assistant',
        content: 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.',
        timestamp: new Date().toLocaleTimeString('ar-SA')
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
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
      
      <div className={`fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-6 sm:right-auto w-auto sm:w-[420px] z-50 transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-auto'
      }`}>
        <div className="glass-effect rounded-2xl shadow-2xl overflow-hidden border border-[#8B7355]/20 backdrop-blur-xl">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#8B7355]/10 to-[#D4AF37]/10 flex justify-between items-center border-b border-[#8B7355]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B7355] to-[#654321] flex items-center justify-center relative shadow-lg">
                <Brain className="w-5 h-5 text-white" />
                <Sparkles className="w-3 h-3 text-[#D4AF37] absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#2D2D2D]">المساعد الذكي</h3>
                <p className="text-xs text-[#6B7280]">متاح الآن للمساعدة</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 hover:bg-[#8B7355]/10 rounded-xl transition-colors"
                title={isMinimized ? "توسيع" : "تصغير"}
              >
                <Minimize2 className="w-4 h-4 text-[#8B7355]" />
              </button>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-red-100 hover:text-red-600 rounded-xl transition-colors"
                title="إغلاق"
              >
                <X className="w-4 h-4 text-[#8B7355]" />
              </button>
            </div>
          </div>
          
          {/* Messages Area - يظهر فقط عندما لا يكون مصغراً */}
          {!isMinimized && (
            <>
              <div className="h-80 sm:h-96 overflow-y-auto p-4 scrollbar-hide bg-gradient-to-b from-white/50 to-white/30">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'} animate-fade-in`}>
                      <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                        message.role === 'assistant' 
                          ? 'bg-gradient-to-br from-[#8B7355]/10 to-[#D4AF37]/10 border border-[#8B7355]/20' 
                          : 'bg-gradient-to-br from-[#8B7355] to-[#654321] text-white shadow-lg'
                      }`}>
                        <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                        <span className={`text-xs mt-2 block ${message.role === 'assistant' ? 'text-[#8B7355]' : 'text-white/70'}`}>
                          {message.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-[#8B7355]/10 bg-white/80">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="اكتب سؤالك هنا..."
                    className="input-modern flex-1 text-sm"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isLoading}
                    className="btn-primary px-4 py-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
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