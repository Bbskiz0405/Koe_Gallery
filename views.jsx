// Views for KOE album site — BookView, Lightbox, Upload modal
const { useState: vUseState, useEffect: vUseEffect, useRef: vUseRef } = React;

// ── Feature gates ──────────────────────────────────────────────
// Launch-day kill switch: flip to false to hide editing/upload site-wide.
// Hiding ONLY affects the UI — every photo & sticker already in Firebase
// stays exactly where it is, and turning a flag back to true brings the
// buttons (and the data) right back.
const EDIT_ENABLED     = true;  // 排版 / 加一頁 / 加照片 / 刪除這張
const STICKERS_ENABLED = true;  // ✦ 貼紙（可獨立保留，與上面互不影響）

// ────────────────────────────────────────
// BOOK VIEW
// ────────────────────────────────────────
function BookView({ album, layout, setLayout, onClose, onUpload, onOpenPhoto,
                    placedStickers, setPlacedStickers, photosMap, getPhotoKey,
                    photos, collagePages, onPageChange, onUpdatePhoto, onPersistPhoto,
                    onDeletePhoto, onAddPage }) {

  const [editing, setEditing]   = vUseState(false);
  const [selectedPhoto, setSelectedPhoto] = vUseState(null);
  const [order, setOrder]       = vUseState(album.photoSeed);

  // ── mobile: collapse the controls row behind one "工具" button ──
  const [toolsOpen, setToolsOpen]     = vUseState(false);

  // ── quick sticker bar ──
  const [showBar, setShowBar]         = vUseState(false);
  const [barPack, setBarPack]         = vUseState("koe");
  const [quickSticker, setQuickSticker] = vUseState(null); // selected template


  const [polaroidCaps, setPolaroidCaps] = vUseState(() => {
    try { return JSON.parse(localStorage.getItem("koe-polaroid-caps-" + album.id) || "{}"); }
    catch (e) { return {}; }
  });
  const capText = (seed) => (seed in polaroidCaps) ? polaroidCaps[seed] : POLAROID_CAPS[seed % POLAROID_CAPS.length];
  const saveCap = (seed, text) => {
    setPolaroidCaps(prev => {
      const next = { ...prev, [seed]: text };
      try { localStorage.setItem("koe-polaroid-caps-" + album.id, JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  const dragIdx = vUseRef(null);
  vUseEffect(() => { setOrder(album.photoSeed); }, [album.id, album.photoSeed.join(",")]);

  const onDragStart = (i) => () => { dragIdx.current = i; };
  const onDragOver  = (i) => (e) => { e.preventDefault(); };
  const onDrop      = (i) => (e) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === i) return;
    const next = [...order];
    const [moved] = next.splice(dragIdx.current, 1);
    next.splice(i, 0, moved);
    setOrder(next);
    dragIdx.current = null;
  };

  // ── place sticker or open lightbox ──
  const handlePhotoClick = (seed) => {
    if (quickSticker) {
      const key = getPhotoKey ? getPhotoKey(seed) : `${album.id}:${seed}`;
      // free-text sticker → ask the visitor what to write
      let customText = null;
      if (quickSticker.custom) {
        const t = window.prompt("輸入想對 KOE 說的話 / 文字：");
        if (t === null || !t.trim()) { setQuickSticker(null); return; }
        customText = t.trim().slice(0, 40);
      }
      const newSticker = {
        id:       `s${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        packId:   barPack,
        stickerId: quickSticker.id,
        ...(quickSticker.custom ? { custom: true, text: customText } : {}),
        render:   quickSticker.custom ? () => <TextSticker text={customText} /> : quickSticker.render,
        w: quickSticker.w, h: quickSticker.h,
        x: 40 + Math.random() * 20,
        y: 40 + Math.random() * 20,
        rot:   (Math.random() - 0.5) * 20,
        scale: 0.65,
      };
      const prev = placedStickers[key] || [];
      const next = [...prev, newSticker];
      setPlacedStickers(cur => ({ ...cur, [key]: next }));
      persistStickers(key, next);
      setQuickSticker(null);
    } else {
      onOpenPhoto(seed);
    }
  };

  // stickers for a seed in non-flipbook views
  const stickersFor = (seed) => {
    const key = getPhotoKey ? getPhotoKey(seed) : `${album.id}:${seed}`;
    return placedStickers[key] || [];
  };

  // ── page-level sticker board (stickers placed on the album page, not a photo) ──
  const persistStickers = (key, list) => {
    const safe = list.map(({ render, ...r }) => r);
    db.collection("stickers").doc(key).set({ stickers: safe }).catch(console.error);
  };
  const buildSticker = (x, y) => {
    let customText = null;
    if (quickSticker.custom) {
      const t = window.prompt("輸入想對 KOE 說的話 / 文字：");
      if (t === null || !t.trim()) return null;
      customText = t.trim().slice(0, 40);
    }
    return {
      id: `s${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      packId: barPack, stickerId: quickSticker.id,
      ...(quickSticker.custom ? { custom: true, text: customText } : {}),
      render: quickSticker.custom ? () => <TextSticker text={customText} /> : quickSticker.render,
      w: quickSticker.w, h: quickSticker.h,
      x, y, rot: (Math.random() - 0.5) * 14, scale: 0.9,
    };
  };
  const placeBoardSticker = (boardKey, x, y) => {
    if (!quickSticker) return;
    const s = buildSticker(x, y);
    if (!s) { setQuickSticker(null); return; }
    const next = [...(placedStickers[boardKey] || []), s];
    setPlacedStickers(cur => ({ ...cur, [boardKey]: next }));
    persistStickers(boardKey, next);
    setQuickSticker(null);
  };
  const changeBoardSticker = (boardKey, id, patch) => {
    setPlacedStickers(cur => ({
      ...cur,
      [boardKey]: (cur[boardKey] || []).map(s => s.id === id ? { ...s, ...patch } : s),
    }));
  };
  const commitBoardSticker = (boardKey) => {
    setPlacedStickers(cur => { persistStickers(boardKey, cur[boardKey] || []); return cur; });
  };
  const deleteBoardSticker = (boardKey, id) => {
    const next = (placedStickers[boardKey] || []).filter(s => s.id !== id);
    setPlacedStickers(cur => ({ ...cur, [boardKey]: next }));
    persistStickers(boardKey, next);
  };
  const boardProps = {
    placing: !!quickSticker, editing,
    onPlace: placeBoardSticker, onChange: changeBoardSticker,
    onCommit: commitBoardSticker, onDelete: deleteBoardSticker,
  };

  return (
    <div className="book-view" data-screen-label="02 Book Open">
      <button className="book-close-btn" onClick={onClose}>
        <Icon.arrowL /> 合上紀念冊
      </button>

      {/* ── top bar ── */}
      <div className="book-view-top">
        <div className="brand">
          <div className="b-mark"><em>心咲</em><span className="b-koe">KØE</span></div>
          <div className="b-sub">memorial · echo collection · vol. 01</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          {/* View switch — always visible (not an editing tool) */}
          <div className="layout-switch">
            <button className={layout === "book"    ? "on" : ""} onClick={() => setLayout("book")}>翻頁</button>
            <button className={layout === "polaroid"? "on" : ""} onClick={() => setLayout("polaroid")}>拍立得</button>
          </div>

          {/* Mobile-only trigger: collapses the editing tools behind one button */}
          {(EDIT_ENABLED || STICKERS_ENABLED) && (
            <button className={`btn tools-toggle ${toolsOpen ? "primary" : ""}`}
              onClick={() => setToolsOpen(v => !v)} title="展開編輯工具">
              {toolsOpen ? <Icon.close /> : <Icon.edit />} {toolsOpen ? "收起" : "工具"}
            </button>
          )}

          {/* Editing tools — inline on desktop, collapsible drawer on mobile */}
          <div className={`tools-group ${toolsOpen ? "open" : ""}`}>
            {STICKERS_ENABLED && (
              <button
                className={`btn ${showBar ? "pink" : ""}`}
                onClick={() => { setShowBar(v => !v); setQuickSticker(null); }}
                title="直接在書頁貼貼紙"
              >
                ✦ 貼紙
              </button>
            )}
            {EDIT_ENABLED && (
              <button className={`btn ${editing ? "primary" : ""}`} onClick={() => { setEditing(!editing); setSelectedPhoto(null); }}>
                <Icon.edit /> {editing ? "完成" : "排版"}
              </button>
            )}
            {EDIT_ENABLED && editing && layout === "book" && selectedPhoto !== null && photosMap?.[selectedPhoto] && (
              <button className="btn pink" title="刪除目前選取的照片"
                onClick={() => {
                  if (!window.confirm("確定要刪除這張照片嗎？此動作無法復原。")) return;
                  onDeletePhoto(photosMap[selectedPhoto].id);
                  setSelectedPhoto(null);
                }}>
                <Icon.close /> 刪除這張
              </button>
            )}
            {EDIT_ENABLED && layout === "book" && (
              <button className="btn" onClick={onAddPage} title="在書末新增一頁空白拼貼頁">＋ 加一頁</button>
            )}
            {EDIT_ENABLED && (
              <button className="btn pink" onClick={onUpload}><Icon.upload /> 加照片</button>
            )}
          </div>
        </div>
      </div>

      {/* ── quick sticker bar ── */}
      {showBar && (
        <div style={{
          background: "rgba(255,250,245,0.95)", backdropFilter: "blur(12px)",
          border: "1px solid var(--line-strong)", borderRadius: "var(--radius-lg)",
          padding: "10px 16px", marginBottom: 12,
          display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap",
        }}>
          {/* pack tabs */}
          <div style={{ display: "flex", gap: 4 }}>
            {PACK_ORDER.map(p => (
              <button key={p} className={p === barPack ? "chip active" : "chip"}
                style={{ fontSize: 9 }} onClick={() => setBarPack(p)}>
                {STICKER_PACKS[p].label}
              </button>
            ))}
          </div>
          {/* sticker items */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
            {STICKER_PACKS[barPack].items.map(s => {
              const R = s.render;
              const on = quickSticker?.id === s.id;
              return (
                <button key={s.id} className="qbar-sticker"
                  onClick={() => setQuickSticker(on ? null : s)}
                  style={{
                    border: `1.5px solid ${on ? "var(--pink-deep)" : "var(--line)"}`,
                    background: on ? "var(--pink-soft)" : "var(--surface)",
                    transform: on ? "scale(1.12)" : "scale(1)",
                  }}>
                  <R />
                </button>
              );
            })}
          </div>
          {quickSticker ? (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--pink-deep)", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
              點頁面任意處貼上 ↓
            </span>
          ) : (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-mute)", letterSpacing: "0.1em" }}>
              選貼紙 → 點頁面貼上
            </span>
          )}
          <button className="btn ghost btn icon" onClick={() => { setShowBar(false); setQuickSticker(null); }}>
            <Icon.close />
          </button>
        </div>
      )}

      {editing && (
        <div className="edit-banner">
          <div className="dot" />
          <span className="mono">
            {layout === "book" ? "編輯模式 · 拖曳照片擺放，↻ 角落旋轉縮放，✕ 或上方「刪除這張」移除"
              : "編輯模式 · 拖曳照片重新排序"}
          </span>
        </div>
      )}

      {/* ── layouts ── */}
      {layout === "book" && (
        <FlipBook
          album={{ ...album, photoSeed: order }}
          onOpenPhoto={handlePhotoClick}
          photosMap={photosMap}
          placedStickers={placedStickers}
          getPhotoKey={getPhotoKey}
          photos={photos}
          collagePages={collagePages}
          onPageChange={onPageChange}
          editing={editing}
          selectedPhoto={selectedPhoto}
          onSelectPhoto={setSelectedPhoto}
          onUpdatePhoto={onUpdatePhoto}
          onPersistPhoto={onPersistPhoto}
          onDeletePhoto={onDeletePhoto}
          quickSticker={quickSticker}
          onPlaceBoard={placeBoardSticker}
          onChangeBoard={changeBoardSticker}
          onCommitBoard={commitBoardSticker}
          onDeleteBoard={deleteBoardSticker}
        />
      )}

      {layout === "polaroid" && (
        <div className="album-board-wrap">
          <div className="polaroids" style={{ padding: "0 36px" }}>
            {order.map((seed, i) => {
              const stickers = stickersFor(seed);
              return (
                <div key={`${album.id}-${seed}-${i}-p`} className="photo"
                  onClick={() => handlePhotoClick(seed)}
                  style={{ cursor: quickSticker ? "crosshair" : "pointer" }}>
                  <div className="tape" />
                  <div className="ph-frame" style={{ position: "relative" }}>
                    <PhotoPh seed={seed} url={photosMap?.[seed]?.url} />
                    {stickers.length > 0 && (
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
                  <div className="cap">{photosMap?.[seed]?.caption ?? capText(seed)}</div>
                  {stickers.length > 0 && <div className="sticker-count">✦ {stickers.length}</div>}
                </div>
              );
            })}
          </div>
          <StickerBoard boardKey={`${album.id}::polaroid`}
            stickers={placedStickers[`${album.id}::polaroid`] || []} {...boardProps} />
        </div>
      )}

    </div>
  );
}

// ────────────────────────────────────────
// LIGHTBOX
// ────────────────────────────────────────
function Lightbox({ seed, photoUrl, stickers = [], onDeleteSticker, onClose }) {
  vUseEffect(() => {
    const onEsc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  return (
    <div className="lightbox lightbox-zoom" onClick={onClose}>
      <button className="lb-close-float" onClick={onClose}><Icon.close /></button>
      <div className="lb-stage" onClick={onClose}>
        <div className="lb-photo" onClick={(e) => e.stopPropagation()}>
          {photoUrl
            ? <img src={photoUrl} alt="" />
            : <div className="photo-ph" style={{ width: "60vw", height: "70vh", background: gradientFor(seed) }} />}
          {stickers.map(s => { const R = s.render; return R ? (
            <div key={s.id} className="placed-mini lb-sticker"
              style={{ position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
                       transform: `translate(-50%,-50%) rotate(${s.rot}deg) scale(${s.scale})` }}>
              <R />
              {onDeleteSticker && (
                <button className="lb-sticker-del" title="移除這個貼紙"
                  onClick={(e) => { e.stopPropagation(); onDeleteSticker(s.id); }}>
                  <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 2 L 8 8 M 8 2 L 2 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                </button>
              )}
            </div>
          ) : null; })}
        </div>
        {stickers.length > 0 && onDeleteSticker && (
          <div className="lb-sticker-hint">點貼紙右上角的 ✕ 可移除</div>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────
// UPLOAD MODAL
// ────────────────────────────────────────
function UploadModal({ onClose, pageOptions = { pages: [{ cindex: 0, side: "左頁", num: 1 }], primary: 0 } }) {
  const pageOpts = (pageOptions.pages && pageOptions.pages.length)
    ? pageOptions.pages : [{ cindex: 0, side: "左頁", num: 1 }];
  const [targetPage, setTargetPage] = vUseState(pageOptions.primary ?? pageOpts[0].cindex);
  const [step, setStep]     = vUseState(0);
  const [files, setFiles]   = vUseState([]);
  const [hot, setHot]       = vUseState(false);
  const [caption, setCaption] = vUseState("");
  const [uploading, setUploading] = vUseState(false);
  const [progress, setProgress]   = vUseState({});
  const [result, setResult]       = vUseState({ ok: 0, errors: [] });
  const fileInputRef = vUseRef(null);

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList)
      .filter(f => f.type.startsWith("image/"))
      .map(f => ({
        id: `f${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        file: f, preview: URL.createObjectURL(f), name: f.name,
      }));
    setFiles(prev => [...prev, ...incoming].slice(0, 30));
  };

  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id));

  const onDrop = (e) => { e.preventDefault(); setHot(false); addFiles(e.dataTransfer.files); };

  const doUpload = async () => {
    setUploading(true);
    let n = 0;
    const errors = [];
    for (const { file, id } of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._\-]/g, "_");
      const ref = storage.ref(`photos/${Date.now()}_${safeName}`);
      try {
        await new Promise((resolve, reject) => {
          const task = ref.put(file);
          task.on("state_changed",
            snap => setProgress(prev => ({ ...prev, [id]: Math.round(snap.bytesTransferred / snap.totalBytes * 100) })),
            reject, resolve
          );
        });
        const url = await ref.getDownloadURL();
        await db.collection("photos").add({
          url, caption: caption || "",
          page: targetPage,
          x: 42 + (n % 3) * 8, y: 42 + (Math.floor(n / 3) % 3) * 8,
          rot: 0, scale: 1,
          uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        n++;
      } catch (err) {
        console.error("Upload error:", err);
        errors.push(`${file.name}：${(err && err.message) || err}`);
      }
    }
    setResult({ ok: n, errors });
    setUploading(false);
    setStep(2);
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
              <div className="bar" /><div className="lbl">{String(i + 1).padStart(2, "0")} · {lbl}</div>
            </div>
          ))}
        </div>
        <div className="modal-body">
          {step === 0 && (
            <>
              <input type="file" accept="image/*" multiple ref={fileInputRef}
                style={{ display: "none" }} onChange={(e) => addFiles(e.target.files)} />
              <div className={`drop-zone ${hot ? "hot" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setHot(true); }}
                onDragLeave={() => setHot(false)} onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}>
                <div className="icon">✦</div>
                <h3>把照片拖到這裡</h3>
                <p>支援 JPG, PNG, HEIC · 單張上限 12 MB · 一次最多 30 張</p>
                <div className="or">— 或 —</div>
                <button className="btn primary"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  <Icon.plus /> 選擇檔案
                </button>
              </div>
              {files.length > 0 && (
                <div className="upload-preview-grid">
                  {files.map((f) => (
                    <div className="preview" key={f.id}>
                      <img src={f.preview} alt={f.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button className="x" onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}><Icon.close /></button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {step === 1 && (
            <>
              <div className="form-row">
                <label>放到哪一頁</label>
                <div className="row" style={{ gap: 8 }}>
                  {pageOpts.map(o => (
                    <button key={o.cindex}
                      className={`chip ${targetPage === o.cindex ? "active" : ""}`}
                      onClick={() => setTargetPage(o.cindex)}>
                      {o.side}（P.{o.num}）
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-row">
                <label>標題</label>
                <input type="text" maxLength={40} placeholder="幫這張照片下一個標題…（會顯示在拍立得照片下方）"
                  value={caption} onChange={(e) => setCaption(e.target.value)} />
              </div>
              <div className="form-row">
                <label>上傳權限</label>
                <div className="row" style={{ gap: 8 }}><button className="chip active">所有人 · 無需登入</button></div>
              </div>
              {uploading && (
                <div style={{ marginTop: 16 }}>
                  {files.map(f => (
                    <div key={f.id} style={{ marginBottom: 10 }}>
                      <div className="mono muted" style={{ fontSize: 10, marginBottom: 4 }}>{f.name}</div>
                      <div style={{ height: 4, background: "var(--line)", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{ width: `${progress[f.id] || 0}%`, height: "100%",
                          background: "linear-gradient(90deg, var(--pink), var(--lav))",
                          borderRadius: 999, transition: "width .2s" }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="row" style={{ gap: 8, marginTop: 8 }}>
                <span className="mono muted">{files.length} 張準備上傳</span>
              </div>
            </>
          )}
          {step === 2 && (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ width: 64, height: 64, borderRadius: 999,
                background: result.errors.length ? "var(--peach)" : "var(--pink-soft)",
                color: result.errors.length ? "var(--pink-deep)" : "inherit",
                fontSize: 30, fontWeight: 600,
                margin: "0 auto 18px", display: "grid", placeItems: "center" }}>
                {result.errors.length ? "!" : <Icon.check />}
              </div>
              {result.ok > 0 && result.errors.length === 0 && (
                <>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 28, margin: "0 0 8px", fontWeight: 400 }}>上傳完成 ✦</h3>
                  <p className="muted" style={{ margin: "0 0 4px" }}>{result.ok} 張照片已加入紀念冊</p>
                  <p className="mono muted" style={{ fontSize: 10 }}>ALL VISITORS CAN NOW SEE YOUR FANART</p>
                </>
              )}
              {result.errors.length > 0 && (
                <>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 26, margin: "0 0 8px", fontWeight: 400 }}>
                    {result.ok > 0 ? "部分未成功" : "上傳失敗"}
                  </h3>
                  <p className="muted" style={{ margin: "0 0 10px" }}>
                    成功 {result.ok} 張 · 失敗 {result.errors.length} 張
                  </p>
                  <div className="mono muted" style={{ textAlign: "left", margin: "0 auto", maxWidth: 380, fontSize: 11, lineHeight: 1.6 }}>
                    {result.errors.map((e, i) => <div key={i} style={{ marginBottom: 4 }}>• {e}</div>)}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <div className="modal-foot">
          {step > 0 && step < 2 && !uploading && (
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
          {step === 1 && !uploading && (
            <button className="btn pink" onClick={doUpload}><Icon.upload /> 開始上傳</button>
          )}
          {step === 1 && uploading && <button className="btn" disabled>上傳中…</button>}
          {step === 2 && <button className="btn primary" onClick={onClose}>完成</button>}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BookView, Lightbox, UploadModal });
