import React, { useState, useEffect } from 'react';
import { X, Send, MessageSquare, Ban } from 'lucide-react';
import { getDiscussion, addMessage } from '../lib/discussions';
import { isUserBanned } from '../lib/bans';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender: {
    full_name: string;
    role: string;
  };
}

interface DiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: {
    id: string | number;
    title: string;
    date?: string;
  };
}

const DiscussionModal: React.FC<DiscussionModalProps> = ({ isOpen, onClose, topic }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isBanned, setIsBanned] = useState(false);
  const [banReason, setBanReason] = useState('');

  // جلب بيانات المستخدم الحالي
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        setCurrentUser(userData);
      }
    };
    getCurrentUser();
  }, []);

  // جلب رسائل النقاش عند فتح المودال
  useEffect(() => {
    if (isOpen && topic.id) {
      loadMessages();
      checkBanStatus();
    }
  }, [isOpen, topic.id]);

  const checkBanStatus = async () => {
    if (currentUser) {
      const result = await isUserBanned(currentUser.id, String(topic.id));
      if (result.success) {
        setIsBanned(result.isBanned);
        if (result.banData) {
          setBanReason(result.banData.reason || 'مخالفة قواعد النقاش');
        }
      }
    }
  };

  const loadMessages = async () => {
    setLoading(true);
    setError('');
    const result = await getDiscussion(String(topic.id));
    if (result.success && result.data) {
      setMessages(result.data.messages || []);
    } else {
      setError('فشل تحميل الرسائل');
    }
    setLoading(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isBanned) return;

    setSending(true);
    setError('');

    const result = await addMessage(String(topic.id), newMessage.trim());

    if (result.success) {
      // إضافة الرسالة الجديدة للقائمة
      if (result.data) {
        setMessages([...messages, result.data]);
      }
      setNewMessage('');
      // إعادة تحميل الرسائل للحصول على أحدث البيانات
      await loadMessages();
    } else {
      setError(result.error || 'فشل إرسال الرسالة');
    }

    setSending(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-effect rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#8B7355]/10 to-[#D4AF37]/10 text-[#654321] flex justify-between items-center border-b border-[#8B7355]/20 flex-shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold">{topic.title}</h2>
            <p className="text-sm text-[#6B7280] mt-1">{messages.length} رسالة</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#8B7355]/20 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B7355]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
              <button
                onClick={loadMessages}
                className="btn-primary mt-4"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-[#8B7355] py-12">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-semibold mb-2">لا توجد رسائل بعد</p>
                  <p className="text-sm text-[#6B7280]">كن أول من يبدأ النقاش حول هذا الموضوع</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isExpert = message.sender?.role === 'expert';
                  const isCurrentUser = currentUser && message.sender_id === currentUser.id;
                  const senderName = message.sender?.full_name || 'مستخدم';
                  const messageTime = new Date(message.created_at).toLocaleString('ar-SA', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] sm:max-w-[70%] ${
                        isExpert
                          ? 'bg-gradient-to-br from-[#8B5CF6]/10 to-[#7C3AED]/10 border-[#8B5CF6]/20'
                          : isCurrentUser
                          ? 'bg-gradient-to-br from-[#8B7355]/10 to-[#654321]/10 border-[#8B7355]/20'
                          : 'bg-[#F4EFE9] border-[#8B7355]/10'
                      } border-2 rounded-2xl p-4 shadow-sm`}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                            isExpert ? 'bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]' : 'bg-gradient-to-br from-[#8B7355] to-[#654321]'
                          }`}>
                            {senderName.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold text-sm ${isExpert ? 'text-[#8B5CF6]' : 'text-[#654321]'}`}>
                                {senderName}
                              </span>
                              {isExpert && (
                                <span className="text-xs bg-[#8B5CF6]/20 text-[#8B5CF6] px-2 py-0.5 rounded-full font-semibold">
                                  خبير
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-[#6B7280]">{messageTime}</span>
                          </div>
                        </div>
                        <p className="text-[#2D2D2D] leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="p-4 sm:p-6 border-t border-[#8B7355]/20 flex-shrink-0 bg-white/50">
          {isBanned ? (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-center">
              <Ban className="w-12 h-12 mx-auto text-red-500 mb-3" />
              <h4 className="text-lg font-bold text-red-700 mb-2">تم تجميدك من هذا النقاش</h4>
              <p className="text-sm text-red-600">
                السبب: {banReason}
              </p>
              <p className="text-xs text-gray-600 mt-2">
                للمزيد من المعلومات، يرجى التواصل مع إدارة المنصة
              </p>
            </div>
          ) : (
            <>
              {error && !loading && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}
              <div className="flex gap-2 sm:gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="شارك في النقاش..."
                  disabled={sending}
                  className="flex-1 input-modern disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="btn-primary px-4 sm:px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">{sending ? 'إرسال...' : 'إرسال'}</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default DiscussionModal;