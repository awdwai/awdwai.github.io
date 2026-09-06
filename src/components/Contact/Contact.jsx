import { site } from '../../data/site'
import './Contact.css'

/** Accessible 2D package list for mobile / reduced-motion. */
export default function PackageFallback({ onOpen, activeId }) {
  return (
    <section className="fallback" aria-label="Resume packages">
      <h2 className="fallback__title">Packages on the line</h2>
      <p className="fallback__hint">Tap a crate to open its contents.</p>
      <ul className="fallback__list">
        {site.packages.map((pkg) => (
          <li key={pkg.id}>
            <button
              type="button"
              className={`fallback__item${activeId === pkg.id ? ' fallback__item--active' : ''}`}
              onClick={() => onOpen(pkg.id)}
            >
              <span className="fallback__code">{pkg.short}</span>
              <span className="fallback__label">{pkg.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
