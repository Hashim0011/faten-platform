import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// ─── محاكاة useNavigate للتحقق من مسارات التنقّل ───
const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

import RoleSelection from '../../src/pages/RoleSelection';

const renderPage = () =>
  render(
    <MemoryRouter>
      <RoleSelection />
    </MemoryRouter>
  );

describe('RoleSelection — صفحة اختيار الدور', () => {
  it('يعرض الأدوار الثلاثة', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'مستخدم' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'خبير' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'مدير' })).toBeInTheDocument();
  });

  it('يعرض اسم المنصة', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'فطن' })).toBeInTheDocument();
  });

  it.each([
    ['مستخدم', '/register'],
    ['خبير', '/expert-login'],
    ['مدير', '/admin-login'],
  ])('الضغط على "%s" ينقل إلى %s', async (role, expectedPath) => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('heading', { name: role }));

    expect(navigateMock).toHaveBeenCalledWith(expectedPath);
  });

  it('رابط "تسجيل الدخول" ينقل إلى صفحة الدخول', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'تسجيل الدخول' }));

    expect(navigateMock).toHaveBeenCalledWith('/login');
  });
});
