# 更新日誌 (CHANGELOG)

本文件記錄「taiwan-ipo-investigation」專案的所有主要更改。

## [1.1.0] - 2025-05-16

### 功能修復
- 修復了公式說明功能，現在滑鼠滑過或點擊「i」按鈕時能正確顯示公式說明信息
- 實現了表格標頭固定功能，在頁面滾動時表格標頭保持在視圖頂部
- 增強了表格容器的滾動行為，提供更好的使用者體驗

### 新增內容
- 添加了專用的CSS文件：
  - `css/updated/formula-tooltip.css` - 公式說明提示樣式
  - `css/updated/enhanced-fixes.css` - 增強修復樣式
- 添加了專用的JavaScript文件：
  - `js/fix/formula-tooltip.js` - 公式說明功能
  - `js/fix/sticky-table-header.js` - 表格標頭固定功能
  - 其他修復輔助腳本
- 添加了功能修復報告：`docs/fix-report.md`

### 修改內容
- 更新了 `index.html`，添加了新的CSS與JavaScript引用
- 更新了 `partials/data-section.html`，優化了表格結構
- 更新了 `README.md`，包含最新的目錄結構和更新信息

### 代碼優化
- 改進了JavaScript事件處理，避免事件衝突
- 優化了CSS選擇器，提高渲染效率
- 增強了響應式設計，改善行動裝置上的使用體驗

## [1.0.0] - 2025-05-13

### 初始發布
- 設計並開發基本網站結構
- 實現了責任額數據表格與視覺化
- 添加了事件時間軸功能
- 實現了檢舉信範本生成與下載功能
- 添加了自我保護彩蛋功能
- 實現了社群分享功能
