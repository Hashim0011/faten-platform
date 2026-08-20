import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  // ═══════════════════════════════════════════════════════════
  //  ما يُتجاهل كلياً
  // ═══════════════════════════════════════════════════════════
  {
    ignores: [
      'dist',
      'coverage',
      'reports',
      'playwright-report',
      'test-results',
      '.scannerwork',
      'node_modules',
      '*.config.js',
      '*.config.ts',
    ],
  },

  // ═══════════════════════════════════════════════════════════
  //  كود التطبيق (src)
  // ═══════════════════════════════════════════════════════════
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettier],
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      // ─────────────────────────────────────────────────────
      //  دين تقني موروث — تحذيرات بسقف متناقص
      //  السقف الحالي: 177 (راجع سكربت lint في package.json)
      //  ⚠️  قاعدة الفريق: هذا الرقم يَنقص فقط، لا يزيد أبداً.
      //  الكود الجديد يجب ألّا يضيف أي تحذير.
      // ─────────────────────────────────────────────────────
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // ─────────────────────────────────────────────────────
      //  أخطاء صارمة — تُفشل البايب لاين فوراً
      // ─────────────────────────────────────────────────────
      'no-debugger': 'error',
      'no-alert': 'off', // التطبيق يستخدم alert() بكثرة حالياً — دين تقني معروف
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'smart'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // ═══════════════════════════════════════════════════════════
  //  ملفات الاختبارات — قواعد أرخى
  // ═══════════════════════════════════════════════════════════
  {
    // ملاحظة: لا بد من extends هنا أيضاً، وإلا لن يُستخدم محلّل TypeScript
    // وستفشل هذه الملفات بخطأ "Parsing error".
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettier],
    files: ['tests/**/*.{ts,tsx}', 'src/**/*.{test,spec}.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  }
);
