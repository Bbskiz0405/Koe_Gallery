// FlipBook — page-turn album viewer for KOE
// Each "leaf" represents one physical sheet (2 sides). We render at most one
// flipping leaf at a time over a static spread, animated via CSS rotateY.

const { useState: fbUseState, useEffect: fbUseEffect, useRef: fbUseRef } = React;

// ─── small daisy decoration ───
function Daisy({ size = 56, petalFill = "#fff", coreFill = "#f7c948", stroke = "#1d1535" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      {[0, 45, 90, 135, 180, 225, 270, 315].map((rot, i) => (
        <ellipse key={i} cx="28" cy="14" rx="5" ry="10" fill={petalFill} stroke={stroke} strokeWidth="1.1"
          transform={`rotate(${rot} 28 28)`} />
      ))}
      <circle cx="28" cy="28" r="5.5" fill={coreFill} stroke={stroke} strokeWidth="1.1" />
      <circle cx="26.5" cy="26.5" r="1" fill={stroke} opacity="0.6" />
    </svg>
  );
}

// ─── photo frame for book page ───
function BookPhoto({ seed, onOpen, stickerCount = 0, label, dateStr, className = "", style }) {
  return (
    <div className={`frame fb-frame-click ${className}`} onClick={onOpen} style={style}>
      <PhotoPh seed={seed} label={label || photoLabel(seed)} corner={dateStr} />
      {stickerCount > 0 && <div className="sticker-count">✦ {stickerCount}</div>}
    </div>
  );
}

// ─── build pages for an album ───
function buildPages(album) {
  // page schema: { kind: 'inside-cover'|'first-content'|'photo-1'|'photo-2'|'photo-3'|'photo-4'|'note'|'closing', ...data }
  // Note: the front cover lives on the landing page (closed-book). When the
  // book opens, spread 0 shows the inside-front-cover (left) and the first
  // dedication page (right) — these match landing.jsx's InsideCover and
  // FirstContentPage components for seamless hand-off.
  const seeds = album.photoSeed;
  const pages = [];
  pages.push({ kind: "inside-cover", album });
  pages.push({ kind: "first-content", album });

  // Photo spreads — alternate layouts for rhythm
  const layouts = ["photo-1", "photo-3", "photo-2", "photo-4", "photo-1", "photo-2", "photo-3"];
  let cursor = 0;
  let layoutIdx = 0;
  while (cursor < seeds.length) {
    const kind = layouts[layoutIdx % layouts.length];
    const need = kind === "photo-1" ? 1 : kind === "photo-2" ? 2 : kind === "photo-3" ? 3 : 4;
    const photos = seeds.slice(cursor, cursor + need);
    if (photos.length === 0) break;
    pages.push({ kind, photos, caps: photos.map((s, i) => POLAROID_CAPS[(s + i) % POLAROID_CAPS.length]) });
    cursor += need;
    layoutIdx++;
    if (layoutIdx % 3 === 0 && cursor < seeds.length) {
      pages.push({ kind: "note", text: noteForAlbum(album.id, layoutIdx / 3) });
    }
  }
  if (pages.length % 2 === 1) pages.push({ kind: "note", text: noteForAlbum(album.id, 99) });
  pages.push({ kind: "closing", album });
  if (pages.length % 2 === 1) pages.push({ kind: "blank" });
  return pages;
}

function noteForAlbum(albumId, n) {
  const notes = {
    a01: [
      { title: "深夜のメモ", body: "凌晨四點，便利商店的燈光像舞台。\n寫了三段 demo，刪了兩段。\n剩下的那一段，獻給今晚還醒著的你。" },
      { title: "stardust 03", body: "今天的櫻花\n與一顆走丟的星星\n說了悄悄話。" },
    ],
    a02: [
      { title: "live note", body: "三月直播\nbackdrop 是 ECHO 們送的粉色雲海。\n第一次完整唱完〈唯一星〉。\n謝謝你們，一直一直陪我。" },
    ],
    a03: [
      { title: "幕後", body: "化妝鏡上貼著三十張便利貼。\n每一張都是 ECHO 寫的話。\n我把最甜的那張藏進了口袋。" },
    ],
    a04: [
      { title: "studio 4am", body: "錄音室的咖啡冷掉三次。\n耳機裡的伴奏\n像在夢的宇宙裡迷路。" },
    ],
    a05: [
      { title: "morning", body: "Mochi 把貓抓板抓得碎碎的。\n陽台的玫瑰茶涼了。\n但這個早晨，剛剛好。" },
    ],
    a06: [
      { title: "TO ECHO", body: "把貼紙貼在這裡吧。\n寫下你想說的話。\n我會在下一次直播裡，把它們一個一個念出來。" },
    ],
  };
  const list = notes[albumId] || notes.a01;
  return list[(n - 1) % list.length];
}

// ─── page renderers ───
function PageBody({ page, side, pageNum, totalPages, onOpenPhoto, photoStickerCounts, albumId }) {
  if (page.kind === "blank") return null;

  if (page.kind === "inside-cover") {
    return <InsideCover />;
  }

  if (page.kind === "first-content") {
    return <FirstContentPage />;
  }

  if (page.kind === "cover") {
    return (
      <>
        <div className="tpl-cover">
          <div className="stamp">∅.◦  KOE  album  ·  {page.album.id.toUpperCase()}</div>
          <h1>{page.album.title}</h1>
          <div className="jp-sub">{page.album.titleEn} ⟡ {page.album.tag}</div>
          <div className="daisy-stack">
            <Daisy size={120} />
          </div>
          <div className="credit">心咲KOE · echo's keepsake · vol. {page.album.id.replace("a", "")}</div>
        </div>
      </>
    );
  }

  if (page.kind === "preface") {
    return (
      <div className="tpl-preface">
        <div className="glyph">⟡ . ◦ ✦ ◦ . ⟡</div>
        <div className="tag-jp">心の花を<br />咲かせる声。</div>
        <div className="tag-en">A voice that blooms<br />flowers in your heart.</div>
        <div className="sig">— ECHO COLLECTION · 2025 · KOE ✦</div>
      </div>
    );
  }

  if (page.kind === "note") {
    return (
      <div className="tpl-note">
        <h3 className="note-title">{page.text.title}</h3>
        <div className="note-body">{page.text.body.split("\n").map((l, i) => <div key={i}>{l}</div>)}</div>
        <div className="sig-line">
          <div className="sig">心咲KOE</div>
          <div className="stamp">∅.◦ HANDWRITTEN</div>
        </div>
      </div>
    );
  }

  if (page.kind === "closing") {
    return (
      <div className="tpl-closing">
        <Daisy size={64} />
        <h2>thank you, ECHO ⟡</h2>
        <div className="echo">END OF ALBUM · {page.album.id.toUpperCase()}</div>
        <div className="nums">
          <div><div className="n">{page.album.count}</div><div className="l">photos</div></div>
          <div><div className="n">{42 + (page.album.cover * 17)}</div><div className="l">stickers</div></div>
          <div><div className="n">{18 + (page.album.cover * 9)}</div><div className="l">comments</div></div>
        </div>
      </div>
    );
  }

  // photo layouts
  const stick = (seed) => photoStickerCounts[`${albumId}:${seed}`] || 0;
  const dates = ["10.18", "10.21", "10.23", "11.02", "11.07", "11.14"];

  if (page.kind === "photo-1") {
    const s = page.photos[0];
    return (
      <div className={`tpl-photo ${side} tpl-1`}>
        <div className="head"><span className="num">{photoLabel(s)}</span><span>·</span><span>{dates[s % dates.length]}</span></div>
        <div className="grid">
          <BookPhoto seed={s} stickerCount={stick(s)} onOpen={() => onOpenPhoto(s)} dateStr={`#${pageNum}`} />
          <div className="cap-row">
            <span className="date">{dates[s % dates.length]} · {page.album?.tag || ""}</span>
            <span className="title">{page.caps[0]}</span>
          </div>
        </div>
      </div>
    );
  }
  if (page.kind === "photo-2") {
    return (
      <div className={`tpl-photo ${side} tpl-2`}>
        <div className="head"><span className="num">SPREAD ·</span><span>{page.photos.map(photoLabel).join(" · ")}</span></div>
        <div className="grid">
          {page.photos.map((s, i) => (
            <BookPhoto key={i} seed={s} stickerCount={stick(s)} onOpen={() => onOpenPhoto(s)} dateStr={dates[(s + i) % dates.length]} />
          ))}
        </div>
      </div>
    );
  }
  if (page.kind === "photo-3") {
    // big top, 2 small bottom
    const [a, b, c] = page.photos;
    return (
      <div className={`tpl-photo ${side} tpl-3`}>
        <div className="head"><span className="num">SPREAD ·</span><span>3 photos</span></div>
        <div className="grid">
          {a !== undefined && <BookPhoto seed={a} className="span2" stickerCount={stick(a)} onOpen={() => onOpenPhoto(a)} />}
          {b !== undefined && <BookPhoto seed={b} stickerCount={stick(b)} onOpen={() => onOpenPhoto(b)} />}
          {c !== undefined && <BookPhoto seed={c} stickerCount={stick(c)} onOpen={() => onOpenPhoto(c)} />}
        </div>
      </div>
    );
  }
  if (page.kind === "photo-4") {
    return (
      <div className={`tpl-photo ${side} tpl-4`}>
        <div className="head"><span className="num">SPREAD ·</span><span>4 photos · {dates[page.photos[0] % dates.length]}</span></div>
        <div className="grid">
          {page.photos.map((s, i) => (
            <BookPhoto key={i} seed={s} stickerCount={stick(s)} onOpen={() => onOpenPhoto(s)} />
          ))}
        </div>
      </div>
    );
  }
  return null;
}

// ─── full page wrapper with chrome (number, glyph) ───
function PageFace({ page, side, pageNum, totalPages, ...rest }) {
  return (
    <div className={`fb-page page-${side}`}>
      <div className="fb-page-inner">
        <PageBody page={page} side={side} pageNum={pageNum} totalPages={totalPages} {...rest} />
      </div>
      {page.kind !== "cover" && page.kind !== "blank" && page.kind !== "inside-cover" && page.kind !== "first-content" && (
        <>
          <div className="fb-pageglyph">⟡ {String(pageNum).padStart(2, "0")} · KOE</div>
          <div className="fb-pagenum">{pageNum} / {totalPages}</div>
        </>
      )}
    </div>
  );
}

// ─── back face (for inside cover etc) ───
function PageFaceBack({ page, side, pageNum, totalPages, ...rest }) {
  return (
    <div className={`fb-page page-${side} face-back`}>
      <div className="fb-page-inner">
        <PageBody page={page} side={side} pageNum={pageNum} totalPages={totalPages} {...rest} />
      </div>
      {page.kind !== "cover" && page.kind !== "blank" && page.kind !== "inside-cover" && page.kind !== "first-content" && (
        <>
          <div className="fb-pageglyph">⟡ {String(pageNum).padStart(2, "0")} · KOE</div>
          <div className="fb-pagenum">{pageNum} / {totalPages}</div>
        </>
      )}
    </div>
  );
}

// ─── FlipBook ───
function FlipBook({ album, onOpenPhoto, photoStickerCounts }) {
  const pages = fbUseRef(buildPages(album)).current;
  const total = pages.length;
  const totalSpreads = total / 2;

  // spread index: 0..totalSpreads-1
  // pages on spread N: left = pages[2N], right = pages[2N+1]
  const [spread, setSpread] = fbUseState(0);
  // anim phases:
  //   null       — no animation
  //   { dir, target, phase: 'init' } — initial state applied with transition:none
  //   { dir, target, phase: 'play' } — end state applied, transition triggers
  const [anim, setAnim] = fbUseState(null);

  fbUseEffect(() => { setSpread(0); }, [album.id]);

  const go = (delta) => {
    if (anim) return;
    const target = spread + delta;
    if (target < 0 || target >= totalSpreads) return;
    const dir = delta > 0 ? "next" : "prev";
    setAnim({ dir, target });
    setTimeout(() => {
      setSpread(target);
      setAnim(null);
    }, 900);
  };

  // Index helpers
  const cL = pages[spread * 2];
  const cR = pages[spread * 2 + 1];
  const tL = anim ? pages[anim.target * 2] : null;
  const tR = anim ? pages[anim.target * 2 + 1] : null;

  // Static background spread
  let bgLeft, bgRight, bgLeftNum, bgRightNum;
  let leaf = null;

  if (!anim) {
    bgLeft = cL; bgLeftNum = spread * 2 + 1;
    bgRight = cR; bgRightNum = spread * 2 + 2;
  } else if (anim.dir === "next") {
    bgLeft = cL; bgLeftNum = spread * 2 + 1;
    bgRight = tR; bgRightNum = anim.target * 2 + 2;
    leaf = {
      front: cR, frontNum: spread * 2 + 2,
      back: tL, backNum: anim.target * 2 + 1,
    };
  } else {
    bgLeft = tL; bgLeftNum = anim.target * 2 + 1;
    bgRight = cR; bgRightNum = spread * 2 + 2;
    leaf = {
      front: tR, frontNum: anim.target * 2 + 2,
      back: cL, backNum: spread * 2 + 1,
    };
  }

  const progress = (spread + 1) / totalSpreads;

  const commonProps = { onOpenPhoto, photoStickerCounts, albumId: album.id, totalPages: total };

  return (
    <div className="flipbook-wrap">
      <div className="flipbook-table">
        <div className="flipbook">
          <div className="fb-shadow-base" />

          {/* Static spread underneath */}
          <div className="fb-static left">
            <PageFace page={bgLeft} side="left" pageNum={bgLeftNum} {...commonProps} />
          </div>
          <div className="fb-static right">
            <PageFace page={bgRight} side="right" pageNum={bgRightNum} {...commonProps} />
          </div>

          {/* Spine */}
          <div className="fb-spine" />

          {/* Animated leaf overlay — always right-anchored at spine */}
          {leaf && (
            <div className={`fb-leaf anim-${anim.dir}`}>
              <PageFace page={leaf.front} side="right" pageNum={leaf.frontNum} {...commonProps} />
              <PageFaceBack page={leaf.back} side="left" pageNum={leaf.backNum} {...commonProps} />
            </div>
          )}

          {/* Click corners */}
          <div className="fb-corner prev" onClick={() => go(-1)} style={{ opacity: spread === 0 ? 0.3 : 1, pointerEvents: spread === 0 ? "none" : "auto" }}>
            <div className="fb-corner-arrow"><svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1 L 3 5 L 7 9" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
          </div>
          <div className="fb-corner next" onClick={() => go(1)} style={{ opacity: spread >= totalSpreads - 1 ? 0.3 : 1, pointerEvents: spread >= totalSpreads - 1 ? "none" : "auto" }}>
            <div className="fb-corner-arrow"><svg width="10" height="10" viewBox="0 0 10 10"><path d="M3 1 L 7 5 L 3 9" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
          </div>
        </div>
      </div>

      <div className="fb-nav">
        <button className="btn" onClick={() => go(-1)} disabled={spread === 0}>← prev</button>
        <div className="scrub"><div className="fill" style={{ width: `${progress * 100}%` }} /></div>
        <div className="progress">{String(spread + 1).padStart(2, "0")} / {String(totalSpreads).padStart(2, "0")}</div>
        <button className="btn primary" onClick={() => go(1)} disabled={spread >= totalSpreads - 1}>next →</button>
      </div>
    </div>
  );
}

Object.assign(window, { FlipBook, Daisy });
