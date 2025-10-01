import React, { useState } from 'react';
import { X, Bell, Clock, CheckCircle, AlertTriangle, Info, Trash2, AreaChart as MarkAsUnread } from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean;
  category: string;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'user' | 'expert' | 'admin';
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, userRole }) => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    // إشعارات مختلفة حسب نوع المستخدم
    const baseNotifications: Notification[] = [
      {
        id: 1,
        title: "مرحباً بك في فطن",
        message: "نتمنى لك تجربة تعليمية مفيدة ومثمرة",
        type: "success",
        timestamp: "منذ 5 دقائق",
        isRead: false,
        category: "ترحيب"
      },
      {
        id: 2,
        title: "محتوى جديد متاح",
        message: "تم إضافة كتاب جديد: 'أسس الأمن الفكري المعاصر'",
        type: "info",
        timestamp: "منذ ساعة",
        isRead: false,
        category: "محتوى"
      },
      {
        id: 3,
        title: "نقاش نشط",
        message: "انضم إلى النقاش حول 'دور الأسرة في تعزيز الأمن الفكري'",
        type: "info",
        timestamp: "منذ ساعتين",
        isRead: true,
        category: "نقاشات"
      }
    ];

    if (userRole === 'admin') {
      return [
        ...baseNotifications,
        {
          id: 4,
          title: "تحديث النظام",
          message: "تم تحديث لوحة الإدارة بميزات جديدة",
          type: "success",
          timestamp: "منذ 3 ساعات",
          isRead: false,
          category: "نظام"
        },
        {
          id: 5,
          title: "تقرير يومي",
          message: "تقرير النشاط اليومي جاهز للمراجعة - 1,247 مستخدم نشط",
          type: "info",
          timestamp: "منذ 4 ساعات",
          isRead: true,
          category: "تقارير"
        },
        {
          id: 6,
          title: "تنبيه أمني",
          message: "محاولة دخول مشبوهة تم حظرها تلقائياً",
          type: "warning",
          timestamp: "منذ 6 ساعات",
          isRead: false,
          category: "أمان"
        }
      ];
    }

    if (userRole === 'expert') {
      return [
        ...baseNotifications,
        {
          id: 4,
          title: "طلب استشارة جديد",
          message: "لديك 3 طلبات استشارة جديدة في انتظار الرد",
          type: "warning",
          timestamp: "منذ 30 دقيقة",
          isRead: false,
          category: "استشارات"
        },
        {
          id: 5,
          title: "تقييم إيجابي",
          message: "حصلت على تقييم 5 نجوم من أحمد محمد",
          type: "success",
          timestamp: "منذ يوم",
          isRead: true,
          category: "تقييمات"
        }
      ];
    }

    return [
      ...baseNotifications,
      {
        id: 4,
        title: "فعالية قادمة",
        message: "ورشة عمل 'تعزيز الهوية الوطنية' تبدأ غداً الساعة 7 مساءً",
        type: "warning",
        timestamp: "منذ يوم",
        isRead: false,
        category: "فعاليات"
      },
      {
        id: 5,
        title: "إنجاز جديد",
        message: "تهانينا! أكملت 75% من المحتوى التعليمي",
        type: "success",
        timestamp: "منذ يومين",
        isRead: true,
        category: "إنجازات"
      }
    ];
  });

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
  };

  const markAsUnread = (id: number) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, isRead: false } : notif
    ));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(notif => !notif.isRead)
    : notifications;

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-effect rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-[#8B7355]/20 bg-gradient-to-r from-[#8B7355]/10 to-[#D4AF37]/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B7355] to-[#654321] flex items-center justify-center relative">
                <Bell className="w-5 h-5 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#2D2D2D]">الإشعارات</h3>
                <p className="text-sm text-[#6B7280]">
                  {unreadCount > 0 ? `${unreadCount} إشعار غير مقروء` : 'جميع الإشعارات مقروءة'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-[#8B7355]/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-[#8B7355]" />
            </button>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === 'all' 
                  ? 'bg-[#8B7355] text-white' 
                  : 'bg-white/50 text-[#8B7355] hover:bg-white/70'
              }`}
            >
              الكل ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === 'unread' 
                  ? 'bg-[#8B7355] text-white' 
                  : 'bg-white/50 text-[#8B7355] hover:bg-white/70'
              }`}
            >
              غير مقروء ({unreadCount})
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-all"
              >
                تحديد الكل كمقروء
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto p-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-[#6B7280]">
              <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">لا توجد إشعارات</p>
              <p className="text-sm">ستظهر الإشعارات الجديدة هنا</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                    notification.isRead 
                      ? 'bg-white border-[#8B7355]/10' 
                      : `${getNotificationBg(notification.type)} border-2`
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className={`font-semibold text-sm ${
                            notification.isRead ? 'text-[#6B7280]' : 'text-[#2D2D2D]'
                          }`}>
                            {notification.title}
                          </h4>
                          <p className={`text-sm mt-1 ${
                            notification.isRead ? 'text-[#9CA3AF]' : 'text-[#6B7280]'
                          }`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1 text-xs text-[#8B7355]">
                              <Clock className="w-3 h-3" />
                              <span>{notification.timestamp}</span>
                            </div>
                            <span className="text-xs bg-[#8B7355]/10 text-[#8B7355] px-2 py-1 rounded-full">
                              {notification.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {notification.isRead ? (
                            <button
                              onClick={() => markAsUnread(notification.id)}
                              className="p-1 hover:bg-[#8B7355]/10 rounded text-[#8B7355] transition-colors"
                              title="تحديد كغير مقروء"
                            >
                              <MarkAsUnread className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 hover:bg-green-100 rounded text-green-600 transition-colors"
                              title="تحديد كمقروء"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 hover:bg-red-100 rounded text-red-500 transition-colors"
                            title="حذف الإشعار"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#8B7355]/20 bg-[#8B7355]/5">
          <div className="flex items-center justify-between text-sm text-[#6B7280]">
            <span>آخر تحديث: الآن</span>
            <button className="text-[#8B7355] hover:text-[#D4AF37] font-medium transition-colors">
              إعدادات الإشعارات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;