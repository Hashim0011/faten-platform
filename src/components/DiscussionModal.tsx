import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

interface Message {
  id: number;
  user: string;
  role: 'expert' | 'user';
  content: string;
  timestamp: string;
}

interface DiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: {
    id: number;
    title: string;
    date: string;
  };
}

const DiscussionModal: React.FC<DiscussionModalProps> = ({ isOpen, onClose, topic }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      user: 'محمد العتيبي',
      role: 'user',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('ar-SA')
    };

    const expertResponse: Message = {
      id: messages.length + 2,
      user: 'د. أحمد السالم',
      role: 'expert',
      content: 'شكراً لمشاركتك القيمة. نعم، هذه نقطة مهمة في موضوع الأمن الفكري. هل لديك المزيد من الأفكار حول هذا الموضوع؟',
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, userMessage, expertResponse]);
    setNewMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
        <div className="p-3 bg-[#F4EFE9] text-[#654321] flex justify-between items-center border-b border-[#8B7355]/20">
          <h2 className="text-lg font-bold">{topic.title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-[#8B7355]/10 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="h-[calc(80vh-180px)] overflow-y-auto p-6">
          <div className="space-y-6">
            {messages.length === 0 ? (
              <div className="text-center text-[#8B7355] py-8">
                <p>كن أول من يبدأ النقاش حول هذا الموضوع</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'expert' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] ${message.role === 'expert' ? 'bg-[#F4EFE9]' : 'bg-[#8B7355]/5'} rounded-lg p-4`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${message.role === 'expert' ? 'bg-[#654321]' : 'bg-[#8B7355]'}`}>
                        {message.user[0]}
                      </div>
                      <span className={`font-semibold ${message.role === 'expert' ? 'text-[#654321]' : 'text-[#8B7355]'}`}>
                        {message.user}
                      </span>
                      <span className="text-sm text-gray-500">{message.timestamp}</span>
                    </div>
                    <p className="text-gray-700">{message.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <form onSubmit={handleSendMessage} className="p-4 border-t border-[#8B7355]/10">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="شارك في النقاش..."
              className="flex-1 p-2 border border-[#8B7355]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#8B7355] text-white rounded-lg hover:bg-[#654321] transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>إرسال</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiscussionModal;