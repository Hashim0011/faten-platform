import React, { useState } from 'react';
import { X, Send, Brain } from 'lucide-react';

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
    <div className="fixed bottom-24 left-8 w-96 bg-white rounded-lg shadow-xl border border-[#8B7355]/20 overflow-hidden">
      <div className="p-3 bg-[#F4EFE9] flex justify-between items-center border-b border-[#8B7355]/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#8B7355] flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-semibold text-[#654321]">المساعد الذكي</h3>
        </div>
        <button onClick={onClose} className="hover:bg-[#8B7355]/10 rounded p-1">
          <X className="w-5 h-5 text-[#654321]" />
        </button>
      </div>
      
      <div className="h-96 overflow-y-auto p-4 bg-white">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'assistant' ? 'bg-[#F4EFE9]' : 'bg-[#8B7355] text-white'
              }`}>
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                <span className="text-xs mt-1 block opacity-70">{message.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSendMessage} className="p-3 border-t border-[#8B7355]/10 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="اكتب سؤالك هنا..."
            className="flex-1 p-2 border border-[#8B7355]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355]"
          />
          <button
            type="submit"
            className="p-2 border border-[#8B7355]/20 text-[#8B7355] rounded-lg hover:bg-[#F4EFE9] transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AiChatModal;