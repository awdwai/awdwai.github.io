import { lazy, Suspense } from 'react'
import { site } from '../../data/site'
import './Hero.css'

const SceneCanvas = lazy(() => import('../Scene/SceneCanvas'))

export default function Hero({
  ready,
  onSceneReady,
  selectedId,
  armPhase,
  onSelectPackage,
  onReached,
  reducedMotion,
  isMobile,
}) {
  const mount3d = !reducedMotion && !isMobile
  return (
    <section className="hero" id="top" aria-label="Factory floor hero">
      <div className="hero__scene" aria-hidden={reducedMotion || isMobile ? 'true' : undefined}>
        {mount3d ? (
          <Suspense fallback={<div className="hero__fallback" />}>
            <SceneCanvas
              ready={ready}
              onSceneReady={onSceneReady}
              selectedId={selectedId}
              armPhase={armPhase}
              onSelectPackage={onSelectPackage}
              onReached={onReached}
            />
          </Suspense>
        ) : (
          <div className="hero__fallback hero__fallback--static" />
        )}
      </div>

      <div className="hero__overlay">
        <p className="hero__eyebrow">Factory floor · Line 01</p>
        <h1 className="hero__name">{site.name}</h1>
        <p className="hero__tagline">{site.tagline}</p>
        <div className="hero__ctas">
          <button type="button" className="hero__cta hero__cta--primary" onClick={() => onSelectPackage('projects')}>
            Open projects
          </button>
          <button type="button" className="hero__cta hero__cta--ghost" onClick={() => onSelectPackage('contact')}>
            Contact
          </button>
        </div>
        {!ready && !reducedMotion && !isMobile ? (
          <p className="hero__status" role="status">
            Calibrating arm…
          </p>
        ) : (
          <p className="hero__status hero__status--ready" role="status">
            {reducedMotion || isMobile
              ? 'Select a package below or use the nav.'
              : 'Click a package on the belt — the line indexes it open.'}
          </p>
        )}
      </div>
    </section>
  )
}
