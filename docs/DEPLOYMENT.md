# 🚀 GitHub Pages 部署指南

本指南說明如何將 Taiwan IPO Investigation 專案部署至 GitHub Pages。

## 📋 前置要求

- GitHub 帳號與 Repository
- 專案為純前端架構 (HTML/CSS/JavaScript)
- 所有資料檔案為靜態 CSV

## 🔄 自動化部署 (推薦)

### 1. 啟用 GitHub Pages

1. 進入您的 GitHub Repository
2. 點選 **Settings** → **Pages**
3. 在 **Source** 選擇 **GitHub Actions**

### 2. 推送程式碼觸發部署

```bash
git add .
git commit -m "feat: 啟用 GitHub Pages 自動部署"
git push origin main
```

### 3. 檢查部署狀態

- 進入 **Actions** 頁面查看 CI/CD 流程
- 部署完成後，網站將可在 `https://your-username.github.io/taiwan-ipo-investigation` 存取

## 🛠️ 手動部署

如果需要手動建置並部署：

### 1. 本地建置

```bash
# 安裝依賴
npm install

# 建置靜態檔案
npm run build:static

# 預覽建置結果
npm run pages:preview
```

### 2. 手動上傳

```bash
# 切換到 gh-pages 分支
git checkout -b gh-pages

# 複製建置檔案到根目錄
cp -r build/* .

# 提交並推送
git add .
git commit -m "deploy: 更新 GitHub Pages"
git push origin gh-pages
```

## 📁 部署檔案結構

```
build/
├── index.html              # 主頁面
├── css/                    # 樣式檔案
├── js/                     # JavaScript 檔案
├── partials/               # HTML 組件
├── txt/                    # 檢舉信範本
├── *.csv                   # 資料檔案
├── _config.yml             # Jekyll 設定
└── .nojekyll              # 停用 Jekyll 處理
```

## 🎯 部署最佳化

### 1. 效能優化

- 所有靜態資源使用相對路徑
- CSS/JS 檔案已最小化
- 圖片格式最佳化

### 2. SEO 友善

- 適當的 meta 標籤
- 結構化資料 (JSON-LD)
- 語意化 HTML 標籤

### 3. 安全設定

- CSP (內容安全政策) 標頭
- HTTPS 強制重導向
- 無敏感資訊外洩

## 🔍 常見問題

### Q: 為什麼我的 CSS/JS 檔案載入失敗？
A: 確保所有路徑都是相對路徑，避免使用 `/css/` 而使用 `css/`

### Q: GitHub Pages 顯示 404 錯誤？
A: 檢查 Repository 設定中的 Pages 來源是否正確設為 GitHub Actions

### Q: 如何自訂網域？
A: 在 Repository Settings → Pages → Custom domain 加入您的網域，並設定 DNS CNAME 記錄

### Q: Python 腳本會在 GitHub Pages 上執行嗎？
A: 不會。GitHub Pages 只提供靜態檔案服務，Python 腳本僅用於本地資料預處理

## 📊 監控與維護

### 自動化監控

- GitHub Actions 會在每次推送時執行品質檢查
- Lighthouse CI 監控網站效能
- 測試覆蓋率自動報告

### 手動檢查

```bash
# 本地效能測試
npm run lighthouse:local

# 連結檢查
npm run check:links

# 可存取性檢查
npm run a11y:check
```

## 🎉 部署完成

部署成功後，您的網站將可在以下位置存取：
- **主要網址**: `https://your-username.github.io/taiwan-ipo-investigation`
- **自訂網域**: `https://your-domain.com` (如已設定)

---

💡 **提示**: 每次推送到 `main` 分支都會自動觸發重新部署，確保網站始終是最新版本。 