# 心咲KOE 紀念冊 — 專案進度紀錄

> 這份文件記錄專案做了什麼、目前狀態、待辦事項。每次重大變更後更新。

## 專案概況
- **用途**：ECHO 們為 VSinger「心咲KOE」製作的線上紀念冊，粉絲可自由上傳 fanart、拼貼、貼貼紙。
- **技術**：純前端（React 18 + Babel standalone，無 build step）+ Firebase（Firestore + Storage + Hosting）。
- **Firebase 專案**：`koe-gallery-echo`
- **本機開發**：VS Code「Go Live」開 `index.html`；前端直接連線到真實的 Firestore/Storage。
- **檔案結構**：
  - `index.html` — 進入點，載入所有 jsx（用 `?v=N` 做快取破壞）
  - `styles.css` — 全站樣式
  - `app.jsx` — 主程式、狀態、Firestore 串接
  - `landing.jsx` — 封面（闔上的書）+ 開書動畫
  - `flipbook.jsx` — 翻頁書本 + 自由拼貼頁
  - `views.jsx` — BookView（工具列/版面）、Lightbox、上傳 Modal
  - `components.jsx` — 共用元件
  - `stickers.jsx` — 貼紙 SVG 與貼紙包
  - `data.jsx` — 假資料、漸層、工具函式
  - `tweaks-panel.jsx` — 開發用調整面板
  - `fonts/` — 自訂字體（花園明朝、OGNES、Paradise Signature）

## 字體
- 中文大標題：**花園明朝體**（HanaMin）`fonts/hanamin.ttf`
- 英文大標題：**OGNES** `fonts/ognes.otf`
- 英文裝飾字：**Paradise Signature** `fonts/paradise-signature.otf`
- 內文：Outfit / Noto Sans JP
- CSS 變數：`--font-zh` / `--font-en-display` / `--font-deco` / `--font-sans`

## 已完成的工作

### 字型與封面（2026-06）
- 套用三款自訂字體（中文檔名改 ASCII `hanamin.ttf` 解決載入問題）。
- 標題顏色由黑色漸層改為與內文同色 `--ink`。
- 封面精簡：刪除花朵裝飾、多餘英日文標語；保留分隔線 + 一行日文 tagline。
- 心咲（花園明朝）+ KOE（OGNES）堆疊式 logo 設計。
- 全部文字置中；底部「日期」「MADE BY ECHO · VOL.01」與頂部 stamp 同字體/大小/顏色。
- 內頁「from all ECHOs」改用內文字體。

### 貼圖小花淡色化
- 描邊黑框 `#1d1535` → 灰色 `#9389a8`
- 中心正黃 `#f7c948` → 鵝黃 `#fde68a`
- 影響 `WhiteDaisy`、`daisy-pink`、`Flower` 與內頁裝飾 `Daisy`。

### 介面清理
- 移除書頁上的佔位文字（`PH 01`、假日期、假日文標題、角落徽章）。
- 快速貼紙列貼紙溢出修正（等比縮放置中、`overflow:hidden`）。
- Lightbox 留言改為清空假留言、保留功能（沒留言時顯示提示）。

### 內頁改為自由拼貼相簿（重大改版）
- **清空內頁**：移除自動排版模板（photo-1/2/3/4、note、closing），改為「獻詞跨頁 + N 張空白拼貼頁」。
- **自由擺放**：按「排版」進入編輯，照片可拖曳/旋轉/縮放，角度自選不自動歪斜；超出頁面自動裁切。
- **共享儲存**：每張照片的 `page / x / y / rot / scale` 存 Firestore，所有人共用同一本、皆可編排。
- **上傳即落頁**：上傳的照片落在當前翻到的拼貼頁中央，再拖曳擺放。
- **加一頁**：工具列「＋ 加一頁」，頁數存於 Firestore `meta/memorial.pages`（共享）。
- **Lightbox 簡化**：只剩放大看圖 + 關閉，移除貼貼紙/留言分頁。
- **貼貼紙保留**：工具列選貼紙 → 點照片貼上，直接貼在內頁。

## 資料模型（Firestore）
- `photos/{id}`：`url, caption, page, x, y, rot, scale, uploadedAt`
- `stickers/{photoKey}`：`{ stickers: [...] }`（photoKey 為照片 doc id）
- `meta/memorial`：`{ pages: number }`（拼貼頁數，共享）
- `comments/{id}`：`text, name, color, photoId, createdAt`（功能保留，預設清空）

## 安全規則重點（firestore.rules）
- `photos`：開放讀/建立/更新/**刪除**（共享協作模式，任何人可編排與移除）。
- `meta`：開放讀寫（頁數）。
- 變更規則後需執行 `firebase deploy --only firestore:rules` 才生效。

## 部署
- 規則：`firebase deploy --only firestore:rules`
- 網站：`firebase deploy --only hosting`
- 全部：`firebase deploy`

## 待辦 / 已知事項
- 舊的測試照片若無 `page/x/y` 欄位，會疊在第 1 頁中央，可在「排版」模式拖開或刪除。
- 拼貼照片超出頁面是用 `overflow:hidden` 裁切（非精準邊界夾制），必要時縮小即可。
- 共享編輯下，任何人都能移動/刪除他人擺放的照片（依需求設計，未做權限）。
- 行動版可檢視拼貼頁，編輯體驗以桌機為主。

---
_最後更新：2026-06-18_
