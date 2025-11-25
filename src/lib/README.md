# دليل استخدام Supabase في المشروع

## ملف الاتصال: `supabase.ts`

هذا الملف يحتوي على إعدادات الاتصال بـ Supabase.

## الاستخدام في المكونات

### مثال 1: قراءة البيانات

```typescript
import { supabase } from '../lib/supabase';

// في component أو function
const fetchUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*');

  if (error) {
    console.error('خطأ:', error);
    return;
  }

  console.log('المستخدمون:', data);
};
```

### مثال 2: إضافة بيانات

```typescript
import { supabase } from '../lib/supabase';

const addUser = async (name: string, email: string) => {
  const { data, error } = await supabase
    .from('users')
    .insert([
      { name, email }
    ])
    .select();

  if (error) {
    console.error('خطأ في الإضافة:', error);
    return;
  }

  console.log('تمت الإضافة:', data);
};
```

### مثال 3: تحديث البيانات

```typescript
import { supabase } from '../lib/supabase';

const updateUser = async (userId: number, newName: string) => {
  const { data, error } = await supabase
    .from('users')
    .update({ name: newName })
    .eq('id', userId)
    .select();

  if (error) {
    console.error('خطأ في التحديث:', error);
    return;
  }

  console.log('تم التحديث:', data);
};
```

### مثال 4: حذف البيانات

```typescript
import { supabase } from '../lib/supabase';

const deleteUser = async (userId: number) => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) {
    console.error('خطأ في الحذف:', error);
    return;
  }

  console.log('تم الحذف بنجاح');
};
```

## Authentication (المصادقة)

### تسجيل مستخدم جديد

```typescript
import { supabase } from '../lib/supabase';

const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('خطأ في التسجيل:', error);
    return;
  }

  console.log('تم التسجيل:', data);
};
```

### تسجيل الدخول

```typescript
import { supabase } from '../lib/supabase';

const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    return;
  }

  console.log('تم تسجيل الدخول:', data);
};
```

### تسجيل الخروج

```typescript
import { supabase } from '../lib/supabase';

const signOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('خطأ في تسجيل الخروج:', error);
    return;
  }

  console.log('تم تسجيل الخروج');
};
```

### الحصول على المستخدم الحالي

```typescript
import { supabase } from '../lib/supabase';

const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
```

## Realtime Subscriptions (الاشتراكات الحية)

```typescript
import { supabase } from '../lib/supabase';

// الاستماع للتغييرات في جدول معين
const channel = supabase
  .channel('custom-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'users' },
    (payload) => {
      console.log('تغيير في البيانات:', payload);
    }
  )
  .subscribe();

// إلغاء الاشتراك
// channel.unsubscribe();
```

## متغيرات البيئة المتاحة

```typescript
import { config } from '../lib/supabase';

console.log('Supabase URL:', config.supabaseUrl);
```

## نصائح مهمة

1. **دائماً تحقق من الأخطاء**: كل استدعاء لـ Supabase يرجع `error`
2. **استخدم `.select()` بعد `.insert()` أو `.update()`** للحصول على البيانات المحدثة
3. **لا تضع API Keys في الكود** - استخدم متغيرات البيئة فقط
4. **افتح Console** لرؤية رسالة الاتصال بـ Supabase عند تشغيل المشروع
