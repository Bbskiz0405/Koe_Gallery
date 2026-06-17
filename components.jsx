// Shared components for KOE album site
const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ───── BRAND / NAV ─────
function Brand({ onClick }) {
  return (
    <div className="brand" onClick={onClick}>
      <div className="b-mark"><em>心咲</em>KOE</div>
      <div className="b-sub">album · 002</div>
    </div>
  );
}

// ───── PHOTO PLACEHOLDER ─────
// Shows a real image when `url` is provided, otherwise gradient placeholder.
function PhotoPh({ seed = 0, label, corner, url }) {
  if (url) {
    return (
      <div className="photo-ph" style={{ background: gradientFor(seed) }}>
        <img
          src={url} alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        {corner && <div className="corner">{corner}</div>}
      </div>
    );
  }
  return (
    <div className="photo-ph" style={{ background: gradientFor(seed) }}>
      <div className="stripe" />
      {corner && <div className="corner">{corner}</div>}
      <div className="lbl">{label || photoLabel(seed)}</div>
    </div>
  );
}

// ───── ICONS (tiny inline SVG) ─────
const Icon = {
  upload: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1 V 10 M3 5 L 7 1 L 11 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1 12 H 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  edit: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1 13 L 4 12 L 12 4 L 10 2 L 2 10 Z M 9 3 L 11 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  sticker: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 2 L 8 5.5 L 12 6 L 9 8.5 L 10 12 L 7 10 L 4 12 L 5 8.5 L 2 6 L 6 5.5 Z" fill="currentColor" />
    </svg>
  ),
  close: () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 2 L 10 10 M 10 2 L 2 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  arrowL: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M9 2 L 4 7 L 9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
  plus: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 2 V 12 M 2 7 H 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  check: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 7 L 6 11 L 12 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
};

// ───── HERO ART (homepage) ─────
function HeroArt() {
  return (
    <div className="hero-art">
      <div className="ring" />
      <div className="ring r2" />
      <div className="blob" />
      <div className="star s1">✦</div>
      <div className="star s2">✧</div>
      <div className="label">CHARACTER ART · DROP HERE</div>
    </div>
  );
}

// ───── ALBUM CARD ─────
function AlbumCard({ album, onOpen }) {
  return (
    <div className="album-card" onClick={onOpen}>
      <div className="cover">
        <div className="ph"><PhotoPh seed={album.cover} corner={album.id.toUpperCase()} /></div>
        <div className="floats">
          {album.tag === "fans" && (
            <div style={{ position: "absolute", top: "12%", right: "10%", transform: "rotate(-12deg)" }}>
              <stickers.StarTwinkle size={36} />
            </div>
          )}
          {album.tag === "live" && (
            <div style={{ position: "absolute", bottom: "12%", left: "10%", transform: "rotate(8deg)" }}>
              <stickers.Heart size={32} />
            </div>
          )}
        </div>
      </div>
      <div className="meta">
        <div>
          <h3>{album.title}</h3>
          <div className="tag">{album.titleEn}</div>
        </div>
        <div className="count">{String(album.count).padStart(2, "0")} 張</div>
      </div>
    </div>
  );
}

const stickers = {
  StarTwinkle: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M20 4 L22.5 17.5 L36 20 L22.5 22.5 L20 36 L17.5 22.5 L4 20 L17.5 17.5 Z"
        fill="#fef3c7" stroke="#1a1226" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  ),
  Heart: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M20 35 C 4 24, 4 8, 14 8 C 18 8, 20 12, 20 14 C 20 12, 22 8, 26 8 C 36 8, 36 24, 20 35 Z"
        fill="#f9a8d4" stroke="#1a1226" strokeWidth="1.4" />
    </svg>
  ),
};

// ───── PLACED STICKER (interactive: drag / rotate / scale) ─────
function PlacedSticker({ data, selected, onSelect, onChange, onDelete, containerRef }) {
  const Render = data.render;
  const startRef = useRef(null);

  const onPointerDown = (e, mode = "move") => {
    e.stopPropagation();
    onSelect(data.id);
    const rect = containerRef.current.getBoundingClientRect();
    startRef.current = {
      mode,
      startX: e.clientX, startY: e.clientY,
      startData: { ...data },
      containerRect: rect,
    };
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp, { once: true });
  };

  const onPointerMove = (e) => {
    const s = startRef.current; if (!s) return;
    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;
    if (s.mode === "move") {
      const newX = s.startData.x + (dx / s.containerRect.width) * 100;
      const newY = s.startData.y + (dy / s.containerRect.height) * 100;
      onChange(data.id, { x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) });
    } else if (s.mode === "rotate") {
      const cx = s.containerRect.left + (s.startData.x / 100) * s.containerRect.width;
      const cy = s.containerRect.top  + (s.startData.y / 100) * s.containerRect.height;
      const angle      = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
      const startAngle = Math.atan2(s.startY - cy, s.startX - cx) * 180 / Math.PI;
      const newRot = s.startData.rot + (angle - startAngle);
      const startDist = Math.hypot(s.startX - cx, s.startY - cy);
      const currDist  = Math.hypot(e.clientX - cx, e.clientY - cy);
      const newScale  = Math.max(0.4, Math.min(3, s.startData.scale * (currDist / Math.max(1, startDist))));
      onChange(data.id, { rot: newRot, scale: newScale });
    }
  };
  const onPointerUp = () => {
    document.removeEventListener("pointermove", onPointerMove);
    startRef.current = null;
  };

  return (
    <div
      className={`placed-sticker ${selected ? "selected" : ""}`}
      style={{
        left: `${data.x}%`, top: `${data.y}%`,
        transform: `translate(-50%, -50%) rotate(${data.rot}deg) scale(${data.scale})`,
        width: data.w, height: data.h,
      }}
      onPointerDown={(e) => onPointerDown(e, "move")}
    >
      <Render />
      {selected && (
        <>
          <button className="sticker-handle delete" onPointerDown={(e) => { e.stopPropagation(); onDelete(data.id); }}>
            <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 2 L 8 8 M 8 2 L 2 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
          </button>
          <div className="sticker-handle rotate" onPointerDown={(e) => onPointerDown(e, "rotate")}>↻</div>
        </>
      )}
    </div>
  );
}

// ───── STICKER PANEL (used inside Lightbox) ─────
function StickerPanel({ activePack, setActivePack, onPickSticker, selectedStickerId }) {
  return (
    <div className="sticker-panel">
      <div className="sticker-pack-tabs">
        {PACK_ORDER.map(p => (
          <button key={p} className={p === activePack ? "on" : ""} onClick={() => setActivePack(p)}>
            {STICKER_PACKS[p].label} · {STICKER_PACKS[p].labelEn}
          </button>
        ))}
      </div>
      <div className="sticker-grid">
        {STICKER_PACKS[activePack].items.map(s => {
          const R = s.render;
          return (
            <button
              key={s.id}
              className={`sticker-item ${selectedStickerId === s.id ? "selected" : ""}`}
              onClick={() => onPickSticker(s)}
              title={s.id}
            >
              <R />
            </button>
          );
        })}
      </div>
      <div className="hint">
        TAP a sticker → it appears on the photo. Drag to move. Use ↻ corner handle to rotate + resize. ✕ to delete.
      </div>
    </div>
  );
}

// ───── COMMENTS LIST (Firestore-backed) ─────
function CommentsList({ photoId }) {
  const [list, setList]   = useState([]);
  const [draft, setDraft] = useState("");

  // Real-time comments from Firestore
  useEffect(() => {
    if (!photoId) return;
    const unsub = db.collection("comments")
      .where("photoId", "==", photoId)
      .orderBy("createdAt", "asc")
      .onSnapshot(
        snap => {
          const items = snap.docs.map(doc => {
            const d = doc.data();
            const t = d.createdAt?.toDate?.();
            return {
              name:  d.name  || "ECHO",
              color: d.color || "#f9a8d4",
              time:  t ? t.toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "now",
              text:  d.text  || "",
            };
          });
          if (items.length > 0) setList(items);
        },
        err => console.error("Comments load:", err)
      );
    return unsub;
  }, [photoId]);

  const submit = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const colors = ["#f9a8d4", "#d4b8f2", "#fde7d4", "#fbcfe8"];
    db.collection("comments").add({
      photoId: photoId || "unknown",
      name:  "訪客 ECHO",
      color: colors[Math.floor(Math.random() * colors.length)],
      text:  draft.trim(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    }).catch(e => console.error("Post comment:", e));
    setDraft("");
  };

  return (
    <>
      <div className="pane">
        <div className="comments">
          {list.length === 0 ? (
            <div className="comments-empty">還沒有留言，留下第一則吧 ⟡</div>
          ) : list.map((c, i) => (
            <div className="comment" key={i}>
              <div className="avatar" style={{ background: c.color }}>{c.name[0]}</div>
              <div className="body">
                <div className="head">
                  <span className="name">{c.name}</span>
                  <span className="time">{c.time}</span>
                </div>
                <div className="text">{c.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <form className="comment-input" onSubmit={submit}>
        <input
          type="text"
          placeholder="留言給心咲KOE…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button className="btn primary" type="submit"><Icon.plus /></button>
      </form>
    </>
  );
}

Object.assign(window, {
  Brand, PhotoPh, Icon, HeroArt, AlbumCard,
  PlacedSticker, StickerPanel, CommentsList,
});
