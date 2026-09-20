import { useEffect, useMemo, useState } from 'react'
import Logo from './Logo'
import { NAV_EXTRA, NAV_LINKS, SITE, whatsappHref } from '../data/site'
import { usePath } from '../lib/router'
import { Shell } from './ui'

/**
 * Desktop header, on the Shell so its left edge is the same left edge as every
 * section below it.
 *
 * The four pages are always listed; Partners, Appreciation and Videos
 * (sections of the home page) join them from `xl`. The page you are on is
 * marked.
 *
 * Below `lg` the row is replaced by a menu button. The bottom tab bar is still
 * the primary navigation on a phone — it carries the four pages, always
 * visible, no tap required — but it cannot carry the home page's own sections,
 * and it has no room for the phone number. That is what this menu is for: it
 * lists everything, pages and sections together, rather than duplicating the
 * bar. It is a panel under the header, not a full-screen takeover, so the page
 * stays visible behind it and one tap outside closes it.
 */
const ORDER = ['/', '/companies', '/#partners', '/#videos', '/about', '/contact']
const rank = (href: string) => (ORDER.includes(href) ? ORDER.indexOf(href) : ORDER.length - 1.5)

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
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

  // Escape closes it, and the page behind it does not scroll while it is open.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  // Following a link closes it — including a same-page anchor, which changes
  // no path and would otherwise leave the panel sitting over the section it
  // just scrolled to.
  useEffect(() => setMenuOpen(false), [path])

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

        {/* The menu button. Two bars that cross into an X while open, so the
            same control that opened it visibly closes it. */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="tap-44 -mr-2 grid size-11 place-items-center rounded-full text-heading transition-colors duration-200 ease-micro hover:text-accent lg:hidden"
        >
          <span className="relative block h-3.5 w-6">
            <span
              className={`absolute inset-x-0 block h-0.5 rounded-full bg-current transition-all duration-300 ease-micro ${
                menuOpen ? 'top-1.5 rotate-45' : 'top-0'
              }`}
            />
            <span
              className={`absolute inset-x-0 block h-0.5 rounded-full bg-current transition-all duration-300 ease-micro ${
                menuOpen ? 'top-1.5 -rotate-45' : 'top-3'
              }`}
            />
          </span>
        </button>
      </Shell>

      <MobileMenu open={menuOpen} path={path} onClose={() => setMenuOpen(false)} />
    </header>
  )
}

/**
 * The panel itself: every destination on the site, pages first, then the
 * sections of the home page, then the two ways to start a conversation.
 *
 * It is always mounted and animated shut rather than unmounted, so opening it
 * is a transition and not a repaint, and so a screen reader is not handed a
 * control pointing at nothing.
 */
function MobileMenu({
  open,
  path,
  onClose,
}: {
  open: boolean
  path: string
  onClose: () => void
}) {
  return (
    <>
      {/* The page behind it stays visible and takes the tap that closes it. */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 top-[4.25rem] -z-10 cursor-default bg-heading/20 backdrop-blur-[2px] transition-opacity duration-300 ease-micro lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <div
        id="mobile-menu"
        className={`overflow-hidden border-line/60 bg-ground/97 backdrop-blur-xl transition-[max-height,opacity] duration-300 ease-micro lg:hidden ${
          open ? 'max-h-[80svh] border-b opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <Shell className="py-5">
          {/* One handler for every link: a same-page anchor changes no path,
              so the effect above would not fire and the panel would sit over
              the section it just scrolled to. */}
          <nav aria-label="All pages and sections" onClick={onClose}>
            <ul>
              {NAV_LINKS.map((link) => (
                <MenuLink key={link.href} {...link} current={link.href === path} />
              ))}
            </ul>

            <p className="tech-sm mt-6 mb-1 text-body">On the home page</p>
            <ul>
              {NAV_EXTRA.map((link) => (
                <MenuLink key={link.href} {...link} current={false} />
              ))}
            </ul>
          </nav>

          <div className="mt-6 grid gap-3 border-t border-line/60 pt-5 sm:grid-cols-2">
            <a
              href={`tel:${SITE.phone}`}
              className="flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-[0.82rem] font-semibold tracking-[0.04em] text-ground tabular-nums transition-colors duration-200 ease-micro hover:bg-accent-glow"
            >
              {SITE.phoneDisplay}
            </a>
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-full border border-line px-5 py-3 text-[0.82rem] font-medium text-heading transition-colors duration-200 ease-micro hover:border-accent hover:text-accent"
            >
              WhatsApp
            </a>
          </div>
        </Shell>
      </div>
    </>
  )
}

function MenuLink({ href, label, current }: { href: string; label: string; current: boolean }) {
  return (
    <li className="border-b border-line/50 last:border-b-0">
      <a
        href={href}
        aria-current={current ? 'page' : undefined}
        className={`flex items-center justify-between py-3.5 text-[1rem] font-medium transition-colors duration-200 ease-micro ${
          current ? 'text-accent' : 'text-heading hover:text-accent'
        }`}
      >
        {label}
        <svg viewBox="0 0 24 24" className="size-3.5 text-accent" fill="none" stroke="currentColor" aria-hidden>
          <path d="M9 5l7 7-7 7" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </li>
  )
}
