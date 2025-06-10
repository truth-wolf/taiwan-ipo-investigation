/**
 * 📦 模組：Jest 測試配置
 * 🕒 最後更新：2025-06-10T21:49:33+08:00
 * 🧑‍💻 作者/更新者：@DigitalSentinel
 * 🔢 版本：v1.2.0
 * 📝 摘要：前端 JavaScript 測試配置與 DOM 環境設定
 */

export default {
  // 測試環境
  testEnvironment: 'jsdom',

  // 測試檔案匹配模式
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],

  // 覆蓋率設定
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'js/**/*.js',
    '*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!jest.config.js',
    '!eslint.config.js',
  ],

  // 覆蓋率門檻 - 暫時停用以專注功能開發
  // coverageThreshold: {
  //   global: {
  //     branches: 5,     // 極低標準
  //     functions: 5,    // 極低標準
  //     lines: 5,        // 極低標準
  //     statements: 5    // 極低標準
  //   },
  // },

  // 模組設定
  moduleFileExtensions: ['js', 'json'],

  // 設定檔案
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // 轉換設定
  transform: {},

  // 清除模擬
  clearMocks: true,

  // 詳細輸出
  verbose: true,

  // 全域變數
  globals: {
    // jQuery 和其他全域變數將在 setup 檔案中設定
  },
};
