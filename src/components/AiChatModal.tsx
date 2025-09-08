import React, { useState } from 'react';
import { X, Send, Brain, Sparkles } from 'lucide-react';

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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: 'مرحباً بك في فطن! كيف يمكنني مساعدتك اليوم؟',
      timestamp: new Date().toLocaleTimeString('ar-SA')
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

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
    <div className="fixed bottom-20 sm:bottom-24 left-4 right-4 sm:left-8 sm:right-auto w-auto sm:w-96 glass-effect rounded-2xl shadow-2xl overflow-hidden border border-[#8B7355]/20">
      <div className="p-4 bg-gradient-to-r from-[#8B7355]/10 to-[#D4AF37]/10 flex justify-between items-center border-b border-[#8B7355]/20">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B7355] to-[#654321] flex items-center justify-center relative">
            <Brain className="w-5 h-5 text-white" />
            <Sparkles className="w-3 h-3 text-[#D4AF37] absolute -top-1 -right-1" />
          </div>
          <h3 className="font-bold text-sm sm:text-base text-[#2D2D2D]">المساعد الذكي</h3>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-[#8B7355]/10 rounded-xl transition-colors">
          <X className="w-5 h-5 text-[#8B7355]" />
        </button>
      </div>
      
      <div className="h-64 sm:h-96 overflow-y-auto p-4 scrollbar-hide">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                message.role === 'assistant' 
                  ? 'bg-gradient-to-br from-[#8B7355]/10 to-[#D4AF37]/10 border border-[#8B7355]/20' 
                  : 'bg-gradient-to-br from-[#8B7355] to-[#654321] text-white shadow-lg'
              }`}>
                <p className="text-xs sm:text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                <span className={`text-xs mt-2 block ${message.role === 'assistant' ? 'text-[#8B7355]' : 'text-white/70'}`}>
                  {message.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-[#8B7355]/10">
        <div className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="اكتب سؤالك هنا..."
            className="input-modern flex-1"
          />
          <button
            type="submit"
            className="btn-primary px-4 py-2 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AiChatModal;