import { useEntrance } from '../lib/motion'
import { Shell, TwoTone } from './ui'

/**
 * The top of an inner page: where you are, what the page is, one line on it.
 *
 * Deliberately smaller than the home hero — the home page sells, the inner
 * pages answer a question the visitor already asked by clicking — but it is
 * the page's one `h1`, in the same two logo colours and with the same
 * entrance as the home headline, so arriving on a page feels like the site
 * rather than a document.
 *
 * The blueprint grid behind it is the one under the home hero's stage, faded
 * in below the header and out toward the content, so it frames the heading
 * without showing through the header bar or reaching the first section.
 *
 * `.page-hero` also releases the section after it from the one-screen minimum
 * (see index.css) — without that, the first section's content sat centred in
 * a full screen, half a screen below the heading that introduces it.
 */
export default function PageHero({
  eyebrow,
  title,
  lede,
  crumb,
}: {
  eyebrow: string
  /** " | " switches blue to green, as in every section title. */
  title: string
  lede: string
  /** The page's name in the breadcrumb. */
  crumb: string
}) {
  const ref = useEntrance<HTMLElement>(0.05)

  return (
    <header ref={ref} className="page-hero relative isolate overflow-hidden pt-32 pb-6 lg:pt-40 lg:pb-8">
      <div
        aria-hidden
        className="blueprint absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,transparent_0%,#000_30%,rgba(0,0,0,0.45)_65%,transparent_100%)]"
      />
      <Shell>
        <nav aria-label="Breadcrumb" data-entrance className="tech-sm text-body">
          <a href="/" className="transition-colors duration-200 ease-micro hover:text-accent">
            Home
          </a>
          <span className="mx-2.5 text-accent/60" aria-hidden>
            /
          </span>
          <span aria-current="page" className="text-heading">
            {crumb}
          </span>
        </nav>

        <p data-entrance className="tech mt-8 flex items-center gap-3 text-accent/85">
          <span className="h-px w-6 bg-accent/50" />
          {eyebrow}
        </p>

        <h1
          data-entrance="lines"
          className="mt-5 max-w-4xl font-display text-[clamp(2rem,4.4vw,3.5rem)] leading-[1.08] font-bold tracking-tight text-heading"
        >
          <TwoTone text={title} />
        </h1>

        <p
          data-entrance="rise"
          className="mt-6 max-w-2xl text-[1rem] leading-[1.75] text-body lg:text-[1.05rem]"
        >
          {lede}
        </p>
      </Shell>
    </header>
  )
}
