import { useState } from 'react'
import { motion } from 'framer-motion'
import Scrapbook from './Scrapbook'

const PAGE_W = 500
const PAGE_H = 700

const ScrapbookView = ({ onClose }) => {
  const [isFlipping, setIsFlipping] = useState(false)
  const [showBook,   setShowBook]   = useState(false)

  const handleLayoutDone = () => {
    setTimeout(() => {
      // 容器瞬間展開到 1000px，封面同時開始翻轉
      // 書脊現在在 x=500（中央），封面從右半翻到左半，不會溢出
      setIsFlipping(true)
      setTimeout(() => setShowBook(true), 950)
    }, 80)
  }

  return (
    <div
      className="scrapbook-stage"
      onClick={showBook ? onClose : undefined}
    >
      <motion.div
        layoutId="book"
        onClick={e => e.stopPropagation()}
        onLayoutAnimationComplete={handleLayoutDone}
        animate={{ width: isFlipping ? PAGE_W * 2 : PAGE_W }}
        transition={{
          layout: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
          width:  { duration: isFlipping ? 0.18 : 0, ease: 'easeOut' },
        }}
        style={{ height: PAGE_H, position: 'relative', overflow: 'hidden' }}
      >
        {showBook ? (

          /* ── 真正的相簿 ── */
          <motion.div
            style={{ width: PAGE_W * 2, height: PAGE_H }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            <Scrapbook />
          </motion.div>

        ) : isFlipping ? (

          /* ── 翻封面（容器 1000px，書脊在中央 x=500） ── */
          <>
            {/* 左內頁：延遲出現，等容器展開後再淡入 */}
            <div className="anim-left-page" />

            {/* 右內頁：封面底下，翻完後露出 */}
            <div className="anim-right-page" />

            {/* 封面：在右半（right:0, width:500），繞書脊翻向左半 */}
            <div className="anim-cover-perspective">
              <div className="anim-cover-wrap is-opening">
                <div className="anim-cover-front">
                  <div className="cover-face-inner">
                    <h1 className="book-title">心咲koe</h1>
                    <div className="book-divider" />
                    <span className="book-cherry">🌸</span>
                    <p className="book-caption">紀念相簿 2026</p>
                  </div>
                </div>
                <div className="anim-cover-back" />
              </div>
            </div>
          </>

        ) : (

          /* ── zoom 階段：layoutId 放大，純皮革封面 ── */
          <div className="anim-zoom-cover">
            <div className="cover-face-inner">
              <h1 className="book-title">心咲koe</h1>
              <div className="book-divider" />
              <span className="book-cherry">🌸</span>
              <p className="book-caption">紀念相簿 2026</p>
            </div>
          </div>

        )}
      </motion.div>
    </div>
  )
}

export default ScrapbookView
