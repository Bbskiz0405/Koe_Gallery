// Views for KOE album site — BookView, Lightbox, Upload modal
const { useState: vUseState, useEffect: vUseEffect, useRef: vUseRef } = React;

// ────────────────────────────────────────
// BOOK VIEW
// ────────────────────────────────────────
function BookView({ album, layout, setLayout, onClose, onUpload, onOpenPhoto, photoStickerCounts, photosMap, getPhotoKey }) {
  const [editing, setEditing] = vUseState(false);
  const [order, setOrder]     = vUseState(album.photoSeed);
  const dragIdx = vUseRef(null);

  const COLLAGE_POSITIONS = [
    { top: "5%",  left: "12%", size: 220, rot: -6 },
    { top: "8%",  left: "42%", size: 180, rot:  4 },
    { top: "12%", left: "70%", size: 240, rot: -3 },
    { top: "35%", left: "8%",  size: 200, rot:  5 },
    { top: "38%", left: "36%", size: 260, rot: -2 },
    { top: "42%", left: "68%", size: 200, rot:  7 },
    { top: "65%", left: "16%", size: 220, rot: -4 },
    { top: "70%", left: "44%", size: 180, rot:  3 },
    { top: "68%", left: "70%", size: 240, rot: -5 },
    { top: "88%", left: "50%", size: 200, rot:  2 },
  ];

  const collageRef  = vUseRef(null);
  const [collagePos, setCollagePos] = vUseState(() => {
    try { return JSON.parse(localStorage.getItem("koe-collage-pos-" + album.id) || "{}"); }
    catch (e) { return {}; }
  });

  const collagePosFor = (seed, i) => collagePos[seed] || {
    leftPct: parseFloat(COLLAGE_POSITIONS[i].left),
    topPct:  parseFloat(COLLAGE_POSITIONS[i].top),
  };

  const onCollageDown = (seed, i) => (e) => {
    if (!editing) return;
    e.preventDefault(); e.stopPropagation();
    const rect = collageRef.current.getBoundingClientRect();
    const cur  = collagePosFor(seed, i);
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    const move = (ev) => {
      const r = collageRef.current.getBoundingClientRect();
      const nx = Math.max(3, Math.min(97, ((ev.clientX - r.left) / r.width) * 100 - (xPct - cur.leftPct)));
      const ny = Math.max(3, Math.min(97, ((ev.clientY - r.top) / r.height) * 100 - (yPct - cur.topPct)));
      setCollagePos(prev => ({ ...prev, [seed]: { leftPct: nx, topPct: ny } }));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setCollagePos(prev => {
        try { localStorage.setItem("koe-collage-pos-" + album.id, JSON.stringify(prev)); } catch (e) {}
        return prev;
      });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

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

  // sticker count helper using real photo ID when available
  const stickerCount = (seed) => photoStickerCounts[getPhotoKey ? getPhotoKey(seed) : `${album.id}:${seed}`] || 0;

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
            <button className={layout === "book"    ? "on" : ""} onClick={() => setLayout("book")}>翻頁</button>
            <button className={layout === "collage" ? "on" : ""} onClick={() => setLayout("collage")}>拼貼</button>
            <button className={layout === "polaroid"? "on" : ""} onClick={() => setLayout("polaroid")}>拍立得</button>
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
          <span className="mono">{layout === "collage" ? "編輯模式 · 拖曳照片自由擺放" : "編輯模式 · 拖曳照片重新排序"}</span>
        </div>
      )}

      {layout === "book" && (
        <FlipBook
          album={{ ...album, photoSeed: order }}
          onOpenPhoto={onOpenPhoto}
          photoStickerCounts={photoStickerCounts}
          photosMap={photosMap}
        />
      )}

      {layout === "polaroid" && (
        <div className="polaroids" style={{ padding: "0 36px" }}>
          {order.map((seed, i) => (
            <div key={`${album.id}-${seed}-${i}-p`} className="photo" onClick={() => onOpenPhoto(seed)}>
              <div className="tape" />
              <div className="ph-frame">
                <PhotoPh seed={seed} url={photosMap?.[seed]?.url} />
              </div>
              <div
                className="cap editable"
                contentEditable suppressContentEditableWarning spellCheck={false}
                data-ph="寫點什麼…"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onBlur={(e) => saveCap(seed, e.currentTarget.textContent.trim())}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); } }}
              >{capText(seed)}</div>
              {stickerCount(seed) > 0 && <div className="sticker-count">✦ {stickerCount(seed)}</div>}
            </div>
          ))}
        </div>
      )}

      {layout === "collage" && (
        <div className={`collage ${editing ? "editing" : ""}`} ref={collageRef}>
          {order.slice(0, 10).map((seed, i) => {
            const p   = COLLAGE_POSITIONS[i];
            const pos = collagePosFor(seed, i);
            const cnt = stickerCount(seed);
            return (
              <div key={`${album.id}-${seed}-${i}-c`} className="photo"
                style={{
                  top: `${pos.topPct}%`, left: `${pos.leftPct}%`,
                  width: p.size, height: p.size + 50,
                  transform: `translate(-50%, -50%) rotate(${editing ? 0 : p.rot}deg)`,
                  zIndex: 10 - Math.abs(p.rot),
                  touchAction: editing ? "none" : "auto",
                }}
                onPointerDown={onCollageDown(seed, i)}
                onClick={() => { if (!editing) onOpenPhoto(seed); }}
              >
                <div className="ph-frame">
                  <PhotoPh seed={seed} url={photosMap?.[seed]?.url} />
                </div>
                <div className="cap">{photoLabel(seed)} · {POLAROID_CAPS[seed % POLAROID_CAPS.length]}</div>
                {cnt > 0 && <div className="sticker-count">✦ {cnt}</div>}
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
// LIGHTBOX
// ────────────────────────────────────────
function Lightbox({ photoKey, seed, photoUrl, photoDbId, stickers: placedStickers, setPlacedStickers, onClose }) {
  const [tab, setTab]                   = vUseState("stickers");
  const [activePack, setActivePack]     = vUseState("koe");
  const [selectedSticker, setSelectedSticker] = vUseState(null);
  const stageRef = vUseRef(null);

  const stickersHere = placedStickers[photoKey] || [];

  const addSticker = (template) => {
    const id = `s${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newSticker = {
      id, packId: template.packId || activePack, stickerId: template.id,
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
          <PhotoPh seed={seed} url={photoUrl} label={`${photoLabel(seed)} · stardust diary`} />
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
          <h3>{photoUrl ? "FANART" : photoLabel(seed)}</h3>
          <span className="chip">{stickersHere.length} stickers</span>
          <button className="lb-close" onClick={onClose}><Icon.close /></button>
        </div>
        <div className="tabs">
          <button className={tab === "stickers" ? "on" : ""} onClick={() => setTab("stickers")}>貼貼紙</button>
          <button className={tab === "comments" ? "on" : ""} onClick={() => setTab("comments")}>留言</button>
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
          <CommentsList photoId={photoDbId || `seed-${seed}`} />
        )}
      </aside>
    </div>
  );
}

// ────────────────────────────────────────
// UPLOAD MODAL (real Firebase Storage upload)
// ────────────────────────────────────────
function UploadModal({ onClose }) {
  const [step, setStep]     = vUseState(0);
  const [files, setFiles]   = vUseState([]);
  const [hot, setHot]       = vUseState(false);
  const [caption, setCaption] = vUseState("");
  const [uploading, setUploading] = vUseState(false);
  const [progress, setProgress]   = vUseState({});
  const fileInputRef = vUseRef(null);

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList)
      .filter(f => f.type.startsWith("image/"))
      .map(f => ({
        id:      `f${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        file:    f,
        preview: URL.createObjectURL(f),
        name:    f.name,
      }));
    setFiles(prev => [...prev, ...incoming].slice(0, 30));
  };

  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id));

  const onDrop = (e) => {
    e.preventDefault();
    setHot(false);
    addFiles(e.dataTransfer.files);
  };

  const doUpload = async () => {
    setUploading(true);
    for (const { file, id } of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._\-]/g, "_");
      const ref = storage.ref(`photos/${Date.now()}_${safeName}`);
      try {
        await new Promise((resolve, reject) => {
          const task = ref.put(file);
          task.on("state_changed",
            snap => {
              const pct = Math.round(snap.bytesTransferred / snap.totalBytes * 100);
              setProgress(prev => ({ ...prev, [id]: pct }));
            },
            reject,
            resolve
          );
        });
        const url = await ref.getDownloadURL();
        await db.collection("photos").add({
          url,
          caption: caption || "",
          uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      } catch (err) {
        console.error("Upload error:", err);
      }
    }
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
              <div className="bar" />
              <div className="lbl">{String(i + 1).padStart(2, "0")} · {lbl}</div>
            </div>
          ))}
        </div>

        <div className="modal-body">
          {step === 0 && (
            <>
              <input
                type="file" accept="image/*" multiple
                ref={fileInputRef} style={{ display: "none" }}
                onChange={(e) => addFiles(e.target.files)}
              />
              <div
                className={`drop-zone ${hot ? "hot" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setHot(true); }}
                onDragLeave={() => setHot(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
              >
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
                      <button className="x" onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}>
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
                <label>說明 (optional)</label>
                <textarea rows="3" placeholder="這次想說的話…" value={caption} onChange={(e) => setCaption(e.target.value)} />
              </div>
              <div className="form-row">
                <label>上傳權限</label>
                <div className="row" style={{ gap: 8 }}>
                  <button className="chip active">所有人 · 無需登入</button>
                </div>
              </div>
              {uploading && (
                <div style={{ marginTop: 16 }}>
                  {files.map(f => (
                    <div key={f.id} style={{ marginBottom: 10 }}>
                      <div className="mono muted" style={{ fontSize: 10, marginBottom: 4 }}>{f.name}</div>
                      <div style={{ height: 4, background: "var(--line)", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{
                          width: `${progress[f.id] || 0}%`, height: "100%",
                          background: "linear-gradient(90deg, var(--pink), var(--lav))",
                          borderRadius: 999, transition: "width .2s"
                        }} />
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
              <div style={{ width: 64, height: 64, borderRadius: 999, background: "var(--pink-soft)",
                margin: "0 auto 18px", display: "grid", placeItems: "center" }}>
                <Icon.check />
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 28, margin: "0 0 8px", fontWeight: 400 }}>上傳完成 ✦</h3>
              <p className="muted" style={{ margin: "0 0 4px" }}>{files.length} 張照片已加入紀念冊</p>
              <p className="mono muted" style={{ fontSize: 10 }}>ALL VISITORS CAN NOW SEE YOUR FANART</p>
            </div>
          )}
        </div>

        <div className="modal-foot">
          {step > 0 && step < 2 && !uploading && (
            <button className="btn ghost" onClick={() => setStep(step - 1)}><Icon.arrowL /> 上一步</button>
          )}
          <div className="spacer" />
          {step === 0 && (
            <button className="btn primary"
              disabled={files.length === 0}
              style={{ opacity: files.length === 0 ? 0.4 : 1 }}
              onClick={() => files.length && setStep(1)}>
              下一步 · {files.length} 張
            </button>
          )}
          {step === 1 && !uploading && (
            <button className="btn pink" onClick={doUpload}><Icon.upload /> 開始上傳</button>
          )}
          {step === 1 && uploading && (
            <button className="btn" disabled>上傳中…</button>
          )}
          {step === 2 && (
            <button className="btn primary" onClick={onClose}>完成</button>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BookView, Lightbox, UploadModal });
