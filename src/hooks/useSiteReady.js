import { useEffect, useState } from 'react'

/**
 * Gate arm motion until window load + optional GLB/canvas ready signals.
 */
export function useSiteReady(extraReady = true) {
  const [windowReady, setWindowReady] = useState(
    typeof document !== 'undefined' && document.readyState === 'complete',
  )

  useEffect(() => {
    if (document.readyState === 'complete') {
      setWindowReady(true)
      return
    }
    const onLoad = () => setWindowReady(true)
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])

  return windowReady && extraReady
}
