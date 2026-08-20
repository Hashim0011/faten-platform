import { describe, expect, it } from 'vitest';
import { act, render, renderHook, screen } from '@testing-library/react';
import { ToastProvider, useToast } from '../../src/contexts/ToastContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

describe('ToastContext — نظام التنبيهات', () => {
  it('يرمي خطأً واضحاً عند استخدامه خارج المزوّد', () => {
    expect(() => renderHook(() => useToast())).toThrow(/must be used within ToastProvider/);
  });

  it('يعرض رسالة نجاح على الشاشة', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.showSuccess('تم الحفظ بنجاح');
    });

    expect(screen.getByText('تم الحفظ بنجاح')).toBeInTheDocument();
  });

  it('يعرض عدة تنبيهات في نفس الوقت', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.showError('خطأ أول');
      result.current.showWarning('تحذير ثانٍ');
      result.current.showInfo('معلومة ثالثة');
    });

    expect(screen.getByText('خطأ أول')).toBeInTheDocument();
    expect(screen.getByText('تحذير ثانٍ')).toBeInTheDocument();
    expect(screen.getByText('معلومة ثالثة')).toBeInTheDocument();
  });

  it('يعرض أبناءه بشكل طبيعي', () => {
    render(
      <ToastProvider>
        <p>محتوى التطبيق</p>
      </ToastProvider>
    );
    expect(screen.getByText('محتوى التطبيق')).toBeInTheDocument();
  });
});
