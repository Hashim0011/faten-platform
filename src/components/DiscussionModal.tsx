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
      const {
        data: { user },
      } = await supabase.auth.getUser();
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

  // جلب رسائل النقاش عند فتح المودل
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
      // إعادة تحميل الرسائل
      await loadMessages();
    } else {
      setError(result.error || 'فشل إرسال الرسالة');
    }

    setSending(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
      <div className="glass-effect flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl sm:max-h-[85vh] sm:rounded-2xl">
        <div className="flex flex-shrink-0 items-start justify-between gap-2 border-b border-[#8B7355]/20 bg-gradient-to-r from-[#8B7355]/10 to-[#D4AF37]/10 p-3 text-[#654321] sm:items-center sm:p-4 lg:p-6">
          <div className="min-w-0 flex-1">
            <h2 className="line-clamp-2 text-base font-bold sm:text-lg lg:text-xl">
              {topic.title}
            </h2>
            <p className="mt-1 text-xs text-[#6B7280] sm:text-sm">{messages.length} رسالة</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-xl p-1.5 transition-colors hover:bg-[#8B7355]/20 sm:p-2"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#8B7355] sm:h-12 sm:w-12"></div>
            </div>
          ) : error ? (
            <div className="py-8 text-center sm:py-12">
              <p className="mb-3 text-sm text-red-600 sm:mb-4 sm:text-base">{error}</p>
              <button onClick={loadMessages} className="btn-primary text-sm sm:text-base">
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {messages.length === 0 ? (
                <div className="py-8 text-center text-[#8B7355] sm:py-12">
                  <MessageSquare className="mx-auto mb-3 h-12 w-12 opacity-30 sm:mb-4 sm:h-16 sm:w-16" />
                  <p className="mb-2 text-base font-semibold sm:text-lg">لا توجد رسائل بعد</p>
                  <p className="text-xs text-[#6B7280] sm:text-sm">
                    كن أول من يبدأ النقاش حول هذا الموضوع
                  </p>
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
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[90%] sm:max-w-[85%] lg:max-w-[70%] ${
                          isExpert
                            ? 'border-[#8B5CF6]/20 bg-gradient-to-br from-[#8B5CF6]/10 to-[#7C3AED]/10'
                            : isCurrentUser
                              ? 'border-[#8B7355]/20 bg-gradient-to-br from-[#8B7355]/10 to-[#654321]/10'
                              : 'border-[#8B7355]/10 bg-[#F4EFE9]'
                        } rounded-xl border-2 p-3 shadow-sm sm:rounded-2xl sm:p-4`}
                      >
                        <div className="mb-2 flex items-center gap-2 sm:mb-3">
                          <div
                            className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white sm:h-8 sm:w-8 sm:text-sm ${
                              isExpert
                                ? 'bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]'
                                : 'bg-gradient-to-br from-[#8B7355] to-[#654321]'
                            }`}
                          >
                            {senderName.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`text-xs font-semibold sm:text-sm ${isExpert ? 'text-[#8B5CF6]' : 'text-[#654321]'} truncate`}
                              >
                                {senderName}
                              </span>
                              {isExpert && (
                                <span className="whitespace-nowrap rounded-full bg-[#8B5CF6]/20 px-1.5 py-0.5 text-[10px] font-semibold text-[#8B5CF6] sm:px-2 sm:text-xs">
                                  خبير
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#6B7280] sm:text-xs">
                              {messageTime}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs leading-relaxed text-[#2D2D2D] sm:text-sm">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSendMessage}
          className="flex-shrink-0 border-t border-[#8B7355]/20 bg-white/50 p-3 sm:p-4 lg:p-6"
        >
          {isBanned ? (
            <div className="rounded-xl border-2 border-red-200 bg-red-50 p-3 text-center sm:p-4">
              <Ban className="mx-auto mb-2 h-10 w-10 text-red-500 sm:mb-3 sm:h-12 sm:w-12" />
              <h4 className="mb-2 text-base font-bold text-red-700 sm:text-lg">
                تم تجميدك من هذا النقاش
              </h4>
              <p className="text-xs text-red-600 sm:text-sm">السبب: {banReason}</p>
              <p className="mt-2 text-[10px] text-gray-600 sm:text-xs">
                للمزيد من المعلومات، يرجى التواصل مع إدارة المنصة
              </p>
            </div>
          ) : (
            <>
              {error && !loading && (
                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-600 sm:p-3 sm:text-sm">
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
                  className="input-modern min-w-0 flex-1 text-xs disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                  style={{
                    paddingTop: '0.625rem',
                    paddingBottom: '0.625rem',
                    paddingRight: '0.75rem',
                    paddingLeft: '0.75rem',
                  }}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="btn-primary flex flex-shrink-0 items-center gap-2 px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm lg:px-6"
                >
                  <Send className="h-3 w-3 sm:h-4 sm:w-4" />
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
