import { site } from '../../data/site'
import './Nav.css'

export default function Nav({ onOpen, activeId }) {
  return (
    <header className="nav">
      <a className="nav__brand" href="#top" aria-label={`${site.name} home`}>
        shrestbijakal
      </a>
      <nav className="nav__links" aria-label="Primary">
        {site.nav.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav__link${activeId === item.id ? ' nav__link--active' : ''}`}
            onClick={() => onOpen(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  )
}
