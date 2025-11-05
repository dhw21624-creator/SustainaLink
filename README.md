# SustainaLink (HK PolyU WK Campus) – Prototype

Static web app prototype with bilingual UI (English / 中文), mock data, role-based pages, and charts.

## Deploy to GitHub Pages

最簡單做法（透過 GitHub Web 介面）：

1. 在 GitHub 建立新 Repository（例如 `sustainalink`）。
2. 上傳本資料夾所有檔案（`index.html`, `assets/`, `src/`, `.nojekyll`, `404.html`, `README.md`）。
3. 到 `Settings` → `Pages`：
   - Source 選擇：`Deploy from a branch`。
   - Branch 選擇：`main`，Folder 選擇：`/ (root)`。
4. 儲存後等待幾十秒，GitHub Pages 會產生公開連結：
   - `https://<你的GitHub帳號>.github.io/<repo名稱>/`

備註：
- `.nojekyll` 用來停用 Jekyll，確保 `src/` 之類目錄被原封不動提供。
- `404.html` 會把未知路徑導回 `index.html`，配合 hash routing（例如 `#/student`）。
- 所有資源連結採相對路徑，適用於子路徑部署（`/<repo>/`）。

## 本地開發

```bash
python3 -m http.server 8000
# 瀏覽器開啟 http://localhost:8000/
```

## 結構

- `index.html` – 主頁、header、語言切換、腳本載入
- `assets/styles.css` – 主題、排版、卡片、按鈕、Grid
- `src/i18n.js` – EN/中文字串、語言切換
- `src/data.js` – 模擬資料與分數儲存（localStorage）
- `src/app.js` – Hash 路由與各頁面（Login / Student / Quiz / Leaderboard / Staff / Admin / Energy）
- `.nojekyll` – 停用 Jekyll
- `404.html` – Pages 路徑回退到 `index.html`

## 自訂網域（可選）

在 GitHub Pages 設定中加入自訂網域（CNAME），將 DNS 指向 GitHub Pages，即可使用自訂 HTTPS 網址。

