import { site } from '../../data/site'
import './ContentPanel.css'

function SectionBody({ id }) {
  if (id === 'about') {
    const e = site.education
    return (
      <>
        <p className="panel__lead">
          {e.school} · {e.city}
        </p>
        <p>
          Graduating {e.graduation} · GPA {e.gpa}
        </p>
        <h3 className="panel__sub">Coursework</h3>
        <ul>
          {e.coursework.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </>
    )
  }

  if (id === 'projects') {
    return (
      <div className="panel__stack">
        {site.projects.map((p) => (
          <article key={p.id} className="panel__card">
            <h3>{p.name}</h3>
            <p className="panel__meta">
              {p.type} · {p.dates}
            </p>
            <p className="panel__meta">{p.stack.join(' · ')}</p>
            <ul>
              {p.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    )
  }

  if (id === 'experience') {
    return (
      <div className="panel__stack">
        {site.experience.map((job) => (
          <article key={job.id} className="panel__card">
            <h3>{job.role}</h3>
            <p className="panel__meta">
              {job.org} · {job.dates}
            </p>
            {job.featured ? <p className="panel__featured">{job.featured}</p> : null}
            <ul>
              {job.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    )
  }

  if (id === 'skills') {
    const s = site.skills
    const groups = [
      ['Languages', s.languages],
      ['Tools', s.tools],
      ['Systems', s.systems],
      ['Generative AI', s.generativeAi],
      ['Certifications', s.certifications],
    ]
    return (
      <div className="panel__skills">
        {groups.map(([label, items]) => (
          <div key={label}>
            <h3 className="panel__sub">{label}</h3>
            <p>{items.join(' · ')}</p>
          </div>
        ))}
      </div>
    )
  }

  if (id === 'leadership') {
    const l = site.leadership
    return (
      <>
        <p className="panel__lead">
          {l.role} · {l.org}
        </p>
        <p className="panel__meta">
          {l.school} · {l.dates}
        </p>
        <ul>
          {l.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </>
    )
  }

  if (id === 'contact') {
    return (
      <>
        <p className="panel__lead">Open a channel</p>
        <p>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>
        <p className="panel__meta">{site.location}</p>
      </>
    )
  }

  return null
}

export default function ContentPanel({ sectionId, onClose }) {
  if (!sectionId) return null

  const pkg = site.packages.find((p) => p.id === sectionId)
  const title = pkg?.label ?? sectionId

  return (
    <div className="panel-root" role="dialog" aria-modal="true" aria-labelledby="panel-title">
      <button type="button" className="panel__backdrop" aria-label="Close panel" onClick={onClose} />
      <aside className="panel">
        <header className="panel__header">
          <div>
            <p className="panel__eyebrow">Package open</p>
            <h2 id="panel-title">{title}</h2>
          </div>
          <button type="button" className="panel__close" onClick={onClose}>
            Close
          </button>
        </header>
        <div className="panel__body">
          <SectionBody id={sectionId} />
        </div>
      </aside>
    </div>
  )
}
