import { APPLICATIONS, LINE } from '../data/site'
import { useReveal } from '../lib/motion'
import { Eyebrow, Lede, Section, SectionTitle } from './ui'

const MASK = [
  'radial-gradient(82% 86% at 50% 50%, #000 58%, rgba(0,0,0,0.85) 80%, transparent 100%)',
  'linear-gradient(to right, transparent 0%, #000 3%, #000 97%, transparent 100%)',
  'linear-gradient(to bottom, transparent 0%, #000 7%, #000 93%, transparent 100%)',
].join(', ')

/**
 * Balaji Roofing's signature — the line itself.
 *
 * The group has three businesses and, until this section existed, only one of
 * them had anything to look at: the hero builds a shed, the build steps walk
 * through erecting it, and both belong to Balaji Prefab Solutions. Roofing had
 * a section drawing of a panel; trade had two dashed arrows. That is not a
 * group of three companies, it is one company with two footnotes.
 *
 * So this shows the thing only Balaji Roofing has: an owned production line.
 * The claim it makes — "the cladding schedule is ours to hold, not a
 * supplier's to miss" — is a claim about owning plant, and a picture of plant
 * is the only honest way to make it.
 *
 * ── Layout: stage left, stations right ────────────────────────────────────
 * The first version ran the line full-bleed at 21:9 with the header above it.
 * It measured fine and read as empty: the header's right half was dead space,
 * and a 52-unit line squeezed into a 21:9 strip was a diagram of a machine
 * rather than a look at one.
 *
 * Now the two columns carry each other. The camera tracks the station the list
 * is highlighting, so the drawing and the words are the same thought — the
 * grammar the hero already uses. Below `lg` it stacks, stage first, and the
 * list becomes a two-column grid rather than a tall ladder.
 */
export default function RoofingLine() {
  const reveal = useReveal<HTMLElement>({ stagger: 0.07 })

  return (
    <Section id="line" ref={reveal}>
      {/*
        The HEADER lives in the right column, not above the grid.

        Full-width above, its right half was dead space — which is what made a
        section with a running 3D line in it read as empty. Moving it into the
        right column means both columns carry something at every height: the
        line on the left, and the words that explain it on the right, from the
        eyebrow down to the small print.
      */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center lg:gap-12">
        {/*
          ── The words ──────────────────────────────────────────────────────
          FIRST in the DOM, and second in the layout.

          Stacked on a phone the stage used to come first, which meant a
          visitor met a machine before they were told what it was — a caption
          arriving after its picture. The `lg:order-*` classes put the stage
          back on the left at desktop, so only the phone reading order changes.
        */}
        <div className="lg:order-2">
          <Eyebrow>{LINE.eyebrow}</Eyebrow>
          {/* One size for every section heading — see SectionTitle. This one
              sits in a ~545px column so it takes two lines at lg, which is the
              cost of the headings all matching, and the right trade. */}
          <SectionTitle className="!mt-3">{LINE.title}</SectionTitle>
          <Lede>{LINE.lede}</Lede>

          <p className="tech-sm mt-8 text-body">Down the line</p>

          {/* Two columns below lg so the stations do not become a tall ladder
              under the stage on a phone; one column at lg, where it sits beside
              the stage and reads as a sequence. */}
          <ol className="mt-4 grid grid-cols-2 gap-x-6 lg:grid-cols-1 lg:gap-x-0">
            {LINE.stations.map((s, i) => {
              return (
                <li
                  key={s.id}
                  className={`flex gap-3.5 border-line/50 py-3 lg:border-t ${
                    i === 0 ? 'lg:border-t-0' : ''
                  }`}
                >
                  <span className="mt-0.5 text-[0.7rem] font-semibold tabular-nums text-accent">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.92rem] leading-tight text-heading">
                      {s.label}
                    </span>
                    <span className="mt-1 block text-[0.82rem] leading-snug text-body opacity-80">
                      {s.note}
                    </span>
                  </span>
                </li>
              )
            })}
          </ol>

          <p className="mt-6 border-t border-line/50 pt-4 text-[0.78rem] leading-[1.6] text-body">
            {LINE.note}
          </p>
        </div>
        {/* ── The line ───────────────────────────────────────────────────── */}
        <div className="reveal lg:order-1">
          {/*
            The whole line is in frame at every width, so the aspect only has to
            suit the column: wide when the stage is full-width on a phone,
            slightly less so in the lg column. The camera derives its distance
            from the stage's own aspect ratio (see Rig), which is what keeps the
            line filling the frame instead of floating in the middle of a
            letterbox at one breakpoint and overflowing at another.
          */}
          <div className="relative aspect-[16/10] w-full sm:aspect-[16/9] lg:aspect-[3/2] flex items-center justify-center">
            <video
              src="/roofing-line.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="size-full object-cover"
              style={{
                WebkitMaskImage: MASK,
                maskImage: MASK,
                WebkitMaskComposite: 'source-in',
                maskComposite: 'intersect',
              }}
            />
          </div>

          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-4">
            {LINE.figures.map((f) => (
              <div key={f.label}>
                <dd className="text-[1.35rem] leading-none font-semibold text-heading tabular-nums">
                  {f.value}
                  <span className="ml-1 text-[0.78rem] font-light text-accent">{f.unit}</span>
                </dd>
                <dt className="tech-sm mt-2 text-body">{f.label}</dt>
              </div>
            ))}
          </dl>

          {/* Whose coil it is. It sits under the sizes rather than in its own
              band: "0.42–0.80 TCT" and "Tata, Jindal, AMNS" answer the same
              question — what is this sheet — and a buyer asks them together.
              Names set in type, not the mills' marks, which are theirs. */}
          <div className="mt-8 border-t border-line/60 pt-5">
            <p className="tech-sm text-body">{APPLICATIONS.steel.eyebrow}</p>
            <ul className="mt-3 flex flex-wrap gap-2.5">
              {APPLICATIONS.steel.mills.map((mill) => (
                <li
                  key={mill.name}
                  className="rounded-xl border border-line bg-raised/40 px-4 py-2.5"
                >
                  <p className="font-display text-[1rem] leading-none font-semibold text-heading">
                    {mill.name}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  )
}
