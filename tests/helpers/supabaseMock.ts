import { vi } from 'vitest';

/**
 * ═══════════════════════════════════════════════════════════
 *  محاكي Supabase — أداة اختبار مشتركة
 *
 *  المشكلة: مكتبة Supabase تستخدم سلسلة استدعاءات مرنة:
 *      supabase.from('users').select('role').eq('id', x).single()
 *  وكل تابع يعيد الباني نفسه، والنتيجة تُحلّ عند await أو single().
 *
 *  الحل: باني وهمي كل توابعه تعيده هو، وهو نفسه "thenable"
 *  فيُحلّ بالنتيجة التالية في الطابور عند انتظاره.
 *
 *  لماذا نحاكي بدل الاتصال بقاعدة حقيقية؟
 *   • السرعة    — مللي ثانية بدل ثوانٍ
 *   • الحتمية   — لا تعتمد على شبكة أو حالة قاعدة
 *   • التغطية   — نختبر مسارات الفشل التي يصعب إنتاجها فعلياً
 * ═══════════════════════════════════════════════════════════
 */

export interface MockResult {
  data?: unknown;
  error?: unknown;
  count?: number | null;
}

/** توابع السلسلة — تعيد الباني نفسه للسماح بالتسلسل */
const CHAIN_METHODS = [
  'select',
  'insert',
  'update',
  'delete',
  'upsert',
  'eq',
  'neq',
  'in',
  'is',
  'or',
  'order',
  'limit',
  'range',
  'gte',
  'lte',
  'lt',
  'gt',
  'like',
  'ilike',
  'contains',
  'match',
  'not',
  'filter',
] as const;

/** توابع تُنهي السلسلة وتعيد وعداً مباشرة */
const TERMINAL_METHODS = ['single', 'maybeSingle'] as const;

export interface SupabaseMock {
  /** كائن supabase الوهمي — يُمرَّر إلى vi.mock */
  client: Record<string, unknown>;
  /** ضع نتيجة (أو أكثر) تُستهلك بالترتيب عند كل انتظار */
  queue: (...results: MockResult[]) => void;
  /** سجل الاستدعاءات للتحقق من الاستعلامات */
  calls: { method: string; args: unknown[] }[];
  /** تصفير الطابور والسجل بين الاختبارات */
  reset: () => void;
  /** توابع المصادقة الوهمية */
  auth: {
    getUser: ReturnType<typeof vi.fn>;
    signUp: ReturnType<typeof vi.fn>;
    signInWithPassword: ReturnType<typeof vi.fn>;
    signInWithOtp: ReturnType<typeof vi.fn>;
    verifyOtp: ReturnType<typeof vi.fn>;
    signOut: ReturnType<typeof vi.fn>;
  };
}

export function createSupabaseMock(): SupabaseMock {
  const results: MockResult[] = [];
  const calls: { method: string; args: unknown[] }[] = [];

  // النتيجة الافتراضية عند فراغ الطابور: نجاح فارغ
  const nextResult = (): MockResult =>
    results.length > 0 ? results.shift()! : { data: null, error: null };

  const record = (method: string, args: unknown[]) => calls.push({ method, args });

   
  const builder: any = {};

  for (const method of CHAIN_METHODS) {
    builder[method] = vi.fn((...args: unknown[]) => {
      record(method, args);
      return builder;
    });
  }

  for (const method of TERMINAL_METHODS) {
    builder[method] = vi.fn((...args: unknown[]) => {
      record(method, args);
      return Promise.resolve(nextResult());
    });
  }

  // يجعل الباني قابلاً للانتظار: await supabase.from('x').select().eq(...)
  builder.then = (
    onFulfilled?: (value: MockResult) => unknown,
    onRejected?: (reason: unknown) => unknown
  ) => Promise.resolve(nextResult()).then(onFulfilled, onRejected);

  const auth = {
    getUser: vi.fn(async () => ({ data: { user: null }, error: null })),
    signUp: vi.fn(async () => ({ data: { user: null }, error: null })),
    signInWithPassword: vi.fn(async () => ({ data: { user: null }, error: null })),
    signInWithOtp: vi.fn(async () => ({ data: {}, error: null })),
    verifyOtp: vi.fn(async () => ({ data: {}, error: null })),
    signOut: vi.fn(async () => ({ error: null })),
  };

  const client = {
    from: vi.fn((table: string) => {
      record('from', [table]);
      return builder;
    }),
    rpc: vi.fn((fn: string, params?: unknown) => {
      record('rpc', [fn, params]);
      return Promise.resolve(nextResult());
    }),
    auth,
  };

  return {
    client,
    auth,
    calls,
    queue: (...items: MockResult[]) => results.push(...items),
    reset: () => {
      results.length = 0;
      calls.length = 0;
      Object.values(auth).forEach((fn) => fn.mockClear());
      client.from.mockClear();
      client.rpc.mockClear();
      for (const m of [...CHAIN_METHODS, ...TERMINAL_METHODS]) builder[m].mockClear();
    },
  };
}

/** مستخدم وهمي جاهز للاختبارات */
export const fakeUser = (overrides: Record<string, unknown> = {}) => ({
  id: 'user-123',
  email: 'test@faten.sa',
  ...overrides,
});
