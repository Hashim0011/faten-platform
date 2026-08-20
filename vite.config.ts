/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // import.meta.env غير متاح داخل ملف الإعداد، لذا نقرأ البيئة يدوياً
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],

    optimizeDeps: {
      exclude: ['lucide-react'],
    },

    build: {
      // ① خرائط المصدر: يحتاجها SonarQube وتتبّع أخطاء الإنتاج
      sourcemap: true,
      // ② سقف تحذير حجم الحزمة (كان يتجاوز 500kB)
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          // ③ فصل المكتبات الكبيرة → تخزين مؤقت أفضل للمتصفح
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-supabase': ['@supabase/supabase-js'],
            'vendor-icons': ['lucide-react'],
          },
        },
      },
    },

    server: {
      proxy: {
        // ④ عنوان n8n خرج من الكود إلى متغيرات البيئة (Externalized Config)
        '/api/webhook': {
          target: env.VITE_N8N_PROXY_TARGET || 'http://localhost:5678',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/webhook/, env.VITE_N8N_PROXY_PATH || '/webhook'),
          secure: true,
        },
      },
    },

    // ═══════════════════════════════════════════════════════
    //  إعداد Vitest — محرك الاختبارات
    // ═══════════════════════════════════════════════════════
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
      css: false,
      include: ['tests/unit/**/*.{test,spec}.{ts,tsx}', 'src/**/*.{test,spec}.{ts,tsx}'],
      exclude: ['node_modules', 'dist', 'tests/e2e/**'],

      // تقارير: نص للمطوّر + JUnit XML للـ CI (نفس صيغة JUnit المعيارية)
      reporters: process.env.CI ? ['default', 'junit', 'vitest-sonar-reporter'] : ['default'],
      outputFile: {
        junit: './reports/junit.xml',
        'vitest-sonar-reporter': './reports/sonar-tests.xml',
      },

      coverage: {
        provider: 'v8',
        reporter: ['text', 'text-summary', 'lcov', 'json-summary', 'cobertura'],
        reportsDirectory: './coverage',
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/main.tsx',
          'src/vite-env.d.ts',
          'src/**/*.d.ts',
          'src/**/*.{test,spec}.{ts,tsx}',
        ],
        // ─────────────────────────────────────────────────
        //  عتبات التغطية — تبدأ منخفضة وتُرفع تدريجياً
        //  ⚠️  قاعدة الفريق: هذه الأرقام تزيد فقط، لا تنقص
        // ─────────────────────────────────────────────────
        // ─────────────────────────────────────────────────
        //  عتبات التغطية — استراتيجية «صارم حيث يهم»
        //
        //  ملاحقة رقم إجمالي في مشروع فيه 3600 سطر واجهات قديمة
        //  بلا اختبارات = مطاردة سراب: الرقم يبقى منخفضاً مهما
        //  اختبرنا من المنطق. الحل المعتمد في الفرق الناضجة:
        //  عتبة عامة متواضعة + عتبات صارمة على الملفات المغطّاة،
        //  ويُضاف كل ملف جديد إلى القائمة عند تغطيته.
        //
        //  ⚠️ كل هذه الأرقام تَرتفع فقط، لا تنخفض أبداً.
        // ─────────────────────────────────────────────────
        thresholds: {
          // الحد العام
          statements: 6,
          branches: 75,
          functions: 55,
          lines: 6,

          // منطق الأعمال المغطّى — عتبات صارمة لكل ملف
          'src/lib/bans.ts': {
            statements: 95,
            branches: 95,
            functions: 95,
            lines: 95,
          },
          'src/lib/likes.ts': {
            statements: 95,
            branches: 90,
            functions: 95,
            lines: 95,
          },
          'src/lib/content.ts': {
            statements: 95,
            branches: 85,
            functions: 95,
            lines: 95,
          },
          'src/lib/auth.ts': {
            statements: 60,
            branches: 80,
            functions: 70,
            lines: 60,
          },
        },
      },
    },
  };
});
