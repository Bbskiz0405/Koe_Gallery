// Shared mock data for KOE album site
// Color gradient generator for photo placeholders — gives each photo a unique look

// ── 上線鎖定設定 ────────────────────────────────────────────────
// 鎖住「前 LOCKED_PAGES 個拼貼頁」(cindex 0 … LOCKED_PAGES-1) 的照片與排版：
// 那幾頁的照片不能移動 / 旋轉 / 縮放 / 刪除，也不能上傳進去。貼紙不受影響。
// 平常請保持 LOCK_ENABLED=false（對網站完全沒影響）。上線當天要鎖時：
//   1. 把 LOCKED_PAGES 設成「目前已排好的拼貼頁總數」(看書頁右下 N / M 的頁數推算，
//      或直接設成現在最後一個有照片的拼貼頁序號 +1)。
//   2. 把 LOCK_ENABLED 改成 true。
//   3. (想讓來不及的人補圖) 進「排版」在書末按幾次「加一頁」，留出空白開放頁。
//   4. 同步把 firestore.rules 裡 lockedPages() 的回傳值改成同一個數字，再
//      firebase deploy --only firestore:rules,hosting。
//   只藏 UI 不改規則 → 懂 API 的人仍寫得進去；兩邊都改才算真的鎖死。
//   要解鎖：把 LOCK_ENABLED 改回 false（或 LOCKED_PAGES=0）+ 規則改回 0 並重新 deploy。
const LOCK_ENABLED = true;    // 上線當天改 true
const LOCKED_PAGES = 32;      // 鎖住的拼貼頁數量 (cindex < LOCKED_PAGES 視為鎖定)；頁碼 3–34 = cindex 0–31（末攤 35–36 留開放補圖）

// 某個拼貼頁 (0-based cindex) 是否被鎖定
function isPageLocked(cindex) {
  return LOCK_ENABLED && (cindex ?? 0) < LOCKED_PAGES;
}

const PALETTE_PAIRS = [
  ["#fbcfe8", "#e9d5ff"],   // pink → lavender
  ["#fde7d4", "#fbcfe8"],   // peach → pink
  ["#fef3c7", "#fbcfe8"],   // cream → pink
  ["#e9d5ff", "#bfdbfe"],   // lavender → sky
  ["#fbcfe8", "#fde7d4"],   // pink → peach
  ["#f5e6f5", "#fce7e7"],   // mauve → blush
  ["#dbeafe", "#f5d6e5"],   // sky → rose
  ["#fce4ec", "#ddd6fe"],   // sakura → lilac
  ["#fff0f5", "#fbcfe8"],   // misty → pink
  ["#ffe4f0", "#e0d5f5"],   // candy → violet
  ["#f9a8d4", "#c4b5fd"],   // bold pink → bold violet
  ["#fdcae6", "#a7d8ff"],   // pink → sky
];

const ALBUMS = [
  {
    id: "a01", title: "唯一星", titleEn: "Only One Star",
    tag: "debut", count: 24, cover: 0,
    desc: "初配信紀念冊。穿越夢之宇宙抵達藍星的那一晚，謝謝 ECHO 們等了我這麼久。",
    photoSeed: [0, 4, 7, 2, 9, 3, 5, 11, 1, 8, 6, 10],
  },
  {
    id: "a02", title: "blooming", titleEn: "綻放の章",
    tag: "live", count: 18, cover: 3,
    desc: "#KOE_blooming · 直播精選。把每一場 live 變成在你心中盛開的一朵雛菊。",
    photoSeed: [3, 5, 0, 8, 2, 7, 4, 11, 1, 9],
  },
  {
    id: "a03", title: "舞台裏", titleEn: "Backstage ∅",
    tag: "behind", count: 12, cover: 7,
    desc: "化妝鏡、手寫歌單、和工作人員的合照。把幕後的 KOE 一點一點地分給你。",
    photoSeed: [7, 4, 1, 10, 6, 2, 8, 0],
  },
  {
    id: "a04", title: "深夜スタジオ", titleEn: "Late Night Studio",
    tag: "music", count: 16, cover: 4,
    desc: "錄音室筆記。新單曲 demo 的塗鴉、咖啡杯印、凌晨四點的耳機。",
    photoSeed: [4, 11, 3, 0, 9, 5, 7, 2, 6],
  },
  {
    id: "a05", title: "宇宙の朝", titleEn: "Cosmic Morning",
    tag: "polaroid", count: 9, cover: 8,
    desc: "拍立得整理。清晨陽台、窗邊的玫瑰茶、貓咪小Mochi的打哈欠。",
    photoSeed: [8, 1, 5, 10, 3, 6, 9],
  },
  {
    id: "a06", title: "TO·KOE", titleEn: "From ECHO",
    tag: "fans", count: 32, cover: 10,
    desc: "#KOE_wakeup · 寫給 KOE 的話。歡迎 ECHO 們加上貼紙、留下訊息，下次直播會念出來！",
    photoSeed: [10, 2, 6, 11, 4, 0, 8, 5, 7, 1, 3, 9],
  },
];

// In a varied/masonry grid (6 cols), assign each photo a span pattern
// pattern formats: [colSpan, rowSpan] — designed to tile cleanly
const VARIED_PATTERNS = [
  [3, 4], [3, 3], [2, 3], [2, 4], [3, 3], [2, 3],
  [2, 4], [3, 3], [3, 4], [2, 3], [3, 3], [2, 4],
];

// Polaroid captions
const POLAROID_CAPS = [
  "あの夜 ✦", "stardust", "3:14am", "練習中", "新衣装♡",
  "tea time", "ねむい", "encore", "mochi", "moonlight",
  "studio", "歌姫の朝",
];

// Mock comments for lightbox (KOE's fans = "ECHO")
const MOCK_COMMENTS = [
  { name: "echo_yuki", color: "#f9a8d4", time: "2 分前", text: "這張光線好美！像在做夢一樣 ⟡.◦" },
  { name: "Mochi_03", color: "#d4b8f2", time: "12 分前", text: "KOE醬最近的造型也太可愛了吧！！白雛菊好適合 ✦" },
  { name: "宙太_ECHO", color: "#fde7d4", time: "1 時間前", text: "在第三張看到了那個我送的星星髮飾 嗚嗚🥹" },
  { name: "rina_∅", color: "#fbcfe8", time: "今日", text: "貼了一個小雛菊在右下角！#KOE_wakeup" },
];

// Make a CSS gradient string from a seed index
function gradientFor(seed) {
  const [a, b] = PALETTE_PAIRS[seed % PALETTE_PAIRS.length];
  return `linear-gradient(${135 + (seed * 23) % 90}deg, ${a} 0%, ${b} 100%)`;
}

// Format index as label e.g. "PH 01"
function photoLabel(seed) {
  return `PH ${String(seed + 1).padStart(2, "0")}`;
}

// Expose globals
Object.assign(window, {
  PALETTE_PAIRS, ALBUMS, VARIED_PATTERNS, POLAROID_CAPS, MOCK_COMMENTS,
  gradientFor, photoLabel,
});
