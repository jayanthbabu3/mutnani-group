import { DIVISIONS, NAV_EXTRA, NAV_LINKS, OFFICES, SITE, divisionAnchor } from '../data/site'
import Logo from './Logo'
import { Shell } from './ui'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-line/60 pt-16 pb-14">
      <Shell>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-[0.88rem] leading-[1.7] text-body">
              Prefabricated construction, PUF panel manufacturing and international trade, under one
              group since {SITE.founded}.
            </p>
            <div className="mt-6 flex flex-col gap-1.5">
              <a
                href={`tel:${SITE.phone}`}
                className="text-[0.95rem] text-heading transition-colors duration-200 ease-micro hover:text-accent"
              >
                {SITE.phoneDisplay}
              </a>
              <a
                href={`mailto:${SITE.email}`}
                className="text-[0.95rem] text-heading transition-colors duration-200 ease-micro hover:text-accent"
              >
                {SITE.email}
              </a>
            </div>
          </div>

          <nav aria-label="Footer">
            <p className="tech-sm text-accent">Pages</p>
            <ul className="mt-5 space-y-2.5">
              {[...NAV_LINKS, ...NAV_EXTRA].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-[0.88rem] text-body transition-colors duration-200 ease-micro hover:text-accent"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <p className="tech-sm mt-8 text-accent">The companies</p>
            <ul className="mt-5 space-y-2.5">
              {DIVISIONS.map((division) => (
                <li key={division.id}>
                  <a
                    href={`/companies#${divisionAnchor(division.id)}`}
                    className="text-[0.88rem] text-body transition-colors duration-200 ease-micro hover:text-accent"
                  >
                    {division.company}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="tech-sm text-accent">Offices</p>
            <div className="mt-5 space-y-6">
              {OFFICES.map((office) => (
                <address
                  key={office.id}
                  className="text-[0.85rem] leading-[1.65] text-body not-italic"
                >
                  <span className="block text-heading">{office.name}</span>
                  {office.lines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-line/60 pt-7">
          <p className="tech-sm text-body">
            © {year} {SITE.name} {SITE.role}
          </p>
          <div className="flex items-center gap-6">
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noreferrer"
              className="tech-sm text-body transition-colors duration-200 ease-micro hover:text-accent"
            >
              Instagram
            </a>
            <a
              href={SITE.linkedin}
              target="_blank"
              rel="noreferrer"
              className="tech-sm text-body transition-colors duration-200 ease-micro hover:text-accent"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </Shell>
    </footer>
  )
}
