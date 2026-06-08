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

  // load stickers from Firestore and reconstruct render functions
  aUseEffect(() => {
    const unsub = db.collection("stickers").onSnapshot(
      snap => {
        const data = {};
        snap.docs.forEach(doc => {
          const { stickers: items = [] } = doc.data();
          data[doc.id] = items.map(s => ({
            ...s,
            render: STICKER_PACKS[s.packId]?.items.find(x => x.id === s.stickerId)?.render || (() => null),
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

  // save stickers to Firestore when lightbox closes
  const closeLightbox = () => {
    if (photoKey) {
      const safe = (placedStickers[photoKey] || []).map(({ render, ...rest }) => rest);
      db.collection("stickers").doc(photoKey)
        .set({ stickers: safe })
        .catch(e => console.error("Save stickers:", e));
    }
    setLightbox(null);
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
            photosMap={photosMap}
            getPhotoKey={getPhotoKey}
          />
        </div>
      )}

      {lightbox && (
        <Lightbox
          photoKey={photoKey}
          seed={lightbox.seed}
          photoUrl={photosMap[lightbox.seed]?.url}
          photoDbId={photosMap[lightbox.seed]?.id}
          stickers={placedStickers}
          setPlacedStickers={setPlacedStickers}
          onClose={closeLightbox}
        />
      )}

      {uploadOpen && <UploadModal onClose={() => setUploadOpen(false)} />}

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
              { value: "collage",  label: "拼貼"    },
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
