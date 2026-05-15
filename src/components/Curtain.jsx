import { motion, useAnimation } from 'framer-motion'
import { useEffect, useRef } from 'react'

const Curtain = ({ side }) => {
  const controls = useAnimation()
  const timerRef = useRef(null)
  const d = side === 'left' ? 1 : -1

  // Gentle constant breathing — very small rotation from top hinge
  const startSway = () =>
    controls.start({
      rotate: [0, d * 0.7, d * 0.25, d * -0.4, 0],
      transition: { duration: 12, repeat: Infinity, ease: 'easeInOut' },
    })

  // Wind gust — pendulum swing from top, natural deceleration
  const gust = async () => {
    await controls.start({
      rotate: [0, d*1.2, d*2.8, d*4.0, d*3.0, d*1.6, d*0.6, 0],
      transition: {
        duration: 5.8 + Math.random() * 2,
        ease: [0.22, 0.1, 0.25, 1],
        times: [0, 0.07, 0.22, 0.42, 0.60, 0.78, 0.91, 1],
      },
    })
    startSway()
  }

  const scheduleNext = () => {
    timerRef.current = setTimeout(async () => {
      await gust()
      scheduleNext()
    }, 9000 + Math.random() * 14000)
  }

  useEffect(() => {
    startSway()
    const init = setTimeout(scheduleNext, side === 'left' ? 3000 : 9000)
    return () => {
      clearTimeout(init)
      clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <motion.div
      className={`curtain curtain-${side}`}
      animate={controls}
      style={{ transformOrigin: side === 'left' ? '0% 0%' : '100% 0%' }}
    >
      <div className="c-layer c-base" />
      <div className="c-layer c-fold-a" />
      <div className="c-layer c-fold-b" />
      <div className="c-layer c-edge" />
    </motion.div>
  )
}

export default Curtain
