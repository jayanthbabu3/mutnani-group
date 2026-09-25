import ContactCta from '../components/ContactCta'
import SteelStrip from '../components/SteelStrip'
import PageHero from '../components/PageHero'
import PrefabSolutions from '../components/PrefabSolutions'
import VideoGrid from '../components/VideoGrid'
import { APPLICATION_ICONS } from '../components/applicationIcons'
import { Divider, Section } from '../components/ui'
import { APPLICATIONS, PAGES } from '../data/site'
import { useReveal } from '../lib/motion'
import { usePageMeta } from '../lib/meta'

/**
 * What Balaji Prefab builds — thirteen building types, in the client's own
 * four markets, reached from "View more" on the company's card, and then the
 * company's own signature section.
 *
 * ── Why bands, and not one long grid ─────────────────────────────────────
 * Thirteen cards in a row of three is a keyword dump: the visitor reads it as
 * a list of words rather than as four markets the company serves, which is the
 * point the client is making. Each market gets a band of its own with the
 * count printed beside it, so "we do cold storage" arrives inside "we do the
 * food industry".
 *
 * ── Why one Section for all four ─────────────────────────────────────────
 * Every Section on this site reserves a screen of height, which is right for a
 * home-page band and wrong for four short lists — as four Sections this page
 * left half a screen of white under each market and ran to five scrolls.
 */
export default function ApplicationsPage() {
  const page = PAGES.applications
  usePageMeta('What we build', page.meta)

  const total = APPLICATIONS.groups.reduce((n, group) => n + group.items.length, 0)

  return (
    <>
      <PageHero crumb="What we build" eyebrow={page.eyebrow} title={page.title} lede={page.lede} />

      <Section className="!min-h-0 !py-14 md:!block lg:!py-16">
        <p className="reveal tech-sm border-t border-line pt-5 text-body">
          {total} building types · {APPLICATIONS.groups.length} markets
        </p>

        <div className="mt-12 space-y-14 lg:space-y-16">
          {APPLICATIONS.groups.map((group, i) => (
            <ApplicationGroup key={group.title} group={group} index={i} />
          ))}
        </div>
      </Section>

      <SteelStrip />
      <Divider />

      {/* The company's own signature — what it makes and how fast — moved off
          the home page so each company's detail lives on its own page. */}
      <PrefabSolutions />
      <Divider />
      <VideoGrid group="prefab" />

      <ContactCta />
    </>
  )
}

type Group = (typeof APPLICATIONS.groups)[number]

function ApplicationGroup({ group, index }: { group: Group; index: number }) {
  const ref = useReveal<HTMLDivElement>({ stagger: 0.05 })

  return (
    <div ref={ref}>
      {/* The market's own header row: number, name, and how many types are
          under it, so the band announces its own size before it is read. */}
      <div className="reveal flex items-baseline gap-4 border-b border-line pb-4">
        <span className="text-[0.78rem] font-semibold text-accent tabular-nums">0{index + 1}</span>
        <h2 className="display-opsz font-display text-[1.3rem] leading-tight font-semibold text-heading">
          {group.title}
        </h2>
        <span className="tech-sm ml-auto shrink-0 text-body tabular-nums">
          {String(group.items.length).padStart(2, '0')}
        </span>
      </div>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {group.items.map((item) => (
          <li
            key={item.title}
            className="group/type reveal flex gap-4 rounded-2xl border border-line/70 bg-raised/40 p-5 transition-all duration-300 ease-micro hover:-translate-y-0.5 hover:border-accent/45 hover:bg-ground"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-ground text-accent transition-colors duration-300 ease-micro group-hover/type:border-accent/40 group-hover/type:bg-accent group-hover/type:text-ground">
              <svg
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d={APPLICATION_ICONS[item.icon] ?? APPLICATION_ICONS.office} />
              </svg>
            </span>

            <span className="min-w-0">
              <h3 className="font-display text-[0.98rem] leading-snug font-semibold text-heading">
                {item.title}
              </h3>
              <p className="mt-2 text-[0.85rem] leading-[1.65] text-body">{item.body}</p>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
