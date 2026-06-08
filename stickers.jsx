// Sticker SVGs for KOE — three packs: Cosmic / Girly / Words
// Each sticker exports a function (size) => SVG element

const StarTwinkle = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <path d="M20 4 L22.5 17.5 L36 20 L22.5 22.5 L20 36 L17.5 22.5 L4 20 L17.5 17.5 Z"
      fill="#fef3c7" stroke="#1a1226" strokeWidth="1.2" strokeLinejoin="round" />
    <circle cx="20" cy="20" r="2" fill="#1a1226" />
  </svg>
);

const Sparkle = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <path d="M18 2 L20 16 L34 18 L20 20 L18 34 L16 20 L2 18 L16 16 Z"
      fill="#fbcfe8" stroke="#db77a8" strokeWidth="1" />
  </svg>
);

const Moon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M32 6 A 18 18 0 1 0 32 42 A 14 14 0 1 1 32 6 Z"
      fill="#fef3c7" stroke="#1a1226" strokeWidth="1.4" strokeLinejoin="round" />
    <circle cx="22" cy="18" r="1.5" fill="#1a1226" opacity="0.4" />
    <circle cx="18" cy="28" r="1" fill="#1a1226" opacity="0.4" />
  </svg>
);

const Planet = ({ size = 52 }) => (
  <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
    <ellipse cx="26" cy="26" rx="24" ry="6" transform="rotate(-18 26 26)"
      fill="none" stroke="#1a1226" strokeWidth="1.4" />
    <circle cx="26" cy="26" r="13" fill="#f9a8d4" stroke="#1a1226" strokeWidth="1.4" />
    <path d="M16 24 Q 22 22, 28 25 T 38 27" fill="none" stroke="#db77a8" strokeWidth="1.4" opacity="0.6" />
  </svg>
);

const Comet = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
    <path d="M48 12 L 16 44" stroke="#fef3c7" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
    <path d="M48 12 L 22 38" stroke="#fbcfe8" strokeWidth="3" strokeLinecap="round" />
    <circle cx="46" cy="14" r="6" fill="#fef3c7" stroke="#1a1226" strokeWidth="1.4" />
  </svg>
);

const CosmicDust = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
    <circle cx="10" cy="12" r="2" fill="#db77a8" />
    <circle cx="22" cy="6" r="1.5" fill="#1a1226" />
    <circle cx="34" cy="14" r="2.5" fill="#fbcfe8" stroke="#db77a8" strokeWidth="0.8" />
    <circle cx="14" cy="28" r="1" fill="#1a1226" />
    <circle cx="28" cy="32" r="2" fill="#c4b5fd" />
    <circle cx="38" cy="38" r="1.5" fill="#1a1226" />
    <circle cx="6" cy="38" r="1.5" fill="#db77a8" />
  </svg>
);

// ── Girly pack ──
const Heart = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <path d="M20 35 C 4 24, 4 8, 14 8 C 18 8, 20 12, 20 14 C 20 12, 22 8, 26 8 C 36 8, 36 24, 20 35 Z"
      fill="#f9a8d4" stroke="#1a1226" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M14 14 Q 16 12, 18 14" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.7" />
  </svg>
);

const Ribbon = ({ size = 52 }) => (
  <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
    <path d="M26 22 L 10 14 L 14 26 L 10 38 L 26 30 L 42 38 L 38 26 L 42 14 Z"
      fill="#fbcfe8" stroke="#1a1226" strokeWidth="1.4" strokeLinejoin="round" />
    <rect x="22" y="20" width="8" height="12" fill="#f9a8d4" stroke="#1a1226" strokeWidth="1.4" />
  </svg>
);

const Flower = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
    {[0, 72, 144, 216, 288].map((rot, i) => (
      <ellipse key={i} cx="22" cy="11" rx="6" ry="9" fill="#fbcfe8" stroke="#1a1226" strokeWidth="1.2"
        transform={`rotate(${rot} 22 22)`} />
    ))}
    <circle cx="22" cy="22" r="4.5" fill="#fef3c7" stroke="#1a1226" strokeWidth="1.2" />
  </svg>
);

const Bow = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <ellipse cx="14" cy="24" rx="10" ry="8" fill="#f9a8d4" stroke="#1a1226" strokeWidth="1.4" />
    <ellipse cx="34" cy="24" rx="10" ry="8" fill="#f9a8d4" stroke="#1a1226" strokeWidth="1.4" />
    <rect x="20" y="18" width="8" height="12" fill="#db77a8" stroke="#1a1226" strokeWidth="1.4" />
  </svg>
);

const Cherry = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
    <path d="M22 6 Q 30 16, 30 24" stroke="#1a1226" strokeWidth="1.4" fill="none" />
    <path d="M22 6 Q 14 16, 14 24" stroke="#1a1226" strokeWidth="1.4" fill="none" />
    <ellipse cx="22" cy="8" rx="4" ry="3" fill="#9ed99b" stroke="#1a1226" strokeWidth="1.2" />
    <circle cx="14" cy="30" r="7" fill="#f9a8d4" stroke="#1a1226" strokeWidth="1.4" />
    <circle cx="30" cy="30" r="7" fill="#f9a8d4" stroke="#1a1226" strokeWidth="1.4" />
    <circle cx="12" cy="28" r="1.5" fill="#fff" opacity="0.7" />
    <circle cx="28" cy="28" r="1.5" fill="#fff" opacity="0.7" />
  </svg>
);

const Lolli = ({ size = 50 }) => (
  <svg width={size} height={size} viewBox="0 0 50 50" fill="none">
    <line x1="25" y1="26" x2="25" y2="46" stroke="#1a1226" strokeWidth="1.6" />
    <circle cx="25" cy="18" r="14" fill="#fef3c7" stroke="#1a1226" strokeWidth="1.4" />
    <path d="M25 18 m 0,-12 a 12 12 0 0 1 12 12 a 12 12 0 0 1 -12 12 a 6 6 0 0 0 6 -12 a 6 6 0 0 0 -6 -6 Z"
      fill="#f9a8d4" />
  </svg>
);

// ── KOE motif stickers ──
const WhiteDaisy = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
    {[0, 45, 90, 135, 180, 225, 270, 315].map((rot, i) => (
      <ellipse key={i} cx="28" cy="14" rx="5" ry="10" fill="#ffffff" stroke="#1d1535" strokeWidth="1.1"
        transform={`rotate(${rot} 28 28)`} />
    ))}
    <circle cx="28" cy="28" r="5.5" fill="#f7c948" stroke="#1d1535" strokeWidth="1.1" />
    <circle cx="26.5" cy="26.5" r="1" fill="#1d1535" opacity="0.6" />
  </svg>
);

const KOEMark = ({ size = 60 }) => (
  <svg width={size} height={size} viewBox="0 0 60 30" fill="none">
    <text x="30" y="22" textAnchor="middle" fontFamily="DM Serif Display, serif" fontStyle="italic"
      fontSize="22" fill="#1d1535">KOE</text>
    <text x="50" y="13" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#db77a8">∅</text>
    <text x="6" y="22" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#db77a8">◦</text>
  </svg>
);

const EchoBadge = ({ size = 60 }) => (
  <svg width={80} height={32} viewBox="0 0 80 32" fill="none">
    <rect x="2" y="2" width="76" height="28" rx="14" fill="#1d1535" stroke="#1d1535" strokeWidth="1.2" />
    <text x="40" y="20" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11"
      fontWeight="600" letterSpacing="3" fill="#fff">ECHO</text>
    <circle cx="14" cy="16" r="2" fill="#f7c948" />
    <circle cx="66" cy="16" r="2" fill="#f7c948" />
  </svg>
);

// ── Word pack ──
const WordBubble = ({ text, bg = "#fef3c7", color = "#1a1226", w = 70, h = 36 }) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
    <rect x="2" y="2" width={w - 4} height={h - 10} rx="14" fill={bg} stroke="#1a1226" strokeWidth="1.4" />
    <path d={`M ${w * 0.3} ${h - 8} L ${w * 0.4} ${h - 2} L ${w * 0.5} ${h - 8} Z`} fill={bg} stroke="#1a1226" strokeWidth="1.4" strokeLinejoin="round" />
    <text x={w / 2} y={h / 2 + 0} textAnchor="middle" fontFamily="DM Serif Display, serif" fontStyle="italic"
      fontSize="14" fill={color}>{text}</text>
  </svg>
);

const TagSticker = ({ text, bg = "#f9a8d4", w = 72, h = 28 }) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
    <path d={`M 4 4 L ${w - 8} 4 L ${w - 4} ${h / 2} L ${w - 8} ${h - 4} L 4 ${h - 4} Z`} fill={bg} stroke="#1a1226" strokeWidth="1.4" strokeLinejoin="round" />
    <circle cx="10" cy={h / 2} r="2" fill="#1a1226" />
    <text x={w * 0.55} y={h / 2 + 5} textAnchor="middle" fontFamily="JetBrains Mono, monospace"
      fontSize="11" letterSpacing="1" fontWeight="600" fill="#1a1226" textRendering="optimizeLegibility">{text}</text>
  </svg>
);

// Sticker registry — each pack has [id, label, render, size hint]
const STICKER_PACKS = {
  koe: {
    id: "koe", label: "心咲KOE", labelEn: "KOE",
    items: [
      { id: "daisy",     render: WhiteDaisy, w: 60, h: 60 },
      { id: "daisy-pink",render: () => <svg width="60" height="60" viewBox="0 0 56 56" fill="none">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((rot, i) => (
            <ellipse key={i} cx="28" cy="14" rx="5" ry="10" fill="#fbcfe8" stroke="#1d1535" strokeWidth="1.1"
              transform={`rotate(${rot} 28 28)`} />
          ))}
          <circle cx="28" cy="28" r="5.5" fill="#f7c948" stroke="#1d1535" strokeWidth="1.1" />
        </svg>, w: 60, h: 60 },
      { id: "koe-mark",  render: KOEMark,    w: 70, h: 36 },
      { id: "echo",      render: EchoBadge,  w: 84, h: 32 },
      { id: "voidring",  render: () => <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
          <text x="6" y="32" fontFamily="DM Serif Display, serif" fontSize="36" fontStyle="italic" fill="#1d1535">∅</text>
          <text x="30" y="20" fontFamily="JetBrains Mono, monospace" fontSize="14" fill="#db77a8">.◦</text>
        </svg>, w: 46, h: 46 },
      { id: "planet-pink",render: Planet,    w: 70, h: 60 },
      { id: "tag-echo",  render: () => <TagSticker text="TO·KOE" bg="#f7c948" />, w: 80, h: 32 },
      { id: "tag-bloom", render: () => <TagSticker text="BLOOMING" bg="#fbcfe8" />, w: 88, h: 32 },
    ],
  },
  cosmic: {
    id: "cosmic", label: "宇宙", labelEn: "Cosmic",
    items: [
      { id: "star",      render: StarTwinkle,  w: 56, h: 56 },
      { id: "sparkle",   render: Sparkle,      w: 44, h: 44 },
      { id: "moon",      render: Moon,         w: 64, h: 64 },
      { id: "planet",    render: Planet,       w: 70, h: 60 },
      { id: "comet",     render: Comet,        w: 70, h: 70 },
      { id: "dust",      render: CosmicDust,   w: 56, h: 56 },
      { id: "tag-koe",   render: () => <TagSticker text="∅.◦ KOE" bg="#1d1535" />, w: 88, h: 32 },
      { id: "tag-cosmic",render: () => <TagSticker text="DREAM∞" bg="#d4b8f2" />, w: 84, h: 32 },
    ],
  },
  girly: {
    id: "girly", label: "少女", labelEn: "Girly",
    items: [
      { id: "heart",   render: Heart,   w: 52, h: 52 },
      { id: "ribbon",  render: Ribbon,  w: 64, h: 48 },
      { id: "flower",  render: Flower,  w: 56, h: 56 },
      { id: "bow",     render: Bow,     w: 60, h: 44 },
      { id: "cherry",  render: Cherry,  w: 56, h: 56 },
      { id: "lolli",   render: Lolli,   w: 56, h: 64 },
      { id: "tag-love",render: () => <TagSticker text="LOVE♡" bg="#f9a8d4" />, w: 80, h: 32 },
      { id: "tag-koe", render: () => <TagSticker text="KAWAII" bg="#fbcfe8" />, w: 80, h: 32 },
    ],
  },
  words: {
    id: "words", label: "文字", labelEn: "Words",
    items: [
      { id: "w-kawaii", render: () => <WordBubble text="kawaii" bg="#fbcfe8" />, w: 80, h: 40 },
      { id: "w-yume",   render: () => <WordBubble text="夢" bg="#fef3c7" />, w: 52, h: 40 },
      { id: "w-koe",    render: () => <WordBubble text="KOE" bg="#d4b8f2" />, w: 62, h: 40 },
      { id: "w-suki",   render: () => <WordBubble text="好き" bg="#f9a8d4" color="#fff" />, w: 62, h: 40 },
      { id: "w-bloom",  render: () => <WordBubble text="bloom" bg="#fff" />, w: 70, h: 40 },
      { id: "w-hoshi",  render: () => <WordBubble text="星" bg="#fde7d4" />, w: 52, h: 40 },
      { id: "w-encore", render: () => <TagSticker text="ENCORE" bg="#1d1535" />, w: 80, h: 32 },
      { id: "w-best",   render: () => <TagSticker text="BEST DAY" bg="#fef3c7" />, w: 88, h: 32 },
    ],
  },
};

const PACK_ORDER = ["koe", "cosmic", "girly", "words"];

Object.assign(window, { STICKER_PACKS, PACK_ORDER });
