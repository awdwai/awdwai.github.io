import { site } from '../../data/site'
import './Footer.css'

export default function Footer() {
  const { modelCredit } = site
  const year = new Date().getFullYear()

  const titleNode = modelCredit.url ? (
    <a href={modelCredit.url} target="_blank" rel="noreferrer">
      {modelCredit.title}
    </a>
  ) : (
    <span>{modelCredit.title}</span>
  )

  return (
    <footer className="footer">
      <p className="footer__brand">
        {site.name} · Factory Floor · {year}
      </p>
      <p className="footer__credit">
        3D model: {titleNode}
        {' · '}
        {modelCredit.author}
        {' · '}
        {modelCredit.license}
        {modelCredit.note ? (
          <>
            <br />
            <span className="footer__note">{modelCredit.note}</span>
          </>
        ) : null}
      </p>
    </footer>
  )
}
