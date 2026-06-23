// Main app — landing (closed book) ↔ open book
const { useState: aUseState, useEffect: aUseEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "coverOrientation": "floating",
  "defaultLayout": "book",
  "defaultPack": "koe",
  "showStarfield": true
}/*EDITMODE-END*/;

const MEMORIAL_BOOK = {
  id: "memorial",
  title: "心咲KOE",
  titleEn: "ECHO COLLECTION",
  tag: "memorial",
  count: 36,
  cover: 0,
  desc: "ECHO 們做給心咲KOE 的紀念冊。把回憶夾進書頁，貼上一朵雛菊、留下悄悄話。",
  photoSeed: [0, 4, 7, 2, 9, 3, 5, 11, 1, 8, 6, 10, 3, 5, 0, 8, 4, 11, 7, 2, 1, 10, 6, 9],
};

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [view, setView]       = aUseState("landing");
  const [handoff, setHandoff] = aUseState(false);
  const [closing, setClosing] = aUseState(false);
  const [layout, setLayout]   = aUseState(tweaks.defaultLayout || "book");
  const [lightbox, setLightbox]             = aUseState(null);
  const [uploadOpen, setUploadOpen]         = aUseState(false);
  const [placedStickers, setPlacedStickers] = aUseState({});
  const [photos, setPhotos]                 = aUseState([]);
  const [collagePages, setCollagePages]     = aUseState(4);
  const [pageOptions, setPageOptions] = aUseState({ pages: [{ cindex: 0, side: "左頁", num: 1 }], primary: 0 });
  const photosRef = React.useRef(photos);
  photosRef.current = photos;

  // load photos from Firestore in real-time
  aUseEffect(() => {
    const unsub = db.collection("photos")
      .orderBy("uploadedAt", "asc")
      .onSnapshot(
        snap => setPhotos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))),
        err  => console.error("Photos load error:", err)
      );
    return unsub;
  }, []);

  // load page count (shared) from Firestore
  aUseEffect(() => {
    const unsub = db.collection("meta").doc("memorial").onSnapshot(
      doc => { const d = doc.data(); if (d && typeof d.pages === "number") setCollagePages(d.pages); },
      err => console.error("Meta load error:", err)
    );
    return unsub;
  }, []);

  // ── freeform photo layout handlers (shared via Firestore) ──
  const updatePhotoLocal = (id, patch) =>
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));

  const persistPhoto = (id) => {
    const p = photosRef.current.find(x => x.id === id);
    if (!p) return;
    db.collection("photos").doc(id).update({
      page: p.page ?? 0, x: p.x ?? 50, y: p.y ?? 50, rot: p.rot ?? 0, scale: p.scale ?? 1,
    }).catch(e => console.error("Save photo layout:", e));
  };

  const deletePhoto = (id) =>
    db.collection("photos").doc(id).delete().catch(e => console.error("Delete photo:", e));

  // Add a full spread (兩頁) at a time, and keep the collage-page count even so
  // the desktop two-page view never ends on a half-empty spread.
  const addPage = () => {
    const maxP = photosRef.current.reduce((m, p) => Math.max(m, (p.page ?? 0)), 0);
    let next = Math.max(collagePages, maxP + 1) + 2;
    if (next % 2 !== 0) next += 1;
    setCollagePages(next);
    db.collection("meta").doc("memorial").set({ pages: next }, { merge: true })
      .catch(e => console.error("Add page:", e));
  };

  // Remove a full spread (兩頁) at a time, mirroring addPage — but never below
  // maxPhotoPage+1 so a page that still holds a photo can never be removed.
  const removePage = () => {
    const maxP = photosRef.current.reduce((m, p) => Math.max(m, (p.page ?? 0)), 0);
    const floor = Math.max(1, maxP + 1, LOCK_ENABLED ? LOCKED_PAGES : 0);
    const next = Math.max(floor, collagePages - 2);
    if (next === collagePages) return; // nothing safe to remove
    setCollagePages(next);
    db.collection("meta").doc("memorial").set({ pages: next }, { merge: true })
      .catch(e => console.error("Remove page:", e));
  };

  // load stickers from Firestore and reconstruct render functions
  aUseEffect(() => {
    const unsub = db.collection("stickers").onSnapshot(
      snap => {
        const data = {};
        snap.docs.forEach(doc => {
          const { stickers: items = [] } = doc.data();
          data[doc.id] = items.map(s => ({
            ...s,
            render: s.custom
              ? () => <TextSticker text={s.text} />
              : (STICKER_PACKS[s.packId]?.items.find(x => x.id === s.stickerId)?.render || (() => null)),
          }));
        });
        setPlacedStickers(data);
      },
      err => console.error("Stickers load error:", err)
    );
    return unsub;
  }, []);

  aUseEffect(() => { setLayout(tweaks.defaultLayout); }, [tweaks.defaultLayout]);

  // photosMap: sequential slot-index → Firestore photo object
  const photosMap = {};
  photos.forEach((photo, i) => { photosMap[i] = photo; });

  // enough pages to hold every photo's assigned page
  const maxPhotoPage = photos.reduce((m, p) => Math.max(m, (p.page ?? 0)), 0);
  const effectivePages = Math.max(collagePages, maxPhotoPage + 1);

  // when real photos exist, rewrite photoSeed as sequential indices
  const effectiveAlbum = photos.length > 0
    ? { ...MEMORIAL_BOOK, photoSeed: photos.map((_, i) => i), count: photos.length }
    : MEMORIAL_BOOK;

  // sticker key: prefer Firestore doc ID over seed-based fallback
  const getPhotoKey = (seed) => photosMap[seed]?.id || `${MEMORIAL_BOOK.id}:${seed}`;

  const photoStickerCounts = {};
  Object.entries(placedStickers).forEach(([k, arr]) => { photoStickerCounts[k] = arr.length; });

  const openBook = () => {
    setHandoff(true);
    setView("book");
    setTimeout(() => setHandoff(false), 1000);
  };
  const closeBook  = () => { if (!closing) setClosing(true); };
  const finishClose = () => { setClosing(false); setView("landing"); };
  const openPhoto  = (seed) => setLightbox({ albumId: MEMORIAL_BOOK.id, seed });

  const photoKey = lightbox ? getPhotoKey(lightbox.seed) : null;

  const closeLightbox = () => setLightbox(null);

  // remove a single placed sticker from a photo (state + Firestore)
  const deleteSticker = (key, stickerId) => {
    setPlacedStickers(cur => {
      const next = (cur[key] || []).filter(s => s.id !== stickerId);
      const safe = next.map(({ render, ...r }) => r);
      db.collection("stickers").doc(key).set({ stickers: safe }).catch(console.error);
      return { ...cur, [key]: next };
    });
  };

  return (
    <>
      {tweaks.showStarfield && <div className="cosmic-bg" />}

      {(view === "landing" || handoff) && (
        <div className={handoff ? "landing-fading-out" : ""}>
          <LandingView orientation={tweaks.coverOrientation} onOpen={openBook} />
        </div>
      )}

      {closing && (
        <div className="landing-closing-wrap">
          <LandingView orientation={tweaks.coverOrientation} autoClose onClosed={finishClose} />
        </div>
      )}

      {view === "book" && (
        <div className={`book-view-wrap ${closing ? "fading-out" : "fading-in"}`}>
          <BookView
            album={effectiveAlbum}
            layout={layout}
            setLayout={setLayout}
            onClose={closeBook}
            onUpload={() => setUploadOpen(true)}
            onOpenPhoto={openPhoto}
            photoStickerCounts={photoStickerCounts}
            placedStickers={placedStickers}
            setPlacedStickers={setPlacedStickers}
            photosMap={photosMap}
            getPhotoKey={getPhotoKey}
            photos={photos}
            collagePages={effectivePages}
            onPageChange={setPageOptions}
            onUpdatePhoto={updatePhotoLocal}
            onPersistPhoto={persistPhoto}
            onDeletePhoto={deletePhoto}
            onAddPage={addPage}
            onRemovePage={removePage}
            canRemovePage={effectivePages > Math.max(1, maxPhotoPage + 1, LOCK_ENABLED ? LOCKED_PAGES : 0)}
          />
        </div>
      )}

      {lightbox && (
        <Lightbox
          seed={lightbox.seed}
          photoUrl={photosMap[lightbox.seed]?.url}
          stickers={placedStickers[photoKey] || []}
          onDeleteSticker={(stickerId) => deleteSticker(photoKey, stickerId)}
          onClose={closeLightbox}
        />
      )}

      {uploadOpen && <UploadModal onClose={() => setUploadOpen(false)} pageOptions={pageOptions} />}

      <TweaksPanel title="Tweaks · 心咲KOE">
        <TweakSection label="封面">
          <TweakRadio
            label="呈現方式"
            value={tweaks.coverOrientation}
            options={[{ value: "floating", label: "漂浮" }, { value: "flat", label: "平躺" }]}
            onChange={(v) => setTweak("coverOrientation", v)}
          />
        </TweakSection>
        <TweakSection label="書頁">
          <TweakRadio
            label="排版方式"
            value={tweaks.defaultLayout}
            options={[
              { value: "book",     label: "翻頁"    },
              { value: "polaroid", label: "Polaroid" },
            ]}
            onChange={(v) => setTweak("defaultLayout", v)}
          />
        </TweakSection>
        <TweakSection label="貼紙">
          <TweakRadio
            label="預設貼紙包"
            value={tweaks.defaultPack}
            options={[
              { value: "koe",    label: "KOE" },
              { value: "cosmic", label: "宇宙" },
              { value: "girly",  label: "少女" },
              { value: "words",  label: "文字" },
            ]}
            onChange={(v) => setTweak("defaultPack", v)}
          />
          <TweakButton label="清除所有貼紙" onClick={() => setPlacedStickers({})} />
        </TweakSection>
        <TweakSection label="氛圍">
          <TweakToggle label="顯示星空背景" value={tweaks.showStarfield} onChange={(v) => setTweak("showStarfield", v)} />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
