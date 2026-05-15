const StickerBar = ({ selectedSticker, onSelectSticker }) => {
  const stickers = [
    { id: 'koe-smile', label: '😊' },
    { id: 'heart', label: '❤️' },
    { id: 'star', label: '⭐' },
    { id: 'flower', label: '🌸' },
    { id: 'sparkles', label: '✨' },
  ];

  return (
    <div className="sticker-tray">
      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest text-center mb-3">
        Sticker Box
      </div>
      <div className="tray-grid">
        {stickers.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelectSticker(s.id)}
            className={`tray-btn ${selectedSticker === s.id ? 'active scale-110' : 'opacity-40 hover:opacity-100'}`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StickerBar;
