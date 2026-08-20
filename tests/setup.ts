import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

// ─── تنظيف DOM بعد كل اختبار (يمنع تسرّب الحالة بين الاختبارات) ───
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorage.clear();
  document.documentElement.className = '';
});

// ─── محاكاة matchMedia (غير موجودة في jsdom) ───
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // ─── كتم console.error المتوقع في اختبارات المسارات الفاشلة ───
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
