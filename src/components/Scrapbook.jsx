import { useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import Page from './Page';
import StickerBar from './StickerBar';

const Scrapbook = () => {
  const [selectedSticker, setSelectedSticker] = useState('koe-smile');

  return (
    <div className="scrapbook-wrapper">
      <HTMLFlipBook
        width={500}
        height={700}
        size="stretch"
        minWidth={315}
        maxWidth={1000}
        minHeight={400}
        maxHeight={1533}
        maxShadowOpacity={0.5}
        showCover={false}
        className="scrapbook-book"
        useMouseEvents={true}
      >
        {/* Page 1 */}
        <Page number="1" selectedSticker={selectedSticker} orientation="page-left">
          <div className="page-content p-14 handwritten">
            <h2 className="text-4xl font-bold mb-10 text-[#2b1b12]">致心咲</h2>
            <div className="space-y-8 text-xl leading-relaxed">
              <p>這本相簿記錄了我們的所有回憶。</p>
              <p>現在畫面已經調整為大尺寸，方便您閱覽與操作。</p>
              <p>選取下方貼紙，點擊頁面任何地方即可貼上。</p>
            </div>
          </div>
        </Page>

        {/* Page 2 */}
        <Page number="2" selectedSticker={selectedSticker} orientation="page-right">
          <div className="page-content p-14 handwritten">
             <h2 className="text-3xl font-bold mb-10 text-center">回憶片段</h2>
             <div className="bg-white p-4 shadow-xl rotate-1 mx-auto w-64 border border-gray-100">
                <div className="aspect-square bg-gray-200 flex items-center justify-center text-gray-400">Photo</div>
                <p className="mt-2 text-center text-sm">2026 Debut</p>
             </div>
             <p className="mt-12 text-center text-lg italic opacity-60">「謝謝你們一直都在。」</p>
          </div>
        </Page>

        {/* Page 3 */}
        <Page number="3" selectedSticker={selectedSticker} orientation="page-left">
          <div className="page-content p-14 flex flex-col items-center justify-center h-full">
            <span className="text-8xl mb-8">✨</span>
            <h3 className="text-3xl font-bold handwritten">互動裝飾</h3>
          </div>
        </Page>

        {/* Page 4 */}
        <Page number="4" selectedSticker={selectedSticker} orientation="page-right">
          <div className="page-content p-14 flex flex-col justify-end h-full">
            <div className="text-4xl font-serif opacity-20 mb-6">Forever with Koe</div>
            <p className="handwritten text-xs opacity-40 italic">Memorial Project v1.0</p>
          </div>
        </Page>
      </HTMLFlipBook>

      <StickerBar 
        selectedSticker={selectedSticker} 
        onSelectSticker={setSelectedSticker} 
      />
    </div>
  );
};

export default Scrapbook;
