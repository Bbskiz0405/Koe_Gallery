// Views for KOE album site — Home, Album, Lightbox, Upload modal
const { useState: vUseState, useEffect: vUseEffect, useRef: vUseRef, useMemo: vUseMemo } = React;

// ────────────────────────────────────────
// BOOK VIEW — open memorial book (FlipBook + close button)
// ────────────────────────────────────────
function BookView({ album, layout, setLayout, onClose, onUpload, onOpenPhoto, photoStickerCounts }) {
  const [editing, setEditing] = vUseState(false);
  const [order, setOrder] = vUseState(album.photoSeed);
  const dragIdx = vUseRef(null);

  // Collage free-position: map photo seed -> { leftPct, topPct }, persisted.
  const COLLAGE_POSITIONS = [
    { top: "5%", left: "12%", size: 220, rot: -6 },
    { top: "8%", left: "42%", size: 180, rot: 4 },
    { top: "12%", left: "70%", size: 240, rot: -3 },
    { top: "35%", left: "8%", size: 200, rot: 5 },
    { top: "38%", left: "36%", size: 260, rot: -2 },
    { top: "42%", left: "68%", size: 200, rot: 7 },
    { top: "65%", left: "16%", size: 220, rot: -4 },
    { top: "70%", left: "44%", size: 180, rot: 3 },
    { top: "68%", left: "70%", size: 240, rot: -5 },
    { top: "88%", left: "50%", size: 200, rot: 2 },
  ];
  const collageRef = vUseRef(null);
  const collageDrag = vUseRef(null);
  const [collagePos, setCollagePos] = vUseState(() => {
    try { return JSON.parse(localStorage.getItem("koe-collage-pos-" + album.id) || "{}"); }
    catch (e) { return {}; }
  });

  const collagePosFor = (seed, i) => collagePos[seed] || {
    leftPct: parseFloat(COLLAGE_POSITIONS[i].left),
    topPct: parseFloat(COLLAGE_POSITIONS[i].top),
  };

  const onCollageDown = (seed, i) => (e) => {
    if (!editing) return;
    e.preventDefault(); e.stopPropagation();
    const rect = collageRef.current.getBoundingClientRect();
    const cur = collagePosFor(seed, i);
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    const move = (ev) => {
      const r = collageRef.current.getBoundingClientRect();
      let nx = ((ev.clientX - r.left) / r.width) * 100 - (xPct - cur.leftPct);
      let ny = ((ev.clientY - r.top) / r.height) * 100 - (yPct - cur.topPct);
      nx = Math.max(3, Math.min(97, nx));
      ny = Math.max(3, Math.min(97, ny));
      setCollagePos((prev) => ({ ...prev, [seed]: { leftPct: nx, topPct: ny } }));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      collageDrag.current = null;
      setCollagePos((prev) => {
        try { localStorage.setItem("koe-collage-pos-" + album.id, JSON.stringify(prev)); } catch (e) {}
        return prev;
      });
    };
    collageDrag.current = seed;
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  // Polaroid captions the user can type themselves (persisted per album).
  const [polaroidCaps, setPolaroidCaps] = vUseState(() => {
    try { return JSON.parse(localStorage.getItem("koe-polaroid-caps-" + album.id) || "{}"); }
    catch (e) { return {}; }
  });
  const capText = (seed) => (seed in polaroidCaps) ? polaroidCaps[seed] : POLAROID_CAPS[seed % POLAROID_CAPS.length];
  const saveCap = (seed, text) => {
    setPolaroidCaps((prev) => {
      const next = { ...prev, [seed]: text };
      try { localStorage.setItem("koe-polaroid-caps-" + album.id, JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  vUseEffect(() => { setOrder(album.photoSeed); }, [album.id]);

  const onDragStart = (i) => () => { dragIdx.current = i; };
  const onDragOver = (i) => (e) => { e.preventDefault(); };
  const onDrop = (i) => (e) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === i) return;
    const next = [...order];
    const [moved] = next.splice(dragIdx.current, 1);
    next.splice(i, 0, moved);
    setOrder(next);
    dragIdx.current = null;
  };

  return (
    <div className="book-view" data-screen-label="02 Book Open">
      <button className="book-close-btn" onClick={onClose}>
        <Icon.arrowL /> 合上紀念冊
      </button>

      <div className="book-view-top">
        <div className="brand">
          <div className="b-mark"><em>心咲</em>KOE</div>
          <div className="b-sub">memorial · echo collection · vol. 01</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <div className="layout-switch">
            <button className={layout === "book" ? "on" : ""} onClick={() => setLayout("book")}>翻頁</button>
            <button className={layout === "collage" ? "on" : ""} onClick={() => setLayout("collage")}>拼貼</button>
            <button className={layout === "polaroid" ? "on" : ""} onClick={() => setLayout("polaroid")}>拍立得</button>
          </div>
          <button className={`btn ${editing ? "primary" : ""}`} onClick={() => setEditing(!editing)}>
            <Icon.edit /> {editing ? "完成" : "排版"}
          </button>
          <button className="btn pink" onClick={onUpload}><Icon.upload /> 加照片</button>
        </div>
      </div>

      {editing && layout !== "book" && (
        <div className="edit-banner">
          <div className="dot" />
          <span className="mono">{layout === "collage" ? "編輯模式 · 拖曳照片自由摆放" : "編輯模式 · 拖曳照片重新排序"}</span>
        </div>
      )}

      {layout === "book" && (
        <FlipBook
          album={{ ...album, photoSeed: order }}
          onOpenPhoto={onOpenPhoto}
          photoStickerCounts={photoStickerCounts}
        />
      )}

      {layout === "grid" && (
        <div className={`varied-grid ${editing ? "editing" : ""}`} style={{ padding: "0 36px" }}>
          {order.map((seed, i) => {
            const [cs, rs] = VARIED_PATTERNS[i % VARIED_PATTERNS.length];
            const stickerCount = photoStickerCounts[`${album.id}:${seed}`] || 0;
            return (
              <div
                key={`${album.id}-${seed}-${i}`}
                className="photo"
                style={{ gridColumn: `span ${cs}`, gridRow: `span ${rs}` }}
                draggable={editing}
                onDragStart={onDragStart(i)}
                onDragOver={onDragOver(i)}
                onDrop={onDrop(i)}
                onClick={() => !editing && onOpenPhoto(seed)}
              >
                <PhotoPh seed={seed} corner={`#${String(i + 1).padStart(2, "0")}`} />
                {stickerCount > 0 && <div className="sticker-count">✦ {stickerCount}</div>}
              </div>
            );
          })}
        </div>
      )}

      {layout === "polaroid" && (
        <div className="polaroids" style={{ padding: "0 36px" }}>
          {order.map((seed, i) => {
            const stickerCount = photoStickerCounts[`${album.id}:${seed}`] || 0;
            return (
              <div key={`${album.id}-${seed}-${i}-p`} className="photo" onClick={() => onOpenPhoto(seed)}>
                <div className="tape" />
                <div className="ph-frame"><PhotoPh seed={seed} /></div>
                <div
                  className="cap editable"
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck={false}
                  data-ph="寫點什麼…"
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  onBlur={(e) => saveCap(seed, e.currentTarget.textContent.trim())}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); } }}
                >{capText(seed)}</div>
                {stickerCount > 0 && <div className="sticker-count">✦ {stickerCount}</div>}
              </div>
            );
          })}
        </div>
      )}

      {layout === "collage" && (
        <div className={`collage ${editing ? "editing" : ""}`} ref={collageRef}>
          {order.slice(0, 10).map((seed, i) => {
            const p = COLLAGE_POSITIONS[i];
            const pos = collagePosFor(seed, i);
            const stickerCount = photoStickerCounts[`${album.id}:${seed}`] || 0;
            return (
              <div key={`${album.id}-${seed}-${i}-c`} className="photo"
                style={{
                  top: `${pos.topPct}%`, left: `${pos.leftPct}%`,
                  width: p.size, height: p.size + 50,
                  transform: `translate(-50%, -50%) rotate(${editing ? 0 : p.rot}deg)`,
                  zIndex: collageDrag.current === seed ? 30 : 10 - Math.abs(p.rot),
                  touchAction: editing ? "none" : "auto",
                }}
                onPointerDown={onCollageDown(seed, i)}
                onClick={() => { if (!editing) onOpenPhoto(seed); }}
              >
                <div className="ph-frame"><PhotoPh seed={seed} /></div>
                <div className="cap">{photoLabel(seed)} · {POLAROID_CAPS[seed % POLAROID_CAPS.length]}</div>
                {stickerCount > 0 && <div className="sticker-count">✦ {stickerCount}</div>}
                {editing && <div className="drag-grip">✥</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────
// HOME — albums overview
// ────────────────────────────────────────
function HomeView({ onOpenAlbum, onUpload }) {
  return (
    <>
      <section className="home-hero" data-screen-label="01 Home">
        <div>
          <div className="mono muted">∅.◦ echo collection · 2025</div>
          <h1>心の<em>花</em>を<br />咲かせる<br /><em>声</em>。</h1>
          <p className="lede">
            心咲KOE 的相簿｜在夢的宇宙中旅行的異星 VSinger。<br />
            把回憶夾進書頁，翻開時讓 ECHO 們在每張照片貼上一朵雛菊、留下悄悄話。
          </p>
          <div className="hero-meta">
            <div className="stat"><div className="n">06</div><div className="l">albums</div></div>
            <div className="stat"><div className="n">111</div><div className="l">photos</div></div>
            <div className="stat"><div className="n">428</div><div className="l">echo notes</div></div>
          </div>
          <div className="row" style={{ marginTop: 32 }}>
            <button className="btn primary" onClick={onUpload}><Icon.upload /> 上傳照片</button>
            <button className="btn ghost"><span className="dot" /> 新建相簿</button>
          </div>
        </div>
        <HeroArt />
      </section>

      <div className="section-head">
        <span className="num">02 / Albums · 翻頁式相簿</span>
        <h2>相簿一覽</h2>
        <div className="spacer" />
        <div className="chip">SORT · LATEST</div>
        <div className="chip">FILTER · ALL</div>
      </div>

      <div className="albums-grid">
        {ALBUMS.map(a => <AlbumCard key={a.id} album={a} onOpen={() => onOpenAlbum(a.id)} />)}
      </div>
    </>
  );
}

// ────────────────────────────────────────
// ALBUM — single album with layout switch
// ────────────────────────────────────────
function AlbumView({ albumId, layout, setLayout, onBack, onUpload, onOpenPhoto, photoStickerCounts }) {
  const album = ALBUMS.find(a => a.id === albumId);
  const [editing, setEditing] = vUseState(false);
  const [order, setOrder] = vUseState(album.photoSeed);
  const dragIdx = vUseRef(null);

  vUseEffect(() => { setOrder(album.photoSeed); }, [albumId]);

  const onDragStart = (i) => () => { dragIdx.current = i; };
  const onDragOver = (i) => (e) => { e.preventDefault(); };
  const onDrop = (i) => (e) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === i) return;
    const next = [...order];
    const [moved] = next.splice(dragIdx.current, 1);
    next.splice(i, 0, moved);
    setOrder(next);
    dragIdx.current = null;
  };

  return (
    <div data-screen-label={`02 Album ${album.id}`}>
      <div className="row" style={{ marginBottom: 14, padding: "0 8px" }}>
        <button className="btn ghost" onClick={onBack}><Icon.arrowL /> all albums</button>
        <div className="spacer" />
      </div>

      <div className="album-head">
        <div>
          <div className="mono muted">album · {album.id.toUpperCase()} · {album.tag}</div>
          <h1>{album.title.split("").map((c, i) =>
            i === Math.floor(album.title.length / 2) ? <em key={i}>{c}</em> : <span key={i}>{c}</span>
          )}</h1>
          <div className="sub">
            <span>{album.titleEn}</span>
            <span>·</span>
            <span>{album.count} 張</span>
            <span>·</span>
            <span>upd. 2025.10.18</span>
          </div>
          <p className="album-desc">{album.desc}</p>
        </div>
        <div className="actions">
          <div className="layout-switch">
            <button className={layout === "book" ? "on" : ""} onClick={() => setLayout("book")}>翻頁</button>
            <button className={layout === "collage" ? "on" : ""} onClick={() => setLayout("collage")}>拼貼</button>
            <button className={layout === "polaroid" ? "on" : ""} onClick={() => setLayout("polaroid")}>Polaroid</button>
          </div>
          <button className={`btn ${editing ? "primary" : ""}`} onClick={() => setEditing(!editing)}>
            <Icon.edit /> {editing ? "完成排版" : "編輯排版"}
          </button>
          <button className="btn pink" onClick={onUpload}><Icon.upload /> 加照片</button>
        </div>
      </div>

      {editing && (
        <div className="edit-banner">
          <div className="dot" />
          <span className="mono">編輯模式 · 拖曳照片重新排序 · 點完成排版儲存</span>
          <div className="spacer" />
          <span className="mono muted">{order.length} items</span>
        </div>
      )}

      {layout === "book" && (
        <FlipBook
          album={album}
          onOpenPhoto={onOpenPhoto}
          photoStickerCounts={photoStickerCounts}
        />
      )}

      {layout === "grid" && (
        <div className={`varied-grid ${editing ? "editing" : ""}`}>
          {order.map((seed, i) => {
            const [cs, rs] = VARIED_PATTERNS[i % VARIED_PATTERNS.length];
            const stickerCount = photoStickerCounts[`${albumId}:${seed}`] || 0;
            return (
              <div
                key={`${albumId}-${seed}-${i}`}
                className="photo"
                style={{ gridColumn: `span ${cs}`, gridRow: `span ${rs}` }}
                draggable={editing}
                onDragStart={onDragStart(i)}
                onDragOver={onDragOver(i)}
                onDrop={onDrop(i)}
                onClick={() => !editing && onOpenPhoto(seed)}
              >
                <PhotoPh seed={seed} corner={`#${String(i + 1).padStart(2, "0")}`} />
                {stickerCount > 0 && (
                  <div className="sticker-count">✦ {stickerCount}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {layout === "collage" && (
        <div className="collage">
          {order.slice(0, 10).map((seed, i) => {
            const positions = [
              { top: "5%", left: "12%", size: 220, rot: -6 },
              { top: "8%", left: "42%", size: 180, rot: 4 },
              { top: "12%", left: "70%", size: 240, rot: -3 },
              { top: "35%", left: "8%", size: 200, rot: 5 },
              { top: "38%", left: "36%", size: 260, rot: -2 },
              { top: "42%", left: "68%", size: 200, rot: 7 },
              { top: "65%", left: "16%", size: 220, rot: -4 },
              { top: "70%", left: "44%", size: 180, rot: 3 },
              { top: "68%", left: "70%", size: 240, rot: -5 },
              { top: "88%", left: "50%", size: 200, rot: 2 },
            ];
            const p = positions[i];
            const stickerCount = photoStickerCounts[`${albumId}:${seed}`] || 0;
            return (
              <div
                key={`${albumId}-${seed}-${i}-c`}
                className="photo"
                style={{
                  top: p.top, left: p.left,
                  width: p.size, height: p.size + 50,
                  transform: `translate(-50%, -50%) rotate(${p.rot}deg)`,
                  zIndex: 10 - Math.abs(p.rot),
                }}
                onClick={() => onOpenPhoto(seed)}
              >
                <div className="ph-frame"><PhotoPh seed={seed} /></div>
                <div className="cap">{photoLabel(seed)} · {POLAROID_CAPS[seed % POLAROID_CAPS.length]}</div>
                {stickerCount > 0 && <div className="sticker-count">✦ {stickerCount}</div>}
              </div>
            );
          })}
        </div>
      )}

      {layout === "polaroid" && (
        <div className="polaroids">
          {order.map((seed, i) => {
            const stickerCount = photoStickerCounts[`${albumId}:${seed}`] || 0;
            return (
              <div key={`${albumId}-${seed}-${i}-p`} className="photo" onClick={() => onOpenPhoto(seed)}>
                <div className="tape" />
                <div className="ph-frame"><PhotoPh seed={seed} /></div>
                <div className="cap">{POLAROID_CAPS[seed % POLAROID_CAPS.length]}</div>
                {stickerCount > 0 && <div className="sticker-count">✦ {stickerCount}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────
// LIGHTBOX — single photo with stickers + comments
// ────────────────────────────────────────
function Lightbox({ photoKey, seed, stickers: placedStickers, setPlacedStickers, onClose }) {
  const [tab, setTab] = vUseState("stickers"); // 'stickers' | 'comments'
  const [activePack, setActivePack] = vUseState("koe");
  const [selectedSticker, setSelectedSticker] = vUseState(null);
  const stageRef = vUseRef(null);

  const stickersHere = placedStickers[photoKey] || [];

  const addSticker = (template) => {
    const id = `s${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newSticker = {
      id, packId: activePack, stickerId: template.id,
      render: template.render, w: template.w, h: template.h,
      x: 40 + Math.random() * 20, y: 40 + Math.random() * 20,
      rot: (Math.random() - 0.5) * 20, scale: 1,
    };
    setPlacedStickers({ ...placedStickers, [photoKey]: [...stickersHere, newSticker] });
    setSelectedSticker(id);
  };

  const updateSticker = (id, patch) => {
    setPlacedStickers({
      ...placedStickers,
      [photoKey]: stickersHere.map(s => s.id === id ? { ...s, ...patch } : s),
    });
  };

  const deleteSticker = (id) => {
    setPlacedStickers({
      ...placedStickers,
      [photoKey]: stickersHere.filter(s => s.id !== id),
    });
    setSelectedSticker(null);
  };

  vUseEffect(() => {
    const onEsc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  return (
    <div className="lightbox" onClick={() => setSelectedSticker(null)}>
      <div className="lb-stage" onClick={(e) => { if (e.target === e.currentTarget) setSelectedSticker(null); }}>
        <div className="lb-photo" ref={stageRef} onClick={(e) => e.stopPropagation()}>
          <PhotoPh seed={seed} label={`${photoLabel(seed)} · stardust diary`} />
          {stickersHere.map(s => (
            <PlacedSticker
              key={s.id} data={s}
              selected={selectedSticker === s.id}
              onSelect={setSelectedSticker}
              onChange={updateSticker}
              onDelete={deleteSticker}
              containerRef={stageRef}
            />
          ))}
        </div>
      </div>
      <aside className="lb-side" onClick={(e) => e.stopPropagation()}>
        <div className="head">
          <h3>{photoLabel(seed)}</h3>
          <span className="chip">{stickersHere.length} stickers</span>
          <button className="lb-close" onClick={onClose}><Icon.close /></button>
        </div>
        <div className="tabs">
          <button className={tab === "stickers" ? "on" : ""} onClick={() => setTab("stickers")}>貼貼紙</button>
          <button className={tab === "comments" ? "on" : ""} onClick={() => setTab("comments")}>留言 · {MOCK_COMMENTS.length}</button>
        </div>
        {tab === "stickers" ? (
          <div className="pane">
            <StickerPanel
              activePack={activePack}
              setActivePack={setActivePack}
              onPickSticker={addSticker}
              selectedStickerId={null}
            />
          </div>
        ) : (
          <CommentsList />
        )}
      </aside>
    </div>
  );
}

// ────────────────────────────────────────
// UPLOAD MODAL
// ────────────────────────────────────────
function UploadModal({ onClose }) {
  const [step, setStep] = vUseState(0); // 0 select files, 1 details, 2 done
  const [files, setFiles] = vUseState([]);
  const [hot, setHot] = vUseState(false);
  const [albumChoice, setAlbumChoice] = vUseState(ALBUMS[0].id);
  const [caption, setCaption] = vUseState("");

  // Pretend uploads: simulate drop adding placeholder previews
  const addFakeFiles = (n = 4) => {
    const next = [...files];
    for (let i = 0; i < n; i++) {
      next.push({ id: `f${Date.now()}-${i}`, seed: Math.floor(Math.random() * 12) });
    }
    setFiles(next);
  };

  const onDrop = (e) => {
    e.preventDefault(); setHot(false);
    addFakeFiles(3);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>上傳照片</h2>
          <span className="mono muted">UPLOAD · STEP {step + 1} / 3</span>
          <button className="btn icon ghost" onClick={onClose}><Icon.close /></button>
        </div>
        <div className="modal-steps">
          {["選擇檔案", "設定資訊", "完成"].map((lbl, i) => (
            <div key={i} className={`step ${step === i ? "on" : ""} ${step > i ? "done" : ""}`}>
              <div className="bar" />
              <div className="lbl">{String(i + 1).padStart(2, "0")} · {lbl}</div>
            </div>
          ))}
        </div>

        <div className="modal-body">
          {step === 0 && (
            <>
              <div
                className={`drop-zone ${hot ? "hot" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setHot(true); }}
                onDragLeave={() => setHot(false)}
                onDrop={onDrop}
                onClick={() => addFakeFiles(4)}
              >
                <div className="icon">✦</div>
                <h3>把照片拖到這裡</h3>
                <p>支援 JPG, PNG, HEIC · 單張上限 12 MB · 一次最多 30 張</p>
                <div className="or">— 或 —</div>
                <button className="btn primary"><Icon.plus /> 選擇檔案</button>
              </div>

              {files.length > 0 && (
                <div className="upload-preview-grid">
                  {files.map((f, i) => (
                    <div className="preview" key={f.id}>
                      <PhotoPh seed={f.seed} label={`NEW ${String(i + 1).padStart(2, "0")}`} />
                      <button className="x" onClick={() => setFiles(files.filter(x => x.id !== f.id))}>
                        <Icon.close />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 1 && (
            <>
              <div className="form-row">
                <label>選擇相簿</label>
                <select value={albumChoice} onChange={(e) => setAlbumChoice(e.target.value)}>
                  {ALBUMS.map(a => <option key={a.id} value={a.id}>{a.title} · {a.titleEn}</option>)}
                  <option value="__new">＋ 建立新相簿…</option>
                </select>
              </div>
              <div className="form-row">
                <label>說明 (optional)</label>
                <textarea rows="3" placeholder="這次想說的話…" value={caption} onChange={(e) => setCaption(e.target.value)} />
              </div>
              <div className="form-row">
                <label>誰可以貼貼紙？</label>
                <div className="row" style={{ gap: 8 }}>
                  <button className="chip active">所有人</button>
                  <button className="chip">只有粉絲俱樂部</button>
                  <button className="chip">只有我</button>
                </div>
              </div>
              <div className="row" style={{ gap: 8, marginTop: 8 }}>
                <span className="mono muted">{files.length} 張準備上傳</span>
              </div>
            </>
          )}

          {step === 2 && (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ width: 64, height: 64, borderRadius: 999, background: "var(--pink-soft)",
                margin: "0 auto 18px", display: "grid", placeItems: "center" }}>
                <Icon.check />
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 28, margin: "0 0 8px", fontWeight: 400 }}>上傳完成 ✦</h3>
              <p className="muted" style={{ margin: "0 0 4px" }}>{files.length} 張照片已加入「{ALBUMS.find(a => a.id === albumChoice).title}」</p>
              <p className="mono muted" style={{ fontSize: 10 }}>FANS NOTIFIED · 23 SUBSCRIBERS</p>
            </div>
          )}
        </div>

        <div className="modal-foot">
          {step > 0 && step < 2 && (
            <button className="btn ghost" onClick={() => setStep(step - 1)}><Icon.arrowL /> 上一步</button>
          )}
          <div className="spacer" />
          {step === 0 && (
            <button className="btn primary" disabled={files.length === 0}
              style={{ opacity: files.length === 0 ? 0.4 : 1 }}
              onClick={() => files.length && setStep(1)}>
              下一步 · {files.length} 張
            </button>
          )}
          {step === 1 && (
            <button className="btn pink" onClick={() => setStep(2)}>
              <Icon.upload /> 開始上傳
            </button>
          )}
          {step === 2 && (
            <button className="btn primary" onClick={onClose}>完成</button>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HomeView, AlbumView, BookView, Lightbox, UploadModal });
