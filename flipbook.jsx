// FlipBook — page-turn album viewer for KOE
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

// ─── photo frame for book page — renders placed stickers too ───
function BookPhoto({ seed, photo, onOpen, label, dateStr, className = "", style, stickersOnPhoto }) {
  return (
    <div className={`frame fb-frame-click ${className}`} onClick={onOpen} style={style}>
      <PhotoPh seed={seed} url={photo?.url} label={label || photoLabel(seed)} corner={dateStr} />
      {stickersOnPhoto && stickersOnPhoto.length > 0 && (
        <div className="book-stickers">
          {stickersOnPhoto.map(s => {
            const R = s.render;
            return R ? (
              <div key={s.id} className="placed-mini"
                style={{ left: `${s.x}%`, top: `${s.y}%`, '--r': `${s.rot}deg`, '--s': s.scale }}>
                <R />
              </div>
            ) : null;
          })}
        </div>
      )}
      {stickersOnPhoto && stickersOnPhoto.length > 0 && (
        <div className="sticker-count">✦ {stickersOnPhoto.length}</div>
      )}
    </div>
  );
}

// ─── build pages for an album ───
function buildPages(album) {
  const seeds = album.photoSeed;
  const pages = [];
  pages.push({ kind: "inside-cover", album });
  pages.push({ kind: "first-content", album });

  const layouts = ["photo-1", "photo-3", "photo-2", "photo-4", "photo-1", "photo-2", "photo-3"];
  let cursor = 0, layoutIdx = 0;
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
    memorial: [
      { title: "心の花を咲かせる声", body: "在夢的宇宙中旅行的異星 VSinger。\n從藍星啟程的那一晚，我們聽見了你的歌聲。\n謝謝你來過。" },
      { title: "ECHO ⟡", body: "把貼紙貼在這裡吧。\n寫下你想說的話。\n我們都是 ECHO。" },
    ],
  };
  const list = notes[albumId] || notes.memorial;
  return list[(n - 1) % list.length];
}

// ─── page renderers ───
function PageBody({ page, side, pageNum, totalPages, onOpenPhoto, albumId, photosMap, placedStickers, getPhotoKey }) {
  if (page.kind === "blank") return null;
  if (page.kind === "inside-cover")  return <InsideCover />;
  if (page.kind === "first-content") return <FirstContentPage />;

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
        <div className="echo">END OF MEMORIAL BOOK</div>
        <div className="nums">
          <div><div className="n">{page.album.count}</div><div className="l">photos</div></div>
          <div><div className="n">{Object.values(placedStickers || {}).reduce((a, b) => a + b.length, 0)}</div><div className="l">stickers</div></div>
        </div>
      </div>
    );
  }

  const getPhoto  = (seed) => photosMap?.[seed] || null;
  const getStickers = (seed) => {
    const key = getPhotoKey ? getPhotoKey(seed) : `${albumId}:${seed}`;
    return placedStickers?.[key] || [];
  };
  const dates = ["10.18", "10.21", "10.23", "11.02", "11.07", "11.14"];

  if (page.kind === "photo-1") {
    const s = page.photos[0];
    return (
      <div className={`tpl-photo ${side} tpl-1`}>
        <div className="head"><span className="num">{photoLabel(s)}</span><span>·</span><span>{dates[s % dates.length]}</span></div>
        <div className="grid">
          <BookPhoto seed={s} photo={getPhoto(s)} stickersOnPhoto={getStickers(s)}
            onOpen={() => onOpenPhoto(s)} dateStr={`#${pageNum}`} />
          <div className="cap-row">
            <span className="date">{dates[s % dates.length]}</span>
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
            <BookPhoto key={i} seed={s} photo={getPhoto(s)} stickersOnPhoto={getStickers(s)}
              onOpen={() => onOpenPhoto(s)} dateStr={dates[(s + i) % dates.length]} />
          ))}
        </div>
      </div>
    );
  }
  if (page.kind === "photo-3") {
    const [a, b, c] = page.photos;
    return (
      <div className={`tpl-photo ${side} tpl-3`}>
        <div className="head"><span className="num">SPREAD ·</span><span>3 photos</span></div>
        <div className="grid">
          {a !== undefined && <BookPhoto seed={a} photo={getPhoto(a)} stickersOnPhoto={getStickers(a)} className="span2" onOpen={() => onOpenPhoto(a)} />}
          {b !== undefined && <BookPhoto seed={b} photo={getPhoto(b)} stickersOnPhoto={getStickers(b)} onOpen={() => onOpenPhoto(b)} />}
          {c !== undefined && <BookPhoto seed={c} photo={getPhoto(c)} stickersOnPhoto={getStickers(c)} onOpen={() => onOpenPhoto(c)} />}
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
            <BookPhoto key={i} seed={s} photo={getPhoto(s)} stickersOnPhoto={getStickers(s)} onOpen={() => onOpenPhoto(s)} />
          ))}
        </div>
      </div>
    );
  }
  return null;
}

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
function FlipBook({ album, onOpenPhoto, photosMap, placedStickers, getPhotoKey }) {
  const pages       = fbUseRef(buildPages(album)).current;
  const total       = pages.length;
  const totalSpreads = total / 2;

  const [spread, setSpread] = fbUseState(0);
  const [anim, setAnim]     = fbUseState(null);

  fbUseEffect(() => { setSpread(0); }, [album.id]);

  const go = (delta) => {
    if (anim) return;
    const target = spread + delta;
    if (target < 0 || target >= totalSpreads) return;
    setAnim({ dir: delta > 0 ? "next" : "prev", target });
    setTimeout(() => { setSpread(target); setAnim(null); }, 900);
  };

  const cL = pages[spread * 2], cR = pages[spread * 2 + 1];
  const tL = anim ? pages[anim.target * 2] : null;
  const tR = anim ? pages[anim.target * 2 + 1] : null;

  let bgLeft, bgRight, bgLeftNum, bgRightNum, leaf = null;
  if (!anim) {
    bgLeft = cL; bgLeftNum = spread * 2 + 1;
    bgRight = cR; bgRightNum = spread * 2 + 2;
  } else if (anim.dir === "next") {
    bgLeft = cL; bgLeftNum = spread * 2 + 1;
    bgRight = tR; bgRightNum = anim.target * 2 + 2;
    leaf = { front: cR, frontNum: spread * 2 + 2, back: tL, backNum: anim.target * 2 + 1 };
  } else {
    bgLeft = tL; bgLeftNum = anim.target * 2 + 1;
    bgRight = cR; bgRightNum = spread * 2 + 2;
    leaf = { front: tR, frontNum: anim.target * 2 + 2, back: cL, backNum: spread * 2 + 1 };
  }

  const progress    = (spread + 1) / totalSpreads;
  const commonProps = { onOpenPhoto, albumId: album.id, totalPages: total, photosMap, placedStickers, getPhotoKey };

  return (
    <div className="flipbook-wrap">
      <div className="flipbook-table">
        <div className="flipbook">
          <div className="fb-shadow-base" />
          <div className="fb-static left"><PageFace page={bgLeft}  side="left"  pageNum={bgLeftNum}  {...commonProps} /></div>
          <div className="fb-static right"><PageFace page={bgRight} side="right" pageNum={bgRightNum} {...commonProps} /></div>
          <div className="fb-spine" />
          {leaf && (
            <div className={`fb-leaf anim-${anim.dir}`}>
              <PageFace     page={leaf.front} side="right" pageNum={leaf.frontNum} {...commonProps} />
              <PageFaceBack page={leaf.back}  side="left"  pageNum={leaf.backNum}  {...commonProps} />
            </div>
          )}
          <div className="fb-corner prev" onClick={() => go(-1)} style={{ opacity: spread === 0 ? 0.3 : 1, pointerEvents: spread === 0 ? "none" : "auto" }}>
            <div className="fb-corner-arrow"><svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1 L 3 5 L 7 9" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" /></svg></div>
          </div>
          <div className="fb-corner next" onClick={() => go(1)} style={{ opacity: spread >= totalSpreads - 1 ? 0.3 : 1, pointerEvents: spread >= totalSpreads - 1 ? "none" : "auto" }}>
            <div className="fb-corner-arrow"><svg width="10" height="10" viewBox="0 0 10 10"><path d="M3 1 L 7 5 L 3 9" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" /></svg></div>
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
