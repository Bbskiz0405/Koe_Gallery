const Sticker = ({ type, x, y, rotation }) => {
  const stickerImages = {
    'koe-smile': '/stickers/koe-smile.png',
    'heart': '/stickers/heart.png',
    'star': '/stickers/star.png',
    'flower': '/stickers/flower.png',
    'sparkles': '/stickers/sparkles.png',
  };

  const imageSrc = stickerImages[type] || stickerImages['heart'];

  return (
    <div 
      className="absolute physical-sticker pointer-events-auto select-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        width: '60px',
        height: '60px',
        zIndex: 10
      }}
    >
      <img 
        src={imageSrc} 
        alt={type} 
        className="sticker-img w-full h-full object-contain"
        onError={(e) => {
          e.target.src = `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${type}`;
        }}
      />
    </div>
  );
};

export default Sticker;
