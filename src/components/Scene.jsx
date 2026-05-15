import { useState } from 'react'
import { motion } from 'framer-motion'
import Curtain from './Curtain'
import ClosedBook from './ClosedBook'

const Scene = ({ onOpen }) => {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      className="scene-root"
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      <svg style={{ display: 'none' }} aria-hidden="true">
        <defs>
          <filter id="fabric-distort" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.55 0.12" numOctaves="4" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <div className="scene-ambience" />
      <Curtain side="left" />
      <Curtain side="right" />

      {/* layoutId="book" — this element will seamlessly grow into ScrapbookView */}
      <motion.div
        layoutId="book"
        className="closed-book"
        onClick={onOpen}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ y: -9, scale: 1.03, transition: { duration: 0.3 } }}
        style={{ cursor: 'pointer', borderRadius: 5 }}
      >
        <ClosedBook />
      </motion.div>

      <p className={`open-hint ${hovered ? 'visible' : ''}`}>
        點擊開啟相簿
      </p>
    </motion.div>
  )
}

export default Scene
