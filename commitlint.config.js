export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // الأنواع المسموحة — تُبنى منها ملاحظات الإصدار تلقائياً
    'type-enum': [
      2,
      'always',
      [
        'feat', // ميزة جديدة        → إصدار MINOR
        'fix', // إصلاح خطأ          → إصدار PATCH
        'docs', // توثيق فقط
        'style', // تنسيق بلا تغيير منطق
        'refactor', // إعادة هيكلة
        'perf', // تحسين أداء
        'test', // اختبارات
        'build', // نظام البناء أو التبعيات
        'ci', // ملفات البايب لاين
        'chore', // صيانة عامة
        'revert', // تراجع عن commit
      ],
    ],
    // مُعطَّلة: العناوين بالعربية لا تنطبق عليها قواعد حالة الأحرف
    'subject-case': [0],
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [0],
  },
};
