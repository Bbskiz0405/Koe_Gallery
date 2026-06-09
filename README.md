# 心咲KOE — 紀念冊 · ECHO COLLECTION

> *心の花を咲かせる声 · A voice that blooms flowers in your heart.*

**https://koe-gallery-echo.web.app**

ECHO 們為心咲KOE（2022.12.18 — 2026.03.11）製作的互動式紀念冊。  
翻開書頁、上傳回憶、貼上雛菊、留下悄悄話。

---

## 功能

- **翻頁書** — 仿實體紀念冊的翻頁動畫與封面設計
- **上傳照片** — 任何 ECHO 都能上傳回憶照片（儲存於 Firebase Storage）
- **貼紙系統** — 在照片上放置貼紙，支援 KOE / 宇宙 / 少女 / 文字四種貼紙包
- **三種排版** — 翻頁 / 拼貼 / Polaroid 隨時切換
- **留言** — 為每張照片留下留言
- **星空背景** — 可開關的宇宙氛圍背景

## 技術架構

| 層級 | 技術 |
|------|------|
| 前端 | React 18 + Babel Standalone（無 build 步驟） |
| 資料庫 | Firebase Firestore |
| 檔案儲存 | Firebase Storage |
| 部署 | Firebase Hosting |
| 字型 | Google Fonts（DM Serif Display / Outfit / Noto Sans JP） |

## 本地開發

不需要安裝任何依賴，直接用 Firebase CLI 啟動本地伺服器：

```bash
firebase serve
```

開啟 `http://localhost:5000` 即可預覽。

## 部署

```bash
firebase deploy
```

## Firebase 規則

- **Firestore** — 任何人可讀寫，照片與留言不可刪除，留言限 500 字
- **Storage** — 僅限圖片格式，單檔上限 12 MB，不可刪除

---

*made with love by ECHOs · vol. 01*
