import React, { useState } from 'react';
import { X, Send, Brain, Sparkles, Minimize2 } from 'lucide-react';

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

  // إغلاق الشات عند النقر خارج المساحة
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      role: 'user',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('ar-SA')
    };

    const assistantResponses: { [key: string]: string } = {
      'ما هو الأمن الفكري؟': 'الأمن الفكري هو حماية وتحصين العقل من الأفكار المنحرفة والمعتقدات الخاطئة، وتعزيز القيم والمبادئ الإسلامية والوطنية. يهدف إلى بناء شخصية متوازنة قادرة على التفكير النقدي والتمييز بين الصواب والخطأ.',
      'كيف يمكن تحقيق الأمن الفكري؟': 'يمكن تحقيق الأمن الفكري من خلال:\n1. التربية الإسلامية الصحيحة\n2. تعزيز الهوية الوطنية\n3. تنمية مهارات التفكير النقدي\n4. التواصل المستمر مع العلماء والمختصين\n5. الحوار المفتوح داخل الأسرة والمجتمع',
      'ما هي مهددات الأمن الفكري؟': 'من أبرز مهددات الأمن الفكري:\n1. التطرف والغلو\n2. الشائعات والمعلومات المضللة\n3. الغزو الثقافي\n4. ضعف الهوية الوطنية\n5. التقليد الأعمى للثقافات الأخرى',
      'ما هي خدمات منصة فطن؟': 'تقدم منصة فطن العديد من الخدمات:\n1. محتوى تعليمي موثوق\n2. استشارات مع خبراء متخصصين\n3. ورش عمل ودورات تدريبية\n4. نقاشات تفاعلية\n5. مكتبة رقمية متخصصة'
    };

    const assistantMessage: Message = {
      id: messages.length + 2,
      role: 'assistant',
      content: assistantResponses[newMessage] || 'عذراً، لم أفهم سؤالك. هل يمكنك إعادة صياغته بطريقة أخرى؟',
      timestamp: new Date().toLocaleTimeString('ar-SA')
    };

    setMessages([...messages, userMessage, assistantMessage]);
    setNewMessage('');
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
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="btn-primary px-4 py-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
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