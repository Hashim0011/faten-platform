import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  MessageSquare,
  BookOpen,
  Users,
  UserPlus,
} from 'lucide-react';
import { getMyNotifications, markAsRead, markAllAsRead } from '../lib/notifications';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  related_id?: string;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'user' | 'expert' | 'admin';
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, userRole }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setLoading(true);
    const result = await getMyNotifications();
    if (result.success && result.data) {
      setNotifications(result.data);
    }
    setLoading(false);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
    await loadNotifications();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    await loadNotifications();
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'منذ لحظات';
    if (seconds < 3600) return `منذ ${Math.floor(seconds / 60)} دقيقة`;
    if (seconds < 86400) return `منذ ${Math.floor(seconds / 3600)} ساعة`;
    if (seconds < 604800) return `منذ ${Math.floor(seconds / 86400)} يوم`;
    return date.toLocaleDateString('ar-SA');
  };

  if (!isOpen) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_content':
        return <BookOpen className="h-5 w-5 text-green-500" />;
      case 'new_discussion':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'expert_joined':
        return <UserPlus className="h-5 w-5 text-purple-500" />;
      case 'new_event':
        return <Info className="h-5 w-5 text-[#8B7355]" />;
      case 'system':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Bell className="h-5 w-5 text-[#8B7355]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="glass-effect max-h-[80vh] w-full max-w-md overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-[#8B7355]/20 p-6">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-[#8B7355]" />
            <h3 className="text-xl font-bold text-[#2D2D2D]">الإشعارات</h3>
            {notifications.filter((n) => !n.is_read).length > 0 && (
              <span className="rounded-full bg-[#8B7355] px-2 py-1 text-xs text-white">
                {notifications.filter((n) => !n.is_read).length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-[#8B7355]/10"
          >
            <X className="h-5 w-5 text-[#6B7280]" />
          </button>
        </div>

        <div className="max-h-[calc(80vh-180px)] overflow-y-auto">
          {loading ? (
            <div className="p-12 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#8B7355]"></div>
              <p className="mt-4 text-[#6B7280]">جاري التحميل...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="mx-auto mb-4 h-16 w-16 text-[#6B7280] opacity-50" />
              <p className="text-[#6B7280]">لا توجد إشعارات</p>
            </div>
          ) : (
            <div className="space-y-3 p-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    notification.is_read
                      ? 'border-[#8B7355]/10 bg-white'
                      : 'border-[#8B7355]/20 bg-[#8B7355]/5'
                  } hover:shadow-md`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-[#2D2D2D]">{notification.title}</h4>
                        {!notification.is_read && (
                          <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[#8B7355]"></div>
                        )}
                      </div>
                      <p className="mb-2 text-sm text-[#6B7280]">{notification.message}</p>
                      <p className="text-xs text-[#8B7355]">
                        {getTimeAgo(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-[#8B7355]/20 p-4">
          {notifications.filter((n) => !n.is_read).length > 0 && (
            <button
              className="flex-1 text-sm font-medium text-[#8B7355] transition-colors hover:text-[#D4AF37]"
              onClick={handleMarkAllAsRead}
            >
              تحديد الكل كمقروء
            </button>
          )}
          <button
            className="flex-1 text-sm font-medium text-[#8B7355] transition-colors hover:text-[#D4AF37]"
            onClick={onClose}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
