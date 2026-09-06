import { useCallback, useEffect, useMemo, useState } from 'react'
import Nav from './components/Nav/Nav'
import Hero from './components/Hero/Hero'
import ContentPanel from './components/ContentPanel/ContentPanel'
import PackageFallback from './components/Contact/Contact'
import Footer from './components/Footer/Footer'
import { useSiteReady } from './hooks/useSiteReady'

function useMediaFlags() {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mobile = window.matchMedia('(max-width: 820px)')
    const sync = () => {
      setReducedMotion(motion.matches)
      setIsMobile(mobile.matches)
    }
    sync()
    motion.addEventListener('change', sync)
    mobile.addEventListener('change', sync)
    return () => {
      motion.removeEventListener('change', sync)
      mobile.removeEventListener('change', sync)
    }
  }, [])

  return { reducedMotion, isMobile }
}

export default function App() {
  const { reducedMotion, isMobile } = useMediaFlags()
  const skip3d = reducedMotion || isMobile

  const [sceneReady, setSceneReady] = useState(skip3d)
  const [selectedId, setSelectedId] = useState(null)
  const [armPhase, setArmPhase] = useState('idle')
  const [panelOpen, setPanelOpen] = useState(false)

  const ready = useSiteReady(skip3d || sceneReady)

  useEffect(() => {
    if (skip3d) setSceneReady(true)
  }, [skip3d])

  const openSection = useCallback(
    (id) => {
      if (!id) return
      setSelectedId(id)

      if (skip3d || !ready) {
        setArmPhase('open')
        setPanelOpen(true)
        return
      }

      setPanelOpen(false)
      setArmPhase('reaching')
    },
    [ready, skip3d],
  )

  const onReached = useCallback(() => {
    setArmPhase('open')
    setPanelOpen(true)
  }, [])

  const closePanel = useCallback(() => {
    setPanelOpen(false)
    setSelectedId(null)
    setArmPhase('idle')
  }, [])

  const onSceneReady = useCallback(() => setSceneReady(true), [])

  const showFallback = useMemo(() => skip3d, [skip3d])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') closePanel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closePanel])

  return (
    <div className="app">
      <Nav onOpen={openSection} activeId={selectedId} />
      <Hero
        ready={ready}
        onSceneReady={onSceneReady}
        selectedId={selectedId}
        armPhase={armPhase}
        onSelectPackage={openSection}
        onReached={onReached}
        reducedMotion={reducedMotion}
        isMobile={isMobile}
      />
      {showFallback ? (
        <PackageFallback onOpen={openSection} activeId={selectedId} />
      ) : null}
      {panelOpen ? <ContentPanel sectionId={selectedId} onClose={closePanel} /> : null}
      <Footer />
    </div>
  )
}
