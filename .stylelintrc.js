/**
 * 📦 模組：Stylelint CSS 代碼檢查配置
 * 🕒 最後更新：2025-01-26T14:30:00+08:00
 * 🧑‍💻 作者/更新者：@DigitalSentinel
 * 🔢 版本：v1.2.0
 * 📝 摘要：CSS 代碼檢查配置 - 使用最寬鬆標準專注功能開發
 */

export default {
  extends: ['stylelint-config-standard'],

  rules: {
    // 停用大部分規則以專注功能開發
    'declaration-empty-line-before': null,
    'rule-empty-line-before': null,
    'comment-empty-line-before': null,
    'no-empty-source': null,
    'selector-class-pattern': null,
    'custom-property-pattern': null,
    'keyframes-name-pattern': null,
    'font-family-name-quotes': null,
    'function-url-quotes': null,
    'string-quotes': null,
    'color-function-notation': null,
    'alpha-value-notation': null,
    'value-keyword-case': null,
    'property-no-vendor-prefix': null,
    'value-no-vendor-prefix': null,
    'selector-no-vendor-prefix': null,
    'media-feature-name-no-vendor-prefix': null,
    'at-rule-no-vendor-prefix': null,
    'no-descending-specificity': null,
    'declaration-block-no-redundant-longhand-properties': null,
    'shorthand-property-no-redundant-values': null,
    'color-hex-length': null,
    'length-zero-no-unit': null,
    'font-weight-notation': null,
    'import-notation': null,
    'selector-not-notation': null,
    'media-feature-range-notation': null,
    'hue-degree-notation': null,
    'no-duplicate-selectors': null,
  },

  ignoreFiles: [
    'node_modules/**/*',
    'coverage/**/*',
    'build/**/*',
    'dist/**/*',
  ],
};
