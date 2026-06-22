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
- 中文大標題（心咲）：**花園明朝體**（HanaMin）`fonts/hanamin.ttf` → `--font-zh`
- **KØE 標準字**：**DM Serif Display**（高對比襯線/Didone），中間 O 用字母 **Ø**（U+00D8，非數學 ∅）→ `--font-display`
- 拍立得標題 / 手寫感：**Klee One**（日系手寫鋼筆體，支援中日文）→ `--font-hand`
- 內文：Outfit / Noto Sans JP → `--font-sans` / `--font-jp`
- 其他載入但目前未主要使用：OGNES `fonts/ognes.otf`、Paradise Signature `fonts/paradise-signature.otf`、Pinyon Script
- 字體色：主文字 `--ink` = **`#61537B`**（品牌紫）、強調 `--pink-deep` = **`#DB77A8`**；深色按鈕背景保留 `--ink-deep` = `#1d1535`

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

### 封面 logo / 配色 / 手機版（2026-06-19~20）
- **封面 logo 改 KØE 襯線標準字**：KOE 統一為 DM Serif Display 高對比襯線、粉色，中間 O 改用字母 **Ø**（依官方「襯線/宋體為基底、O 用斜線字元」）；字距收緊成一體，往上疊壓進「心咲」下緣；「咲」右上加 ✦ 星芒。頁首（landing/book-view-top）的「心咲KØE」同步：心咲明朝 + KØE 襯線。
- **文字配色統一**：主文字由近黑 `#1d1535` → 品牌紫 `#61537B`；強調維持 `#DB77A8`；新增 `--ink-deep` 保留深色按鈕背景（只動文字色）。
- **手機版單頁翻閱**：`flipbook.jsx` 的 `MobileFlipBook` 一次顯示單一頁（next/prev 一次一頁、點空白前進），修正封面裁切與置中。
- **手機 landing 封面放大**：3D 書台 340×224 → 410×270、減少左偏移，翻開前後尺寸落差變小。

### 標題流程 / 版面 / 貼紙（2026-06-19~20，依主辦回饋）
- **上傳「標題」**：上傳 Modal 的「說明」欄改為單行「標題」（存於 `photos.caption`，上限 40 字）。
- **拍立得顯示標題**：拍立得照片下方改為顯示該照片上傳時填的標題（`--font-hand` 手寫體），不再是本機假字。
- **移除「拼貼」版面**：版面切換只剩「翻頁」+「拍立得」。
- **自由文字貼紙**：「文字」貼紙包新增「＋自由輸入」，貼上時跳輸入框打字（`TextSticker`，`custom:true` + `text`）。
- **貼紙改貼在「相簿頁面」**：新增頁面貼紙層 `StickerBoard`（`components.jsx`）。選貼紙後點頁面任意處貼上（不再綁定照片）；書頁每頁 key=`album::pageN`、拍立得 key=`album::polaroid`。排版模式可拖曳/旋轉/縮放/刪除（`PlacedSticker` 加 `editing`/`onCommit`）。
- **貼紙可刪除**：放大照片(Lightbox)後點貼紙右上 ✕ 移除舊的照片貼紙；頁面貼紙在排版模式直接刪。

### 文字貼紙跑版修復（2026-06-22）
- **標籤貼紙字疊邊框**：`TagSticker`（BEST DAY / KAWAII / ENCORE 等）改用 SVG `textLength` + `lengthAdjust="spacingAndGlyphs"` 強制把字塞進框內，並修正置中座標；深色標籤（bg `#1d1535`）改白字 + 金點。
- **「＋自由輸入」picker 爆框**：選單格 `.qbar-sticker` 為 44×44 + `overflow:hidden`，原本渲染 `TextSticker`（div、maxWidth 200）被裁切。改為內在 40×40 的 SVG 預覽（`＋字`，viewBox 80 縮放保清晰），必定塞進框內。
- **快取破壞**：`index.html` 全部 `?v=21` → `?v=22`。

### 上傳修復 / 安全（2026-06-19~20）
- **移除 12MB 上傳上限**：`storage.rules` 拿掉大小限制（保留「必須為圖片」），大檔可上傳。
- **修正「假成功」**：上傳結果改為真實回報成功/失敗張數並列出失敗原因，不再一律顯示「上傳完成」。
- **修正排版選取被取消**：編輯模式點照片後 ✕/↻ 控制鈕會留住（click 不再冒泡到頁面背景取消選取）。

### 上傳落頁可選左/右頁 + 卡邊刪不掉修復（2026-06-20）
- **可選擇上傳到左頁或右頁**（依主辦回饋「只能傳左頁」）：
  - `flipbook.jsx` `reportPage` 改為回報目前攤開的**左右兩頁**（`{ pages:[{cindex,side,num}], primary }`），不再只挑左頁；手機版單頁同步回報當前頁。
  - `app.jsx` 用 `pageOptions` 取代 `currentCollagePage`，傳給 `UploadModal`。
  - `views.jsx` `UploadModal` 第 2 步新增「放到哪一頁」選擇鈕（左頁 P.x / 右頁 P.y），預設左頁。
  - 手機：單頁顯示，翻到想放的頁再上傳即落在該頁。
- **修「照片卡到邊、放大後拖不動也刪不掉」**：
  - `flipbook.jsx` `clamp` 由「鎖整張邊界」改為「只鎖照片**中心** 5%–95%」，放大/拖到邊也永遠抓得到、拖得動（超出部分照舊裁切）。
  - `views.jsx` 工具列新增「**✕ 刪除這張**」按鈕（排版模式選到照片才出現，含確認框）。不依賴角落 ✕（會被頁面 `overflow:hidden` 裁掉），桌機/手機皆可刪。

### 手機封面重做 + 工具列收合 + 鎖定開關（2026-06-21，依主辦回饋）
- **手機拿掉翻書動畫**：`landing.jsx` 新增 `isMobile()`（`max-width:760px`）。手機點封面不再播翻書，直接用既有的 cross-fade 交接到 BookView；合上也跳過反向翻書、直接淡回封面。**電腦版動畫完全不變**。
- **手機封面放大置中**：因不再需要遷就攤開雙頁寬度，`styles.css` 手機 3D 書台 410×270 → **560×400**（封面面 205→280 寬），`translateX -52 → -140px`（＝寬度¼，數學上正中央），解決「封面偏右、太小、上方一大片空白、與內頁落差大」。封面字級/書籤/書脊裝飾同步放大。
- **手機工具列收成一顆按鈕**：`views.jsx` 把編輯工具包進 `.tools-group`，手機只顯示 `[翻頁/拍立得]` + 一顆「工具」鈕（`.tools-toggle`），點了才展開「貼紙/排版/加一頁/加照片」抽屜。電腦版「工具」鈕隱藏、工具照舊整排平鋪（不變）。
- **新增公開鎖定開關**：`views.jsx` 頂部 `EDIT_ENABLED` / `STICKERS_ENABLED`（預設 `true`）。公開要藏編輯就把 `EDIT_ENABLED=false`（貼紙可留），改完 deploy 即可；只藏 UI、不動 Firebase 資料、改回 true 按鈕就回來。取代原本「公開日改規則」的計畫（主辦決定先用藏按鈕，甚至可能不關）。

## 資料模型（Firestore / Storage）
- `photos/{id}`：`url, caption(=標題), page, x, y, rot, scale, uploadedAt`
- `stickers/{key}`：`{ stickers: [...] }`。key 有三種：照片貼紙=照片 doc id；頁面貼紙=`album::pageN`（書頁）/`album::polaroid`（拍立得）。
- `meta/memorial`：`{ pages: number }`（拼貼頁數，共享）
- `comments/{id}`：`text, name, color, photoId, createdAt`（功能保留，預設清空）
- Storage：照片檔放 `photos/`（公開讀）

## 安全規則重點
- `firestore.rules` — `photos`：開放讀/建立/更新/**刪除**（共享協作，任何人可編排與移除）；`stickers`/`meta`/`comments` 開放讀寫（comments 不可改/刪）。
- `storage.rules` — `photos/`：開放讀 + 寫（**僅限圖片、已移除 12MB 大小上限**），不可刪檔。
- 變更規則後需執行 `firebase deploy --only firestore:rules` / `--only storage` 才生效。

## 部署
- 規則：`firebase deploy --only firestore:rules`
- 網站：`firebase deploy --only hosting`
- 全部：`firebase deploy`

## 待辦 / 已知事項
- **公開日鎖定（計畫已調整 2026-06-21）**：主辦決定「之後再說、甚至可能不關」。要藏編輯時把 `views.jsx` 的 `EDIT_ENABLED` 改 `false`（貼紙留則 `STICKERS_ENABLED` 維持 true）即可——但這只藏 UI，API 仍可寫入。若公開當天想真正鎖死，再把 `firestore.rules`/`storage.rules` 的 `create/update/delete` 改 `if false`（只留 `read`）並部署。
- 移除 12MB 上限後，理論上有人能上傳超大圖灌爆流量（網站無登入），可視情況改高上限或加自動壓縮。
- 舊的測試照片若無 `page/x/y` 欄位，會疊在第 1 頁中央，可在「排版」模式拖開或刪除。
- 共享編輯下，任何人都能移動/刪除他人擺放的照片與貼紙（依需求設計，未做權限）。
- 互動功能（上傳標題、文字貼紙、頁面貼紙、刪貼紙）已上線，建議實機點過一輪驗收。

---
_最後更新：2026-06-21（手機封面重做：拿掉翻書動畫+放大置中、工具列收合、公開鎖定開關；併入文字貼紙跑版修復）_
