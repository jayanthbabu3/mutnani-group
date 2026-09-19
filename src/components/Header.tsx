import { useEffect, useMemo, useState } from 'react'
import Logo from './Logo'
import { NAV_EXTRA, NAV_LINKS, SITE } from '../data/site'
import { usePath } from '../lib/router'
import { Shell } from './ui'

/**
 * Desktop header, on the Shell so its left edge is the same left edge as every
 * section below it.
 *
 * Nav links are hidden below `lg` — the bottom tab bar is the navigation there,
 * and a hamburger that hides every destination behind a tap is not.
 *
 * The four pages are always listed; Partners and Videos (sections of the home
 * page) join them from `xl`. The page you are on is marked.
 */
const ORDER = ['/', '/companies', '/#partners', '/#videos', '/about', '/contact']
const rank = (href: string) => (ORDER.includes(href) ? ORDER.indexOf(href) : ORDER.length - 1.5)

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const path = usePath()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /**
   * The links come from two lists in site.json — the pages, and the home
   * sections worth a link — so they are put in one reading order here:
   * Home, Companies, the two home sections, About, Contact. A link not in
   * ORDER lands just before Contact.
   */
  const links = [...NAV_LINKS, ...NAV_EXTRA].sort((a, b) => rank(a.href) - rank(b.href))

  /** The home-section links, dropped when the header runs out of room. */
  const secondary = useMemo(() => new Set(NAV_EXTRA.map((link) => link.href)), [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[70] transition-colors duration-300 ease-micro ${
        scrolled ? 'border-b border-line/60 bg-ground/90 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <Shell className="flex items-center justify-between py-3.5">
        <Logo className="shrink-0" />

        <nav aria-label="Primary" className="ml-10 hidden items-center gap-7 whitespace-nowrap lg:flex">
          {links.map((link) => {
            const current = link.href === path
            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={current ? 'page' : undefined}
                className={`relative py-1 text-[0.82rem] font-medium tracking-[0.02em] transition-colors duration-200 ease-micro hover:text-accent ${
                  current
                    ? 'text-accent after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-accent'
                    : 'text-body'
                } ${
                  // Measured, not guessed: with all six links and the phone
                  // button, `xl` (1280px) still leaves a wide gap after the
                  // logo. Below it the four pages alone are shown.
                  secondary.has(link.href) ? 'hidden xl:inline' : ''
                }`}
              >
                {link.label}
              </a>
            )
          })}
          <a
            href={`tel:${SITE.phone}`}
            className="rounded-full bg-accent px-5 py-2.5 text-[0.78rem] font-semibold tracking-[0.04em] text-ground tabular-nums transition-colors duration-200 ease-micro hover:bg-accent-glow"
          >
            {SITE.phoneDisplay}
          </a>
        </nav>
      </Shell>
    </header>
  )
}
