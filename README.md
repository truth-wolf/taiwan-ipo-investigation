# 📌 專案名稱：Taiwan IPO Investigation Report

😀 _揭露台灣證券業 IPO 與 ETF 募集制度黑幕的專案網站_

## 📝 專案概述

🧐 本專案公開調查並分析台灣證券業中「責任額制度」對營業員與投資人造成的負面影響，透過數據視覺化、事件時間軸與檢舉範本，讓使用者一目了然真相，並提供具體工具協助檢舉。專案旨在推動「#終結 IPO 制度暴力」的行動，促使監管改革。

## ✨ 核心功能亮點

- 💹 **數據揭露與視覺化**：互動表格與圖表呈現各券商 IPO/ETF 責任額分佈與時間走勢。
- 📜 **調查時間軸**：展示所有重要事件節點，並伴隨平滑淡入動畫。
- 📝 **檢舉信範本產生**：內建多種檢舉信格式，支援一鍵複製與下載。
- 🎁 **自我保護彩蛋**：隱藏檢舉人安全指南，點擊觸發後顯示保護建議。
- 🔗 **社群分享**：一鍵分享到 Threads、Instagram、Facebook，並支援複製頁面鏈結。

## 📂 檔案與資料夾結構

| 檔案／資料夾                 | 用途             | 核心邏輯或功能                                 |
| ---------------------------- | ---------------- | ---------------------------------------------- |
| `index.html`                 | 主頁面           | 定義網站結構、載入各區塊容器與必要腳本         |
| `partials/header.html`       | 頁首元件         | 導覽列與漢堡選單，不含主題切換按鈕             |
| `partials/footer.html`       | 頁尾元件         | 社群連結、回到頂端按鈕、檢舉彩蛋區             |
| `partials/data-section.html` | 責任額數據區     | 空表格範本與篩選下拉選單容器                   |
| `ipo_broker_product.csv`     | 責任額原始數據   | CSV 格式，包含券商、產品、責任額、期間         |
| `txt/`                       | 檢舉信範本資料夾 | 多封純文字檔範本，可一鍵載入與複製             |
| `css/*.css`                  | 全域與元件樣式   | 版面與動畫樣式，不含主題切換相關定義           |
| `app.js`                     | 核心互動邏輯     | 導覽列、進度條、分享按鈕、彩蛋觸發、滾動事件   |
| `templates.js`               | 檢舉範本模組     | 處理範本載入、複製與下載功能                   |
| `animations.js`              | 動畫效果模組     | 控制淡入、計數、條狀圖伸展等視覺效果           |
| `enhancedDataTable.js`       | 表格與圖表模組   | CSV 解析、DataTables 初始化、Chart.js 圖表展現 |
| `excel_to_csv.py`            | 資料轉換腳本     | 使用 Pandas 將 Excel 轉為 CSV，供前端載入使用  |
| `js/fix/*.js`                | 功能修復腳本     | 修復表格標頭固定與公式說明提示功能             |
| `shareModal.js`              | 分享功能模組     | 模態窗、社群分享功能                           |

## 📂 專案目錄結構圖

```bash
taiwan-ipo-investigation/
├── index.html                     # 主頁面
├── Dockerfile                     # Docker 部署設定
├── excel_to_csv.py                # Excel 轉 CSV 工具 (pandas)
├── ipo_broker_product.csv         # 主資料集（由 Excel 轉換而來）
├── README.md                      # 專案說明文件
├── LICENSE                        # MIT 授權條款
├── css/                           # 所有樣式相關檔案
│   ├── main.css                   # 全域樣式（含排版、配色）
│   ├── components.css             # 特定元件樣式（按鈕、時間軸）
│   ├── enhanced-styles.css        # 額外視覺動畫與印刷特效
│   └── updated/                   # 更新和修復的樣式
│       ├── data-table.css         # 表格樣式
│       ├── enhanced-table.css     # 表格增強功能
│       ├── fixes.css              # 修復樣式
│       ├── enhanced-fixes.css     # 額外修復樣式
│       ├── formula-tooltip.css    # 公式說明提示樣式
│       └── shareModal.css         # 分享模態窗樣式
├── js/                            # 前端邏輯模組
│   ├── app.js                     # 主互動腳本：導覽列、滾動偵測
│   ├── templates.js               # 範本處理模組：載入、複製、下載
│   ├── animations.js              # 滾動動畫與數字計數效果
│   ├── enhancedDataTable.js       # 表格初始化與 Chart.js 整合
│   ├── shareModal.js              # 分享功能模組：模態窗、社群分享
│   ├── automate.js (可選移除)     # 開發用：載入狀態偵測器（非必要）
│   └── fix/                       # 功能修復腳本
│       ├── formula-tooltip.js     # 公式說明提示功能
│       ├── sticky-table-header.js # 表格標頭固定功能
│       └── ...                    # 其他修復腳本
├── partials/                      # 頁面組件區塊（HTML include 模式）
│   ├── header.html                # 頁首與導覽列
│   ├── footer.html                # 頁尾與社群連結
│   └── data-section.html          # 數據表格與篩選區塊
├── txt/                           # 檢舉信純文字範本
│   ├── 1.txt
│   ├── 2.txt
│   └── ...（可自訂命名與數量）
├── docs/                          # 文檔與報告
│   ├── fix-report.md              # 功能修復報告
│   ├── share-feature.md           # 分享功能實現報告
│   └── CHANGELOG.md               # 更新日誌
└── share-feature.md          # 分享功能實現報告
```

## 🏗️ 技術堆疊

- **HTML5** + **CSS3** + **Tailwind CSS**
- **JavaScript (ES6+)**, **jQuery**, **DataTables**, **Chart.js**, **PapaParse**
- **Font Awesome 6**, **Intersection Observer API**, **LocalStorage API**
- **Python 3** + **Pandas** (資料預處理)

## 📋 最近更新 (2025 年 5 月 20 日)

- **全新分享功能**：
  - 添加精美動畫分享模態窗，支持分享至 Threads 和 LINE 社群
  - 導航欄新增互動式分享按鈕，使用脈衝動畫引導用戶
  - 優化首次訪問體驗，開場動畫後自動顯示分享選項
- **數據功能改進**：
  - 修正地獄月份計算邏輯，使用 Set 數據結構確保正確去重
  - 優化公式顯示機制，滑鼠懸浮時顯示詳細計算方法
- **文檔更新**：
  - 添加分享功能報告 (`docs/share-feature.md`)
  - 更新 CHANGELOG 與 README 文檔，記錄最新功能變更

## 🚀 快速開始

### 本地瀏覽

1. Clone 專案:

   ```bash
   git clone https://github.com/truth-wolf/taiwan-ipo-investigation.git
   cd taiwan-ipo-investigation
   ```

2. 啟動簡易 HTTP 伺服器:

   ```bash
   python3 -m http.server 8000
   ```

3. 瀏覽網站:
   打開 `http://localhost:8000` 即可

### Docker 部署

1. 建立 Dockerfile:

   ```dockerfile
   FROM nginx:alpine
   COPY . /usr/share/nginx/html
   ```

2. 構建映像:

   ```bash
   docker build -t taiwan-ipo-site .
   ```

3. 執行容器:

   ```bash
   docker run -d -p 8000:80 --name taiwan-ipo-site taiwan-ipo-site
   ```

4. 存取服務:
   打開 `http://localhost:8000`

## ⚙️ 環境變數

本專案為純靜態網站，不需任何環境變數即可運行。

## 📄 API 文件 / Swagger

此專案無後端 API，所有資料均以靜態 CSV 與文字檔呈現。

## 🔒 安全與最佳實踐

- **HTTPS 部署**: 強制使用 HTTPS，不使用 HTTP。
- **內容安全**: 無使用者輸入，不涉 XSS 或 CSRF。
- **依賴管理**: 定期更新 CDN 版本，確保函式庫安全。
- **隱私保護**: 不收集任何個人資料。

## 🤝 貢獻指南

1. 提出 Issue
2. Fork 專案
3. 建立分支並修改
4. 發送 Pull Request

## 🪪 授權條款

採用 **MIT License**，詳見 `LICENSE`。

## 📬 聯絡方式

- Issues: [https://github.com/truth-wolf/taiwan-ipo-investigation/issues](https://github.com/truth-wolf/taiwan-ipo-investigation/issues)
- 維護者: truth-wolf
