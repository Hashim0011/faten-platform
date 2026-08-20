import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';

// ─── محاكاة Supabase: لا نريد اتصال شبكة حقيقي في اختبارات الوحدة ───
const getUserMock = vi.fn();
vi.mock('../../src/lib/supabase', () => ({
  supabase: { auth: { getUser: () => getUserMock() } },
}));

const getUserSettingsMock = vi.fn();
const updateAppearanceSettingsMock = vi.fn();
vi.mock('../../src/lib/settings', () => ({
  getUserSettings: (...args: unknown[]) => getUserSettingsMock(...args),
  updateAppearanceSettings: (...args: unknown[]) => updateAppearanceSettingsMock(...args),
}));

import { useTheme } from '../../src/hooks/useTheme';

describe('useTheme — إدارة الوضع الليلي', () => {
  beforeEach(() => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    getUserSettingsMock.mockResolvedValue(null);
    updateAppearanceSettingsMock.mockResolvedValue({ success: true });
  });

  it('يبدأ بالوضع الفاتح افتراضياً', async () => {
    const { result } = renderHook(() => useTheme());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('يقرأ الوضع المحفوظ من localStorage', async () => {
    localStorage.setItem('theme', 'dark');
    const { result } = renderHook(() => useTheme());
    await waitFor(() => expect(result.current.theme).toBe('dark'));
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('يبدّل الوضع ويحفظه في localStorage', async () => {
    const { result } = renderHook(() => useTheme());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('يحفظ التفضيل في قاعدة البيانات عند وجود مستخدم مسجّل', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'user-123' } } });
    const { result } = renderHook(() => useTheme());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.setThemeMode('dark');
    });

    expect(updateAppearanceSettingsMock).toHaveBeenCalledWith('user-123', { theme: 'dark' });
  });

  it('لا ينهار عند فشل الاتصال بقاعدة البيانات (resilience)', async () => {
    getUserMock.mockRejectedValue(new Error('network down'));
    const { result } = renderHook(() => useTheme());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.theme).toBe('light');
  });
});
