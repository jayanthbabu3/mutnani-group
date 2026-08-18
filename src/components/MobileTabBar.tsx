import { useEffect, useState } from 'react'
import { NAV_LINKS, whatsappHref } from '../data/site'

/**
 * The bottom bar on phones — the primary navigation, not a fallback.
 *
 * A hamburger hides every destination behind a tap and tells the visitor
 * nothing about what the site contains. This shows four, always, and puts the
 * enquiry in the raised centre where a thumb already rests. On a local service
 * site most traffic is a phone held one-handed; this is the shape that
 * audience already knows from every app on the device.
 *
 * Everything is a token, so the bar inverts with the palette family — no
 * separate light-mode version to maintain.
 */

/** Drawn at one weight, in the same hand as the rest of the site's line work. */
const ICONS: Record<string, string> = {
  /* Three stacked bars — the three companies. */
  divisions: 'M4 5.5h16M4 12h16M4 18.5h16',
  /* A gable frame: the thing the group actually sells. */
  products: 'M3.5 10.5 12 4.5l8.5 6M6 10v10h12V10M6 20h12',
  /* Site plan — plots on a grid. */
  projects: 'M4 4.5h6.5V11H4zM13.5 4.5H20V11h-6.5zM4 13.5h6.5V20H4zM13.5 13.5H20V20h-6.5z',
  /* Two overlapping marks — the group's, and the partner's. */
  partners: 'M8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 19.5a5.5 5.5 0 0 1 11 0M10.5 19.5a5.5 5.5 0 0 1 11 0',
  build: 'M4 19.5h16M7 19.5V9l5-4.5L17 9v10.5',
  panel: 'M3.5 8.5h17v7h-17zM3.5 12h17M7 8.5v7M11 8.5v7M15 8.5v7',
  trade: 'M3 12h18M15 7l5 5-5 5M9 17l-5-5 5-5',
  home: 'M3.5 10.5 12 4l8.5 6.5M6 9.5V20h12V9.5M10 20v-5h4v5',
  work: 'M4 4.5h6.5V11H4zM13.5 4.5H20V11h-6.5zM4 13.5h6.5V20H4zM13.5 13.5H20V20h-6.5z',
  services: 'M4 6.5h16M4 12h16M4 17.5h10',
  about: 'M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM5 20a7 7 0 0 1 14 0',
  gallery: 'M3.5 5.5h17v13h-17zM3.5 15l4.5-4 3.5 3 4-4.5 5 5.5',
  blog: 'M5.5 3.5h9l4 4v13h-13zM14.5 3.5v4h4M8.5 12.5h7M8.5 16h4.5',
  estimate:
    'M6.5 3h11v18h-11zM9.5 7h5M9.5 11.5h.01M12 11.5h.01M14.5 11.5h.01M9.5 16h.01M12 16h.01M14.5 16h.01',
  contact: 'M4 6.5h16v11H4zM4 7l8 6 8-6',
}

/** Four tabs, split two either side of the raised enquiry button. */
const TABS = NAV_LINKS.slice(0, 4).map((link) => ({
  ...link,
  icon: link.href.replace('#', ''),
}))

// Hoisted: a fresh array on every render would tear down and rebuild the
// observer in useActiveSection each time.
const TAB_HREFS = TABS.map((tab) => tab.href)

export default function MobileTabBar() {
  const active = useActiveSection(TAB_HREFS)

  return (
    <nav
      aria-label="Quick links"
      className="fixed inset-x-0 bottom-0 z-[64] border-t border-line/70 bg-ground/92 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-5 items-end">
        {TABS.slice(0, 2).map((tab) => (
          <Tab key={tab.href} {...tab} active={active === tab.href} />
        ))}

        {/* The enquiry, lifted out of the row and into reach of a thumb. */}
        <li className="flex justify-center">
          <a
            href={whatsappHref()}
            target="_blank"
            rel="noreferrer"
            className="-mt-6 flex flex-col items-center gap-1"
          >
            <span className="ring-ground/92 grid size-14 place-items-center rounded-full bg-accent text-ground ring-4 transition-transform duration-200 ease-micro active:scale-95">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-6" aria-hidden>
                <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.6.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.2a.6.6 0 0 0 0-.5l-.8-1.9c-.2-.4-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.2 5 5 0 0 0 1 2.6 11.4 11.4 0 0 0 4.4 3.9c1.6.6 2.2.7 3 .6a2.5 2.5 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .1-1.2c0-.1-.2-.2-.5-.3Z" />
              </svg>
            </span>
            <span className="pb-2 text-[0.62rem] font-medium tracking-[0.04em] text-accent">
              Enquire
            </span>
          </a>
        </li>

        {TABS.slice(2).map((tab) => (
          <Tab key={tab.href} {...tab} active={active === tab.href} />
        ))}
      </ul>
    </nav>
  )
}

function Tab({
  href,
  label,
  icon,
  active,
}: {
  href: string
  label: string
  icon: string
  active: boolean
}) {
  return (
    <li>
      <a
        href={href}
        aria-current={active ? 'true' : undefined}
        // py-3 + the 21px icon + label clears 44px without a fixed height.
        className={`flex flex-col items-center gap-1.5 py-3 transition-colors duration-300 ease-micro ${
          active ? 'text-accent' : 'text-heading/60'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-[21px] w-[21px]"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d={ICONS[icon] ?? ICONS.work} />
        </svg>
        <span className="text-[0.6rem] leading-none tracking-[0.04em]">{label}</span>
      </a>
    </li>
  )
}

/**
 * Which section owns the viewport. Observed rather than computed from
 * scrollY, so it stays correct with Lenis easing the scroll and with sections
 * of wildly different heights.
 */
function useActiveSection(hrefs: string[]) {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const sections = hrefs
      .map((href) => document.querySelector(href))
      .filter((el): el is Element => el !== null)
    if (!sections.length) return

    const visible = new Map<string, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => visible.set('#' + entry.target.id, entry.intersectionRatio))
        const top = [...visible.entries()]
          .filter(([, ratio]) => ratio > 0)
          .sort((a, b) => b[1] - a[1])[0]
        setActive(top ? top[0] : null)
      },
      // A band across the middle of the screen: the section the visitor is
      // actually reading, not one clipping the top edge.
      { rootMargin: '-35% 0px -35% 0px', threshold: [0, 0.25, 0.5, 1] },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [hrefs])

  return active
}
