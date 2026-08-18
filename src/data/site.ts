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

const schema = z.object({
  site: z.object({
    name: z.string().min(1),
    role: z.string(),
    city: z.string(),
    basedLine: z.string(),
    /** CLIENT · international form, drives every wa.me and tel: link */
    phone: z.string().regex(/^\+\d{10,15}$/, 'phone must be international, e.g. +919000000000'),
    /** CLIENT */
    phoneDisplay: z.string(),
    /** CLIENT · the older Balaji Prefab line, kept live in the footer */
    phoneAlt: z.string().regex(/^\+\d{10,15}$/),
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
  nav: z.array(z.object({ href: z.string().startsWith('#'), label: z.string() })).length(4),
  /** Desktop-only links. The tab bar takes exactly four, so these never reach it. */
  navExtra: z.array(z.object({ href: z.string().startsWith('#'), label: z.string() })),
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
   * CLIENT · the group's own story, and the only place on the page where its
   * OWN photography appears.
   *
   * `award` and `gallery` are real photographs taken from the group's own
   * site — not stock, not generated. That is the whole reason this section
   * earns pictures when the rest of the page deliberately refuses them; if
   * these are ever swapped, swap them for other real ones or drop the
   * section, never for stock.
   */
  about: z.object({
    eyebrow: z.string(),
    title: z.string(),
    /** One paragraph per entry. Two reads best; three is the ceiling. */
    body: z.array(z.string()).min(1).max(3),
    figures: z.array(z.object({ value: z.string(), label: z.string() })).min(2).max(4),
    cta: z.string(),
    award: z.object({
      image: z.string().min(1),
      imageAlt: z.string().min(1),
      /** Who gave it. Set on the plate across the foot of the photograph. */
      caption: z.string(),
      /** The year, set in gold beside it. */
      year: z.string(),
    }),
    /**
     * The three site photographs under the award.
     *
     * `label` and `note` are what each one IS — an unlabelled photograph of a
     * shed is decoration, a labelled one is a record. Keep both to two or
     * three words; they set on one line each.
     */
    gallery: z
      .array(
        z.object({
          id: z.string(),
          image: z.string().min(1),
          imageAlt: z.string().min(1),
          label: z.string().min(1),
          note: z.string().min(1),
        }),
      )
      .length(3),
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
    /**
     * Six stations. The 3D scene indexes into this array and the caption strip
     * reads the same one, so a caption can never name a station the line is not
     * currently at — same contract as the hero's `stageStages`.
     */
    stations: z.array(z.object({ id: z.string(), label: z.string(), note: z.string() })).length(6),
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
          lede: z.string(),
          caption: z.string(),
        }),
      )
      .length(2),
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
    /**
     * CLIENT · every market the group actually trades with.
     *
     * `city` is the PORT, not the capital — this is a shipping list, and the
     * buyer reading it wants to know the load clears through Jebel Ali, not
     * that the UAE exists.
     *
     * `region` groups the list. `dir` decides which of the two directions a
     * market is filed under; `both` files it under each, which is honest for
     * somewhere like Singapore that takes panels and sends back machinery.
     */
    markets: z
      .array(
        z.object({
          id: z.string(),
          country: z.string(),
          city: z.string(),
          /** Groups the list. Markets sharing a region are listed together in
              the order they appear here. */
          region: z.string(),
          dir: z.enum(['in', 'out', 'both']),
          note: z.string(),
        }),
      )
      .min(4),
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
            .array(z.object({ youtubeId: z.string().regex(/^[\w-]{11}$/, 'a YouTube id is 11 characters') }))
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
export const HERO = CONTENT.hero
export const STAGES = CONTENT.stageStages
export const ABOUT = CONTENT.about
export const GROUP = CONTENT.group
export const DIVISIONS = CONTENT.divisions
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
