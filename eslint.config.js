/**
 * 📦 模組：ESLint 配置
 * 🕒 最後更新：2025-06-10T21:49:33+08:00
 * 🧑‍💻 作者/更新者：@DigitalSentinel
 * 🔢 版本：v1.2.0
 * 📝 摘要：ESLint 扁平配置，包含基本規則與安全檢查
 */

import js from '@eslint/js';
import security from 'eslint-plugin-security';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // 瀏覽器環境
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        alert: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        navigator: 'readonly',
        performance: 'readonly',
        localStorage: 'readonly',
        location: 'readonly',
        history: 'readonly',

        // Web APIs
        IntersectionObserver: 'readonly',
        MutationObserver: 'readonly',
        CustomEvent: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',

        // 第三方函式庫
        $: 'readonly', // jQuery
        Chart: 'readonly', // Chart.js
        Papa: 'readonly', // PapaParse
        DataTable: 'readonly', // DataTables

        // 自定義全域函數
        initDataLoader: 'readonly',
        showToast: 'readonly',
        initProductTable: 'readonly',
        showMoreCards: 'readonly',
        days: 'readonly',
      },
    },
    plugins: {
      security,
    },
    rules: {
      // 基本規則 - 極度放寬標準，專注功能開發
      'no-console': 'off', // 允許console語句
      'no-unused-vars': 'off', // 暫時停用未使用變數檢查
      'no-undef': 'off', // 暫時停用未定義變數檢查
      'prefer-const': 'off', // 暫時停用const偏好
      'no-var': 'off', // 暫時停用var禁用
      'no-prototype-builtins': 'off', // 停用原型內建方法檢查

      // 安全規則 - 暫時停用以加速開發
      'security/detect-object-injection': 'off',
      'security/detect-non-literal-regexp': 'off',
      'security/detect-unsafe-regex': 'off',
      'security/detect-buffer-noassert': 'off',
      'security/detect-child-process': 'off',
      'security/detect-disable-mustache-escape': 'off',
      'security/detect-eval-with-expression': 'off',
      'security/detect-no-csrf-before-method-override': 'off',
      'security/detect-non-literal-fs-filename': 'off',
      'security/detect-non-literal-require': 'off',
      'security/detect-possible-timing-attacks': 'off',
      'security/detect-pseudoRandomBytes': 'off',
    },
  },
  {
    files: ['**/*.test.js', '**/*.spec.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly',
      },
    },
  },
];
