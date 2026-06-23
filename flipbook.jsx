// FlipBook — page-turn album viewer for KOE
const { useState: fbUseState, useEffect: fbUseEffect, useRef: fbUseRef } = React;

// ─── small daisy decoration ───
function Daisy({ size = 56, petalFill = "#fff", coreFill = "#fde68a", stroke = "#9389a8" }) {
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

// ─── a single freely-placed photo on a collage page ───
// Drag to move, ↻ corner handle to rotate + resize, ✕ to remove.
function CollagePhoto({ photo, idx, editing, selected, onSelect, onUpdate, onPersist,
                        onDelete, onClick, containerRef, stickers, quickSticker }) {
  const startRef = fbUseRef(null);
  const movedRef = fbUseRef(false);

  const x = photo.x ?? 50, y = photo.y ?? 50;
  const rot = photo.rot ?? 0, scale = photo.scale ?? 1;

  // Clamp the photo's CENTER (not its bounding box) to the page, so a large or
  // scaled-up photo can still always be grabbed and dragged — it just bleeds off
  // the edge (the page clips it). Prevents photos getting "stuck" at the edge.
  const clamp = (v) => Math.max(5, Math.min(95, v));

  const onPointerDown = (e, mode = "move") => {
    if (!editing) return;
    e.stopPropagation();
    onSelect(idx);
    movedRef.current = false;
    const rect = containerRef.current.getBoundingClientRect();
    startRef.current = { mode, startX: e.clientX, startY: e.clientY,
      start: { x, y, rot, scale }, rect };
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp, { once: true });
  };

  const onPointerMove = (e) => {
    const s = startRef.current; if (!s) return;
    movedRef.current = true;
    if (s.mode === "move") {
      const nx = s.start.x + ((e.clientX - s.startX) / s.rect.width) * 100;
      const ny = s.start.y + ((e.clientY - s.startY) / s.rect.height) * 100;
      onUpdate(photo.id, { x: clamp(nx), y: clamp(ny) });
    } else {
      const cx = s.rect.left + (s.start.x / 100) * s.rect.width;
      const cy = s.rect.top  + (s.start.y / 100) * s.rect.height;
      const ang  = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
      const ang0 = Math.atan2(s.startY - cy, s.startX - cx) * 180 / Math.PI;
      const d0 = Math.hypot(s.startX - cx, s.startY - cy);
      const d1 = Math.hypot(e.clientX - cx, e.clientY - cy);
      const newScale = Math.max(0.4, Math.min(2.2, s.start.scale * (d1 / Math.max(1, d0))));
      onUpdate(photo.id, { rot: s.start.rot + (ang - ang0), scale: newScale });
    }
  };

  const onPointerUp = () => {
    document.removeEventListener("pointermove", onPointerMove);
    const s = startRef.current; startRef.current = null;
    if (s && movedRef.current) onPersist(photo.id); // write final layout to Firestore
  };

  return (
    <div
      className={`collage-photo ${editing ? "editing" : ""} ${selected ? "selected" : ""}`}
      style={{
        left: `${x}%`, top: `${y}%`,
        width: `${50 * scale}%`,
        transform: `translate(-50%, -50%) rotate(${rot}deg)`,
        cursor: editing ? "grab" : quickSticker ? "crosshair" : "zoom-in",
      }}
      onPointerDown={(e) => onPointerDown(e, "move")}
      onClick={(e) => {
        // Always stop the click here so it never bubbles to the page background
        // (whose onClick deselects). Otherwise releasing a tap in edit mode would
        // instantly clear the selection and hide the ✕ / ↻ handles.
        e.stopPropagation();
        if (!editing) onClick(idx);
      }}
    >
      <div className="cp-frame">
        {photo.url
          ? <img src={photo.url} alt="" draggable={false}
              style={{ width: "100%", height: "auto", display: "block" }} />
          : <div className="cp-ph" style={{ background: gradientFor(idx) }} />}
        {stickers && stickers.length > 0 && (
          <div className="book-stickers">
            {stickers.map(s => { const R = s.render; return R ? (
              <div key={s.id} className="placed-mini"
                style={{ left: `${s.x}%`, top: `${s.y}%`, '--r': `${s.rot}deg`, '--s': s.scale }}>
                <R />
              </div>
            ) : null; })}
          </div>
        )}
      </div>
      {editing && selected && (
        <>
          <button className="sticker-handle delete" onPointerDown={(e) => { e.stopPropagation(); onDelete(photo.id); }}>
            <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 2 L 8 8 M 8 2 L 2 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
          </button>
          <div className="sticker-handle rotate" onPointerDown={(e) => onPointerDown(e, "rotate")}>↻</div>
        </>
      )}
    </div>
  );
}

// ─── a blank collage page that holds freely-placed photos ───
function CollagePage({ cindex, photos, albumId, editing, selectedPhoto, onSelectPhoto,
                       onUpdatePhoto, onPersistPhoto, onDeletePhoto, onPhotoClick,
                       placedStickers, getPhotoKey, quickSticker,
                       onPlaceBoard, onChangeBoard, onCommitBoard, onDeleteBoard }) {
  const pageRef = fbUseRef(null);
  const here = photos
    .map((p, i) => ({ ...p, _i: i }))
    .filter(p => (p.page ?? 0) === cindex);
  const boardKey = `${albumId}::page${cindex}`;
  const locked = isPageLocked(cindex);   // 上線鎖定：這頁的照片不可編輯/刪除

  return (
    <div className={`tpl-collage ${editing ? "editing" : ""}`} ref={pageRef}
      onClick={() => { if (editing && !locked) onSelectPhoto(null); }}>
      {editing && locked && (
        <div style={{ position: "absolute", top: 8, right: 8, zIndex: 6,
          fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em",
          color: "var(--ink-mute)", background: "rgba(255,250,245,0.92)",
          border: "1px solid var(--line)", borderRadius: 999, padding: "3px 9px" }}>
          🔒 已鎖定
        </div>
      )}
      {here.length === 0 && (
        <div className="collage-empty">
          {locked ? "🔒 這一頁已鎖定" : editing ? "拖曳照片自由擺放 ⟡" : "這一頁還是空白的"}
        </div>
      )}
      {here.map(p => {
        const key = getPhotoKey ? getPhotoKey(p._i) : p.id;
        return (
          <CollagePhoto key={p.id} photo={p} idx={p._i}
            editing={editing && !locked}
            selected={selectedPhoto === p._i}
            onSelect={onSelectPhoto}
            onUpdate={onUpdatePhoto}
            onPersist={onPersistPhoto}
            onDelete={onDeletePhoto}
            onClick={onPhotoClick}
            containerRef={pageRef}
            stickers={placedStickers?.[key] || []}
            quickSticker={quickSticker}
          />
        );
      })}
      {onPlaceBoard && (
        <StickerBoard boardKey={boardKey}
          stickers={placedStickers?.[boardKey] || []}
          placing={!!quickSticker} editing={editing}
          onPlace={onPlaceBoard} onChange={onChangeBoard}
          onCommit={onCommitBoard} onDelete={onDeleteBoard} />
      )}
    </div>
  );
}

// ─── build pages for an album ───
// Freeform collage book: opening dedication spread, then N blank collage pages
// where fans freely place their fanart. `collagePages` controls how many.
function buildPages(album, collagePages) {
  const pages = [];
  pages.push({ kind: "inside-cover", album });
  pages.push({ kind: "first-content", album });
  const n = Math.max(1, collagePages || 1);
  for (let i = 0; i < n; i++) pages.push({ kind: "collage", cindex: i });
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
function PageBody({ page, side, pageNum, totalPages, onOpenPhoto, albumId, photosMap,
                   placedStickers, getPhotoKey, photos, editing, selectedPhoto,
                   onSelectPhoto, onUpdatePhoto, onPersistPhoto, onDeletePhoto, quickSticker,
                   onPlaceBoard, onChangeBoard, onCommitBoard, onDeleteBoard }) {
  if (page.kind === "blank") return null;
  if (page.kind === "inside-cover")  return <InsideCover />;
  if (page.kind === "first-content") return <FirstContentPage />;

  if (page.kind === "collage") {
    return (
      <CollagePage cindex={page.cindex} photos={photos || []} albumId={albumId}
        editing={editing}
        selectedPhoto={selectedPhoto}
        onSelectPhoto={onSelectPhoto}
        onUpdatePhoto={onUpdatePhoto}
        onPersistPhoto={onPersistPhoto}
        onDeletePhoto={onDeletePhoto}
        onPhotoClick={onOpenPhoto}
        placedStickers={placedStickers}
        getPhotoKey={getPhotoKey}
        quickSticker={quickSticker}
        onPlaceBoard={onPlaceBoard}
        onChangeBoard={onChangeBoard}
        onCommitBoard={onCommitBoard}
        onDeleteBoard={onDeleteBoard}
      />
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

// ─── mobile detection ───
function useMobile() {
  const [mobile, setMobile] = fbUseState(() => window.innerWidth <= 600);
  fbUseEffect(() => {
    const h = () => setMobile(window.innerWidth <= 600);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return mobile;
}

// report the collage pages currently open (both left & right) upward,
// so the upload modal can offer "left page / right page" as a target.
function reportPage(pages, spread, onPageChange) {
  if (!onPageChange) return;
  const l = pages[spread * 2], r = pages[spread * 2 + 1];
  const out = [];
  if (l && l.kind === "collage") out.push({ cindex: l.cindex, side: "左頁", num: spread * 2 + 1 });
  if (r && r.kind === "collage") out.push({ cindex: r.cindex, side: "右頁", num: spread * 2 + 2 });
  if (out.length) onPageChange({ pages: out, primary: out[0].cindex });
}

// ─── Mobile single-page viewer — one full-size page at a time ───
// Open cover → see the left page; tap (or "next") slides to the next page,
// one page per step, just like turning a single leaf on a phone.
function MobileFlipBook({ pages, album, onOpenPhoto, photosMap, placedStickers, getPhotoKey,
                          onPageChange, ...collageProps }) {
  // Show every real page individually (blank spacer pages are skipped).
  const seq   = pages.filter(p => p.kind !== "blank");
  const total = seq.length;
  const [idx, setIdx] = fbUseState(0);
  const [dir, setDir] = fbUseState("next");

  // Keep the editing toolbar pointed at the collage page currently on screen.
  fbUseEffect(() => {
    const p = seq[idx];
    if (onPageChange && p && p.kind === "collage")
      onPageChange({ pages: [{ cindex: p.cindex, side: idx % 2 === 0 ? "左頁" : "右頁", num: idx + 1 }], primary: p.cindex });
  }, [idx]);

  const go = (delta) => {
    const target = idx + delta;
    if (target < 0 || target >= total) return;
    setDir(delta > 0 ? "next" : "prev");
    setIdx(target);
  };

  // Tap an empty area of the page to advance. Tapping a photo zooms it
  // (CollagePhoto stops propagation), so the two never conflict.
  const onTapPage = () => {
    if (collageProps.editing) return;
    if (idx < total - 1) go(1);
  };

  const page = seq[idx];
  const side = idx % 2 === 0 ? "left" : "right";
  const commonProps = { onOpenPhoto, albumId: album.id, totalPages: total, photosMap, placedStickers, getPhotoKey, ...collageProps };

  return (
    <div className="flipbook-wrap">
      <div className="flipbook-table mobile-single">
        <div className="fb-single">
          <div key={idx} className={`fb-single-page anim-in-${dir}`} onClick={onTapPage}>
            <PageFace page={page} side={side} pageNum={idx + 1} {...commonProps} />
          </div>
        </div>
      </div>
      <div className="fb-nav">
        <button className="btn" onClick={() => go(-1)} disabled={idx === 0}>← prev</button>
        <div className="scrub"><div className="fill" style={{ width: `${(idx + 1) / total * 100}%` }} /></div>
        <div className="progress">{String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</div>
        <button className="btn primary" onClick={() => go(1)} disabled={idx >= total - 1}>next →</button>
      </div>
    </div>
  );
}

// ─── FlipBook ───
function FlipBook({ album, onOpenPhoto, photosMap, placedStickers, getPhotoKey,
                   collagePages, onPageChange, ...collageProps }) {
  const isMobile = useMobile();
  const pages    = buildPages(album, collagePages);

  const total       = pages.length;
  const totalSpreads = Math.ceil(total / 2);

  const [spread, setSpread] = fbUseState(0);
  const [anim, setAnim]     = fbUseState(null);

  fbUseEffect(() => { reportPage(pages, spread, onPageChange); }, [spread, total]);

  if (isMobile) {
    return <MobileFlipBook pages={pages} album={album} onOpenPhoto={onOpenPhoto}
      photosMap={photosMap} placedStickers={placedStickers} getPhotoKey={getPhotoKey}
      onPageChange={onPageChange} {...collageProps} />;
  }

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
  const commonProps = { onOpenPhoto, albumId: album.id, totalPages: total, photosMap, placedStickers, getPhotoKey, ...collageProps };

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
