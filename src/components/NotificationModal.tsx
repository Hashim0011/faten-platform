import React from 'react';
import { X, Bell, CheckCircle, AlertTriangle, Info, MessageSquare } from 'lucide-react';

interface Notification {
  id: number;
  type: 'info' | 'success' | 'warning' | 'message';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'user' | 'expert' | 'admin';
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, userRole }) => {
  if (!isOpen) return null;

  // Mock notifications based on user role
  const getNotifications = (): Notification[] => {
    if (userRole === 'admin') {
      return [
        {
          id: 1,
          type: 'warning',
          title: 'تنبيه إداري',
          message: 'يوجد 3 تقارير محتوى جديدة تحتاج إلى مراجعة',
          time: 'منذ 5 دقائق',
          read: false
        },
        {
          id: 2,
          type: 'success',
          title: 'خبير جديد',
          message: 'انضم خبير جديد إلى المنصة: د. محمد الأحمد',
          time: 'منذ 15 دقيقة',
          read: false
        },
        {
          id: 3,
          type: 'info',
          title: 'إحصائيات اليوم',
          message: 'تم تسجيل 45 مستخدم جديد اليوم',
          time: 'منذ ساعة',
          read: true
        }
      ];
    } else if (userRole === 'expert') {
      return [
        {
          id: 1,
          type: 'message',
          title: 'نقاش جديد',
          message: 'تم تعيينك لنقاش جديد: "الأمن الفكري في العصر الرقمي"',
          time: 'منذ 10 دقائق',
          read: false
        },
        {
          id: 2,
          type: 'success',
          title: 'تقييم إيجابي',
          message: 'حصلت على تقييم 5 نجوم من مستخدم',
          time: 'منذ 30 دقيقة',
          read: false
        },
        {
          id: 3,
          type: 'info',
          title: 'تذكير',
          message: 'لديك نقاش مجدول في غضون ساعة واحدة',
          time: 'منذ ساعتين',
          read: true
        }
      ];
    } else {
      return [
        {
          id: 1,
          type: 'success',
          title: 'محتوى جديد',
          message: 'تمت إضافة كتاب جديد: "مهارات التفكير النقدي"',
          time: 'منذ 20 دقيقة',
          read: false
        },
        {
          id: 2,
          type: 'message',
          title: 'رد الخبير',
          message: 'رد الخبير على سؤالك في النقاش',
          time: 'منذ ساعة',
          read: false
        },
        {
          id: 3,
          type: 'info',
          title: 'إنجاز جديد',
          message: 'تهانينا! أكملت 50% من محتوى الأمن الفكري',
          time: 'منذ ساعتين',
          read: true
        }
      ];
    }
  };

  const notifications = getNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-[#8B7355]" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-effect rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-[#8B7355]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-[#8B7355]" />
            <h3 className="text-xl font-bold text-[#2D2D2D]">الإشعارات</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#8B7355]/10 transition-colors"
          >
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
          {notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-16 h-16 mx-auto mb-4 text-[#6B7280] opacity-50" />
              <p className="text-[#6B7280]">لا توجد إشعارات جديدة</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    notification.read
                      ? 'bg-white border-[#8B7355]/10'
                      : 'bg-[#8B7355]/5 border-[#8B7355]/20'
                  } hover:shadow-md`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-[#2D2D2D]">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-[#8B7355] rounded-full flex-shrink-0 mt-2"></div>
                        )}
                      </div>
                      <p className="text-sm text-[#6B7280] mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-[#8B7355]">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#8B7355]/20">
          <button
            className="w-full text-sm text-[#8B7355] hover:text-[#D4AF37] font-medium transition-colors"
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
