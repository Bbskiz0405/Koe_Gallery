// Main app — landing (closed book) ↔ open book
const { useState: aUseState, useEffect: aUseEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "coverOrientation": "floating",
  "defaultLayout": "book",
  "defaultPack": "koe",
  "showStarfield": true
}/*EDITMODE-END*/;

// Consolidate to the single memorial book — pull all photo seeds together
const MEMORIAL_BOOK = {
  id: "memorial",
  title: "心咲KOE",
  titleEn: "ECHO COLLECTION",
  tag: "memorial",
  count: 36,
  cover: 0,
  desc: "ECHO 們做給心咲KOE 的紀念冊。把回憶夾進書頁，貼上一朵雛菊、留下悄悄話。",
  // mixed photo seeds — feel free to swap with real fanart later
  photoSeed: [0, 4, 7, 2, 9, 3, 5, 11, 1, 8, 6, 10, 3, 5, 0, 8, 4, 11, 7, 2, 1, 10, 6, 9],
};

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  // view state machine: 'landing' (closed book) ↔ 'book' (open, FlipBook)
  const [view, setView] = aUseState("landing");
  // During hand-off we keep landing mounted (fully-opened spread frozen)
  // while BookView fades in on top — avoids the "refresh-flash" snap.
  const [handoff, setHandoff] = aUseState(false);
  // While closing, landing re-mounts on top in its reverse-flip phase.
  const [closing, setClosing] = aUseState(false);
  const [layout, setLayout] = aUseState(tweaks.defaultLayout || "book");
  const [lightbox, setLightbox] = aUseState(null);
  const [uploadOpen, setUploadOpen] = aUseState(false);
  const [placedStickers, setPlacedStickers] = aUseState({});

  aUseEffect(() => { setLayout(tweaks.defaultLayout); }, [tweaks.defaultLayout]);

  const openBook = () => {
    setHandoff(true);
    setView("book");
    // landing stays underneath, fading out — drop it once book has faded in
    setTimeout(() => setHandoff(false), 1000);
  };
  const closeBook = () => {
    if (closing) return;
    setClosing(true); // mount landing in closing mode on top; book fades out
  };
  const finishClose = () => {
    setClosing(false);
    setView("landing");
  };
  const openPhoto = (seed) => setLightbox({ albumId: MEMORIAL_BOOK.id, seed });

  const photoStickerCounts = {};
  Object.entries(placedStickers).forEach(([k, arr]) => {
    photoStickerCounts[k] = arr.length;
  });

  const photoKey = lightbox ? `${lightbox.albumId}:${lightbox.seed}` : null;

  return (
    <>
      {tweaks.showStarfield && <div className="cosmic-bg" />}

      {(view === "landing" || handoff) && (
        <div className={handoff ? "landing-fading-out" : ""}>
          <LandingView
            orientation={tweaks.coverOrientation}
            onOpen={openBook}
          />
        </div>
      )}

      {closing && (
        <div className="landing-closing-wrap">
          <LandingView
            orientation={tweaks.coverOrientation}
            autoClose
            onClosed={finishClose}
          />
        </div>
      )}

      {view === "book" && (
        <div className={`book-view-wrap ${closing ? "fading-out" : "fading-in"}`}>
          <BookView
            album={MEMORIAL_BOOK}
            layout={layout}
            setLayout={setLayout}
            onClose={closeBook}
            onUpload={() => setUploadOpen(true)}
            onOpenPhoto={openPhoto}
            photoStickerCounts={photoStickerCounts}
          />
        </div>
      )}

      {lightbox && (
        <Lightbox
          photoKey={photoKey}
          seed={lightbox.seed}
          stickers={placedStickers}
          setPlacedStickers={setPlacedStickers}
          onClose={() => setLightbox(null)}
        />
      )}
      {uploadOpen && <UploadModal onClose={() => setUploadOpen(false)} />}

      <TweaksPanel title="Tweaks · 心咲KOE">
        <TweakSection label="封面">
          <TweakRadio
            label="呈現方式"
            value={tweaks.coverOrientation}
            options={[
              { value: "floating", label: "漂浮" },
              { value: "flat", label: "平躺" },
            ]}
            onChange={(v) => setTweak("coverOrientation", v)}
          />
        </TweakSection>
        <TweakSection label="書頁">
          <TweakRadio
            label="排版方式"
            value={tweaks.defaultLayout}
            options={[
              { value: "book", label: "翻頁" },
              { value: "collage", label: "拼貼" },
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
              { value: "koe", label: "KOE" },
              { value: "cosmic", label: "宇宙" },
              { value: "girly", label: "少女" },
              { value: "words", label: "文字" },
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
