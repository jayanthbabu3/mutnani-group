import { useEffect, useMemo, useState } from 'react'
import Logo from './Logo'
import { NAV_EXTRA, NAV_LINKS, SITE } from '../data/site'
import { Shell } from './ui'

/**
 * Desktop header, on the Shell so its left edge is the same left edge as every
 * section below it.
 *
 * Nav links are hidden below `lg` — the bottom tab bar is the navigation there,
 * and a hamburger that hides every destination behind a tap is not.
 */
export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /**
   * Header order is the page's order, not the tab bar's.
   *
   * The tab bar needs Contact as one of its four, so `nav` in the content file
   * ends with it — but in a header that lists seven links, Contact appearing
   * fourth of seven puts three sections after the thing that ends the journey.
   * So: everything except Contact, in page order, then Contact last.
   */
  const links = [
    ...NAV_LINKS.slice(0, 1),
    ...NAV_EXTRA,
    ...NAV_LINKS.slice(1, 3),
    ...NAV_LINKS.slice(3),
  ]

  /** The three that get dropped when the header runs out of room. */
  const secondary = useMemo(() => new Set(NAV_EXTRA.map((link) => link.href)), [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[70] transition-colors duration-300 ease-micro ${
        scrolled ? 'border-b border-line/60 bg-ground/90 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <Shell className="flex items-center justify-between py-3.5">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-[0.82rem] font-medium tracking-[0.02em] text-body transition-colors duration-200 ease-micro hover:text-accent ${
                // Tested by membership, not by index: the array is reordered
                // above, so an index check would hide whichever links happened
                // to land in those slots.
                secondary.has(link.href) ? 'hidden xl:inline' : ''
              }`}
            >
              {link.label}
            </a>
          ))}
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
