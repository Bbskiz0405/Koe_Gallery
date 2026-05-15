import { useStickers } from '../hooks/useStickers';
import Sticker from './Sticker';
import { forwardRef } from 'react';

const Page = forwardRef(({ number, children, selectedSticker, isCover = false, orientation = '' }, ref) => {
  const { stickers, addSticker } = useStickers(number);

  const handlePageClick = (e) => {
    if (!selectedSticker || isCover) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const rotation = Math.random() * 40 - 20;

    addSticker({
      page: number.toString(),
      type: selectedSticker,
      x,
      y,
      rotation
    });
  };

  return (
    <div className={`page ${orientation}`} ref={ref}>
      <div 
        className="h-full relative cursor-crosshair"
        onClick={handlePageClick}
      >
        {children}
        
        {/* Render Stickers */}
        {stickers.map((sticker) => (
          <Sticker key={sticker.id} {...sticker} />
        ))}

        {!isCover && number && (
          <div className="absolute bottom-6 right-8 text-[#bc6c25] italic font-serif opacity-30 select-none">
            {number}
          </div>
        )}
      </div>
    </div>
  );
});

export default Page;
