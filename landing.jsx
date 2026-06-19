// Landing view — closed book floating in cosmic space.
// Click → opens with a multi-stage animation, hands off to FlipBook.

const { useState: lUseState, useEffect: lUseEffect } = React;

// ─── Closed book cover content ───
function CornerFlourish() {
  return (
    <svg viewBox="0 0 28 28" fill="none">
      <path d="M2 2 L 14 2 M 2 2 L 2 14 M 6 2 L 6 6 L 2 6" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" fill="none" />
      <circle cx="8" cy="8" r="1" fill="currentColor" />
    </svg>
  );
}

function CoverContent({ memorial = true }) {
  return (
    <div className="cover-content">
      <span className="cv-corner tl"><CornerFlourish /></span>
      <span className="cv-corner tr"><CornerFlourish /></span>
      <span className="cv-corner bl"><CornerFlourish /></span>
      <span className="cv-corner br"><CornerFlourish /></span>

      <div className="cv-top">
        <div className="cv-stamp">⟡ · ECHO COLLECTION · MEMORIAL</div>
      </div>

      <div className="cv-mid">
        <div className="cv-title-block">
          <div className="cv-title-zh">心咲<span className="cv-spark">✦</span></div>
          <div className="cv-title-koe">KOE</div>
        </div>
        <div className="cv-divider">
          <span className="cv-rule" />
          <span className="cv-divider-mark">✦</span>
          <span className="cv-rule" />
        </div>
        <div className="cv-tag-jp">心の花を咲かせる声</div>
      </div>

      <div className="cv-foot">
        <span className="cv-foot-date">2022.12.18 — 2026.03.11</span>
        <div className="cv-foot-row">
          <span className="cv-foot-stamp">MADE BY ECHO</span>
          <span className="cv-foot-stamp">VOL. 01</span>
        </div>
      </div>
    </div>
  );
}

// ─── Inside-front-cover (revealed underneath when cover flips) ───
function InsideCover() {
  return (
    <div className="inside-cover">
      <div className="ic-deco">⟡ . ◦ ✦ ◦ . ⟡</div>
      <Daisy size={56} />
      <div className="ic-text">
        <div className="ic-tag-jp">心の花を<br />咲かせる声。</div>
        <div className="ic-tag-en">A voice that blooms<br />flowers in your heart.</div>
      </div>
      <div className="ic-sig">— ECHO COLLECTION ⟡ 2026</div>
    </div>
  );
}

// First content page (right side of opened spread)
function FirstContentPage() {
  return (
    <div className="first-content">
      <div className="fc-glyph">CHAPTER · ∅.◦</div>
      <h2 className="fc-title">致<em>心咲</em><br /><span className="fc-koe">KOE</span></h2>
      <p className="fc-body">
        在夢的宇宙中旅行的異星 VSinger。<br />
        從藍星啟程的那一晚，我們聽見了你的歌聲。<br />
        把這本紀念冊獻給你 ⟡<br />
        願你在新的旅程裡也綻放著。
      </p>
      <div className="fc-bottom">
        <div className="fc-from">— from all ECHOs</div>
        <Daisy size={36} />
      </div>
    </div>
  );
}

// ─── Closed Book View ───
function LandingView({ orientation, onOpen, autoClose, onClosed }) {
  const [phase, setPhase] = lUseState(autoClose ? "closing" : "idle"); // idle | lift | open | closing

  const startOpen = () => {
    if (autoClose || phase !== "idle") return;
    setPhase("lift");
    setTimeout(() => setPhase("open"), 450);
    setTimeout(() => onOpen(), 1700);
  };

  // Auto-play the closing sequence when mounted in close mode, then hand back.
  lUseEffect(() => {
    if (!autoClose) return;
    const t1 = setTimeout(() => setPhase("idle"), 1550); // flip done → settle
    const t2 = setTimeout(() => onClosed && onClosed(), 2150); // fully closed
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [autoClose]);

  return (
    <div className={`landing ori-${orientation} phase-${phase}`}>
      {/* Decorative meta info around the book */}
      <div className="landing-meta-top">
        <div className="brand">
          <div className="b-mark"><em>心咲</em>KOE</div>
          <div className="b-sub">memorial · echo collection</div>
        </div>
        <div className="row">
          <span className="chip">⟡ vol. 01</span>
          <span className="chip">∅.◦ memorial</span>
        </div>
      </div>

      <div className="landing-stage-wrap">
        <div className="landing-stage">
          {/* Pre-rendered open spread underneath (revealed when cover flips) */}
          <div className="landing-inner">
            <div className="landing-page left">
              <InsideCover />
            </div>
            <div className="landing-page right">
              <FirstContentPage />
            </div>
            <div className="landing-inner-spine" />
          </div>

          {/* Closed-book skin: back cover (LEFT) + spine + page edges + bookmark.
              All fade out on phase-lift / phase-open. */}
          <div className="landing-back-cover">
            <div className="bc-deco">
              <span className="bc-glyph">⟡</span>
              <span className="bc-line" />
              <span className="bc-mono">∅.◦ ECHO COLLECTION · VOL. 01</span>
              <span className="bc-line" />
            </div>
            <div className="bc-mid">
              <Daisy size={48} />
              <div className="bc-quote">
                在夢的宇宙中旅行的異星 VSinger。<br />
                心咲KOE · 心の花を咲かせる声。
              </div>
            </div>
            <div className="bc-foot">
              <div className="bc-echos">
                <span className="bc-mono">CONTRIBUTING ECHOS</span>
                <span className="bc-echo-count">128</span>
              </div>
              <span className="bc-mono">心咲 KOE · 2022 — 2026</span>
            </div>
          </div>
          <div className="landing-page-edge top" />
          <div className="landing-page-edge bot" />
          <div className="landing-thickness">
            <div className="spine-title">心咲 KOE <span className="dot">⟡</span> MEMORIAL VOL.01</div>
          </div>
          <div className="landing-bookmark" aria-hidden="true" />

          {/* Cover leaf — flips left on open */}
          <div className="landing-cover-leaf" onClick={startOpen}>
            <div className="landing-cover-face front">
              <CoverContent />
            </div>
            <div className="landing-cover-face back">
              <InsideCover />
            </div>
            {/* Page-block edges — give the cover real thickness during the flip */}
            <div className="landing-cover-edge fore"></div>
            <div className="landing-cover-edge top"></div>
            <div className="landing-cover-edge bot"></div>
          </div>
        </div>
      </div>

      <div className="landing-hint-wrap">
        {phase === "idle" ? (
          <button className="landing-hint" onClick={startOpen}>
            <span className="lh-arrow">⟡</span>
            <span className="lh-label">翻開紀念冊</span>
            <span className="lh-en">open the keepsake</span>
          </button>
        ) : (
          <div className="landing-opening-msg">
            <span className="dot" /> {autoClose ? "closing · 合上中…" : "opening · 翻開中…"}
          </div>
        )}
      </div>

      <div className="landing-meta-bot">
        <span className="mono">心の花を咲かせる声 · A VOICE THAT BLOOMS FLOWERS</span>
      </div>
    </div>
  );
}

Object.assign(window, { LandingView, CoverContent, InsideCover, FirstContentPage });
