import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Scene from './components/Scene'
import ScrapbookView from './components/ScrapbookView'
import './styles/scene.css'
import './styles/scrapbook.css'

function App() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <AnimatePresence>
      {!isOpen
        ? <Scene key="scene" onOpen={() => setIsOpen(true)} />
        : <ScrapbookView key="open" onClose={() => setIsOpen(false)} />
      }
    </AnimatePresence>
  )
}

export default App
