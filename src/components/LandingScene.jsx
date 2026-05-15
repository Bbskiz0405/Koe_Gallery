import { useState } from 'react'

const LandingScene = ({ onOpen }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isZooming, setIsZooming] = useState(false)

  const handleClick = () => {
    if (isZooming) return
    setIsZooming(true)
    setTimeout(() => onOpen(), 1000)
  }

  return (
    <div className={`scene-wrapper ${isZooming ? 'scene-zoom-in' : ''}`}>
      {/* Ambient window light from above */}
      <div className="scene-light" />

      {/* Left curtain */}
      <div className="curtain curtain-left">
        <div className="curtain-layer c-layer-1" />
        <div className="curtain-layer c-layer-2" />
        <div className="curtain-layer c-layer-3" />
      </div>

      {/* Right curtain */}
      <div className="curtain curtain-right">
        <div className="curtain-layer c-layer-1" />
        <div className="curtain-layer c-layer-2" />
        <div className="curtain-layer c-layer-3" />
      </div>

      {/* Floating dust motes in the light */}
      <div className="dust-motes" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={`mote mote-${i}`} />
        ))}
      </div>

      {/* The closed scrapbook */}
      <div
        className="desk-book"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="book-spine" />
        <div className="book-face">
          <div className="book-face-border">
            <h1 className="book-title">心咲koe</h1>
            <div className="book-rule" />
            <span className="book-icon">🌸</span>
            <p className="book-subtitle">紀念相簿 2026</p>
          </div>
        </div>
        <div className="book-pages-side" />
      </div>

      {/* Hover hint */}
      <div className={`open-hint ${isHovered && !isZooming ? 'visible' : ''}`}>
        點擊開啟相簿
      </div>
    </div>
  )
}

export default LandingScene
