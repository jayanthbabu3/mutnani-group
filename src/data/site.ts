import { z } from 'zod'
import raw from '../../content/site.json'

/**
 * Content lives in content/site.json so a CMS — or the client — can edit it
 * without touching code. This file is the contract: bad content fails the
 * build instead of shipping broken.
 *
 * Fields marked CLIENT are exposed in the CMS. Everything else is structural
 * and stays with the developer.
 */

/** An inner page's heading block. `meta` is its search and link-preview text. */
const pageHead = z.object({
  eyebrow: z.string(),
  title: z.string(),
  lede: z.string(),
  meta: z.string(),
})

const schema = z.object({
  site: z.object({
    name: z.string().min(1),
    role: z.string(),
    city: z.string(),
    /** CLIENT · international form, drives every wa.me and tel: link */
    phone: z.string().regex(/^\+\d{10,15}$/, 'phone must be international, e.g. +919000000000'),
    /** CLIENT */
    phoneDisplay: z.string(),
    /** CLIENT · a second contact line. Leave empty to hide it. */
    phoneAlt: z.union([z.literal(''), z.string().regex(/^\+\d{10,15}$/)]),
    /** CLIENT */
    phoneAltDisplay: z.string(),
    /** CLIENT */
    email: z.string().email(),
    /** CLIENT · second inbox, kept live in the enquiry section */
    emailAlt: z.string().email(),
    instagram: z.string().url(),
    linkedin: z.string().url(),
    whatsappMessage: z.string(),
    founded: z.number().int().min(1900).max(2100),
    founder: z.string(),
  }),
  /**
   * The four pages. The header shows them, and they are the phone tab bar —
   * which takes exactly four. Paths, not anchors: "/", "/companies"…
   */
  nav: z.array(z.object({ href: z.string().startsWith('/'), label: z.string() })).length(4),
  /** Desktop-only links to sections of the home page ("/#videos"). The tab
      bar takes exactly four, so these never reach it. */
  navExtra: z.array(z.object({ href: z.string().startsWith('/'), label: z.string() })),
  /** The heading block at the top of each inner page, and its search/share text. */
  pages: z.object({
    companies: pageHead,
    about: pageHead,
    contact: pageHead,
    applications: pageHead,
    roofing: pageHead,
  }),
  hero: z.object({
    /** CLIENT */
    eyebrow: z.string(),
    /**
     * Two lines, named rather than a tuple.
     *
     * It was `[[line1, line2]]`, which no CMS widget can round-trip — Sveltia
     * would have written back a list of objects and failed this schema on the
     * client's first save. A named pair is the same data and survives the trip.
     *
     * Both lines are costed against the type scale; see the note on the h1 in
     * components/Hero.tsx before rewriting either.
     */
    headline: z.object({ line1: z.string(), line2: z.string() }),
    /** Plain text; **double asterisks** mark the service names, set in the heading colour. */
    sub: z.string(),
    primaryCta: z.string(),
    secondaryCta: z.string(),
    stats: z.array(z.object({ value: z.number(), suffix: z.string(), label: z.string() })).max(4),
  }),
  /**
   * The hero's assembly sequence. Order IS the erection order, and the 3D
   * scene indexes into this array — adding a stage here without adding the
   * geometry gives a caption with nothing behind it, so they are asserted
   * equal in BuildScene.
   */
  stageStages: z.array(z.object({ id: z.string(), label: z.string(), note: z.string() })).length(6),
  /**
   * CLIENT · the group's story, and its awards.
   *
   * The awards are the reason this section exists in the form it does. They
   * are real, recent and named — Global Leaders 2025, two GIBF awards, an
   * India–China summit, CEO of the Year — and a photograph of somebody being
   * handed a certificate on a stage is the one kind of picture a construction
   * buyer reads as third-party proof rather than as marketing. Replace one
   * only with another real award; the moment a stock trophy goes in here the
   * whole section stops being evidence.
   */
  about: z.object({
    eyebrow: z.string(),
    title: z.string(),
    /** One paragraph per entry. Two reads best; three is the ceiling. */
    body: z.array(z.string()).min(1).max(3),
    figures: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .min(2)
      .max(4),
    cta: z.string(),
    awardsEyebrow: z.string(),
    /**
     * Newest first — the mosaic reads top-left to bottom-right and the most
     * recent award should be the one the eye lands on.
     *
     * `kind` decides what the tile mounts: an <img>, or a <video> that plays
     * in the lightbox. A video needs no poster field — the browser paints its
     * first frame, which for these ceremony clips is the stage.
     */
    awards: z
      .array(
        z.object({
          id: z.string(),
          kind: z.enum(['image', 'video']),
          src: z.string().min(1),
          alt: z.string().min(1),
          /** What was won. */
          title: z.string().min(1),
          /** Who gave it. */
          body: z.string().min(1),
          date: z.string().min(1),
          /**
           * The file's own pixel dimensions.
           *
           * Required, because the gallery lays itself out from the aspect
           * ratio BEFORE anything downloads. Measuring the images once they
           * land would mean a visible reflow every time this section scrolls
           * into view, and cropping to a fixed tile — the alternative — cut
           * people's faces in half, which is unusable on photographs whose
           * subject is who is standing on the stage.
           */
          width: z.number().int().positive(),
          height: z.number().int().positive(),
        }),
      )
      .min(3),
  }),
  /**
   * The heading over the three cards.
   *
   * It was hardcoded in Divisions.tsx. Any sentence a client might want to
   * reword belongs in content, not in a component they cannot open.
   */
  group: z.object({
    eyebrow: z.string(),
    title: z.string(),
    lede: z.string(),
  }),
  divisions: z
    .array(
      z.object({
        id: z.string(),
        company: z.string(),
        kind: z.string(),
        lede: z.string(),
        offers: z.array(z.string()).min(3).max(5),
        /**
         * CLIENT · a real photograph of this division's work.
         *
         * Empty by default, and empty is a valid state, not a missing asset:
         * with no image the division falls back to its technical drawing in
         * components/divisionArt.tsx, which is a finished treatment rather than
         * a placeholder. Fill this in only with the client's OWN photography —
         * generic warehouse stock is what made the previous attempt read as
         * unfinished.
         */
        image: z.string(),
        /** CLIENT · required whenever `image` is set; it is a content image. */
        imageAlt: z.string(),
        /**
         * CLIENT · more than one photograph for this company, shown as a
         * carousel with the title of each printed on it.
         *
         * Empty is the normal case: a division with no gallery falls back to
         * `image`, and then to its drawing. Only fill this where the company
         * genuinely makes several distinct things — one photograph per thing,
         * all shot the same way, or the carousel reads as a slideshow of
         * unrelated stock.
         */
        /**
         * CLIENT · a page this company has of its own, or null.
         *
         * Only Balaji Prefab has one so far — the list of building types it
         * puts up is too long for a card and too useful to drop.
         */
        more: z.object({ label: z.string(), href: z.string().startsWith('/') }).nullable(),
        gallery: z
          .array(z.object({ title: z.string(), src: z.string(), alt: z.string().min(1) }))
          .default([]),
        /**
         * True while `image` is AI-generated or otherwise not the group's own
         * photography.
         *
         * It is not read by any component — it exists so the repo, and not just
         * somebody's memory, records that these three photographs show
         * buildings, panels and a ship that do not exist. That matters on a
         * construction company's site: the section they sit in describes the
         * group's three real businesses, so a visitor reasonably reads them as
         * the group's work. Swap in the client's own photography and set this
         * to false. The README lists it as the first pre-launch task.
         */
        imagePlaceholder: z.boolean(),
      }),
    )
    .length(3)
    .refine(
      (divisions) => divisions.every((d) => !d.image || d.imageAlt.trim().length > 0),
      // Fails the build rather than shipping an unlabelled photograph. A
      // decorative drawing needs no alt text; a photo of real work does.
      { message: 'A division with an image must also have imageAlt' },
    ),
  /**
   * CLIENT · the appreciation letters, quoted and shown.
   *
   * The scans are REDACTED on purpose: the issuing company's letterhead,
   * footer, phone, email, website and the signing officer's name are painted
   * out before the image is exported, because the client's own customers are
   * contractors they do not want approached directly. The source PDFs live in
   * /source-letters, OUTSIDE public/, so the originals are never served.
   *
   * `quote` is the sentence the letter is worth reading for; keep it verbatim.
   */
  appreciation: z.object({
    eyebrow: z.string(),
    title: z.string(),
    lede: z.string(),
    items: z
      .array(
        z.object({
          id: z.string(),
          company: z.string(),
          scope: z.string(),
          date: z.string(),
          quote: z.string(),
          detail: z.string(),
          image: z.string(),
          imageAlt: z.string().min(1),
          width: z.number(),
          height: z.number(),
        }),
      )
      .min(1),
    cta: z.string(),
  }),
  /** CLIENT · what Balaji Roofing rolls, for /roofing-range. */
  roofingRange: z.object({
    items: z
      .array(z.object({ title: z.string(), body: z.string(), icon: z.string() }))
      .min(1),
  }),
  /**
   * CLIENT · the building types Balaji Prefab takes on, for /what-we-build.
   *
   * Groups in the client's own order, each with its own items. The bodies are
   * ours, written from what the group actually does — the client sent the
   * headings with the descriptions left blank — so they are the first thing
   * to check with them.
   */
  applications: z.object({
    /**
     * CLIENT · the mills whose coil the group's panels are rolled from.
     *
     * Names only, set in type — not the mills' logos. A supplier's trademark
     * on a customer's website is the supplier's to grant, and the client is
     * careful about exactly that elsewhere on this site.
     */
    steel: z.object({
      eyebrow: z.string(),
      title: z.string(),
      lede: z.string(),
      mills: z.array(z.object({ name: z.string(), note: z.string() })).min(1),
    }),
    groups: z
      .array(
        z.object({
          title: z.string(),
          items: z
            .array(z.object({ title: z.string(), body: z.string(), icon: z.string() }))
            .min(1),
        }),
      )
      .min(1),
  }),
  /**
   * CLIENT · Vertical 01, Balaji Prefab Solutions.
   *
   * The three companies each get one section of their own, in order, so a
   * visitor can tell them apart: 01 builds the building, 02 makes the panel,
   * 03 moves the goods. Keep the `Vertical 0n ·` prefix on all three eyebrows
   * — it is the only thing tying the sequence together on a phone, where the
   * three sections are a long way apart.
   */
  prefab: z.object({
    /** Just the number. The COMPANY NAME is the heading now — see below. */
    eyebrow: z.string(),
    /**
     * The company, not a slogan.
     *
     * It read the other way round at first: a slogan as the heading and the
     * company name buried in the eyebrow. That is backwards for a section
     * whose whole job is to say which of the three companies this is — the
     * name is the headline and the slogan is the line under it.
     */
    title: z.string(),
    /** The slogan, set in gold under the name. Keep it to one short line. */
    sub: z.string(),
    capabilities: z
      .array(z.object({ name: z.string(), body: z.string() }))
      .min(3)
      .max(6),
    figures: z
      .array(z.object({ value: z.string(), unit: z.string(), label: z.string() }))
      .min(2)
      .max(4),
    note: z.string(),
    image: z.string(),
    imageAlt: z.string(),
    /** See the note on divisions — same rule, same pre-launch swap. */
    imagePlaceholder: z.boolean(),
  }),
  build: z.object({
    eyebrow: z.string(),
    title: z.string(),
    lede: z.string(),
    steps: z
      .array(
        z.object({
          n: z.string(),
          title: z.string(),
          /** Exactly "runs in parallel" marks the two overlapping steps. */
          days: z.string(),
          body: z.string(),
          /** One or two words for the step rail, where the full title will not fit. */
          short: z.string(),
          /**
           * Who is holding the work at this step — "Our shop" vs "Your site".
           *
           * Content, not a lookup in the component. It began as a ternary on
           * the step number, which said "Site" for the drawing step and would
           * have silently gone wrong the moment a step was added or reordered.
           */
          where: z.string(),
          image: z.string(),
          imageAlt: z.string(),
          /** See the note on divisions — same rule, same pre-launch swap. */
          imagePlaceholder: z.boolean(),
        }),
      )
      .min(4),
  }),
  products: z.object({
    eyebrow: z.string(),
    title: z.string(),
    lede: z.string(),
    groups: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          items: z.array(z.string()).min(3),
          image: z.string(),
          imageAlt: z.string(),
          /** True while the photo is generated rather than the group's own work.
              Untick it in the CMS the day real photography replaces it. */
          imagePlaceholder: z.boolean(),
        }),
      )
      .min(2),
  }),
  projects: z.object({
    eyebrow: z.string(),
    title: z.string(),
    lede: z.string(),
    /** CLIENT */
    items: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          scope: z.string(),
          place: z.string(),
          figure: z.string(),
        }),
      )
      .min(3),
  }),
  /** Balaji Roofing's own line — the manufacturing signature. */
  line: z.object({
    eyebrow: z.string(),
    title: z.string(),
    lede: z.string(),
    note: z.string(),
    /** The stations down the line, in order. */
    stations: z
      .array(z.object({ id: z.string(), label: z.string(), note: z.string() }))
      .min(3)
      .max(6),
    figures: z.array(z.object({ value: z.string(), unit: z.string(), label: z.string() })).min(2),
  }),
  /** Balaji Prefab Import & Exports — the trade signature. */
  routes: z.object({
    eyebrow: z.string(),
    title: z.string(),
    lede: z.string(),
    /** The two Indian desks. Real coordinates — they are pinned on the map. */
    /**
     * The two directions, as content rather than as constants in the component.
     *
     * This copy makes CLAIMS about how the business runs, and it was hardcoded
     * in TradeRoutes.tsx where the client could not reach it. Anything the
     * client might need to correct has to be editable by the client.
     */
    modes: z
      .array(
        z.object({
          id: z.enum(['out', 'in']),
          label: z.string(),
          /** The small line under the button — "Global network", "Coming soon". */
          tag: z.string(),
          lede: z.string(),
          caption: z.string(),
        }),
      )
      .length(2),
    /**
     * How an import reaches the works, in steps. Deliberately names no
     * supplier country or city: the client does not want competitors reading
     * the sourcing list off the site. The globe carries "from everywhere";
     * these carry what the group does once it lands.
     */
    flow: z
      .array(z.object({ title: z.string(), body: z.string() }))
      .min(2)
      .max(4),
    /** `{origin}` and `{second}` are substituted with the two desk names. */
    note: z.string(),
    origin: z.object({
      name: z.string(),
      sub: z.string(),
    }),
    second: z.object({
      name: z.string(),
      sub: z.string(),
    }),
  }),
  /**
   * The logo strip. Visual proof, sitting right after `projects` names the
   * same clients in text — the two sections back each other up rather than
   * repeating one another.
   */
  partners: z.object({
    eyebrow: z.string(),
    title: z.string(),
    lede: z.string(),
    /** CLIENT · real clients only. Swap or add a company by dropping its
        logo in public/partners/ and pointing `logo` at it. `sector` is the
        one line under the mark — what the company does, not what we did. */
    items: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          logo: z.string(),
          logoAlt: z.string(),
          sector: z.string(),
        }),
      )
      .min(3),
  }),
  /**
   * CLIENT · site videos, grouped by site.
   *
   * `youtubeId` only — the 11-character id from a youtu.be link — never a
   * full URL, so one field can drive the poster, the embed and the outbound
   * link. Nothing loads from YouTube until a visitor presses play; see
   * components/SiteVideos.tsx. `place` may be empty when the group has not
   * said where the footage is from — that is honest, not missing.
   */
  videos: z.object({
    eyebrow: z.string(),
    title: z.string(),
    lede: z.string(),
    sites: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          place: z.string(),
          videos: z
            .array(
              z.object({
                youtubeId: z.string().regex(/^[\w-]{11}$/, 'a YouTube id is 11 characters'),
              }),
            )
            .min(1),
        }),
      )
      .min(1),
  }),
  trust: z.object({
    eyebrow: z.string(),
    title: z.string(),
    points: z.array(z.object({ title: z.string(), body: z.string() })).min(3),
  }),
  /** CLIENT · both addresses, verbatim from the group's own site */
  offices: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        lines: z.array(z.string()).min(2),
        role: z.string(),
        /**
         * CLIENT · what gets typed into Google Maps for this office — the
         * building and road, not the flat number. Drives both the map tile in
         * Trust.tsx and its "Open in Google Maps" link, so a wrong pin is
         * fixed here once, not in code.
         */
        mapQuery: z.string().min(1),
      }),
    )
    .min(1),
  contact: z.object({ eyebrow: z.string(), title: z.string(), lede: z.string() }),
})

export const CONTENT = schema.parse(raw)

export const SITE = CONTENT.site
export const NAV_LINKS = CONTENT.nav
export const NAV_EXTRA = CONTENT.navExtra
export const PAGES = CONTENT.pages
export const HERO = CONTENT.hero
export const STAGES = CONTENT.stageStages
export const ABOUT = CONTENT.about
export const GROUP = CONTENT.group
export const DIVISIONS = CONTENT.divisions
export const APPRECIATION = CONTENT.appreciation
export const APPLICATIONS = CONTENT.applications
export const ROOFING_RANGE = CONTENT.roofingRange
export const BUILD = CONTENT.build
export const PREFAB = CONTENT.prefab
export const PRODUCTS = CONTENT.products
export const PROJECTS = CONTENT.projects
export const PARTNERS = CONTENT.partners
export const VIDEOS = CONTENT.videos
export const LINE = CONTENT.line
export const ROUTES = CONTENT.routes
export const TRUST = CONTENT.trust
export const OFFICES = CONTENT.offices

export type Division = (typeof DIVISIONS)[number]
export type BuildStep = (typeof BUILD.steps)[number]

/**
 * The anchor a division card owns.
 *
 * Prefixed, because the third division's own id is "trade" and so is the Global
 * Trade section's — two elements with `id="trade"` meant the "Global trade" nav
 * link scrolled to a card in the divisions grid instead of the section, and the
 * mobile tab bar's IntersectionObserver watched whichever one it found first.
 * Anything linking to a division must go through this.
 */
export const divisionAnchor = (id: string) => `division-${id}`

export const whatsappHref = (message: string = SITE.whatsappMessage) =>
  `https://wa.me/${SITE.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
