# Mutnani Group of Companies

Marketing site for the group and its three companies — Balaji Prefab Solutions
(pre-engineered construction), Balaji Roofing Pvt. Ltd. (PUF panel and roofing
manufacture), and Balaji Prefab Import & Exports (global trade).

React 19 · TypeScript · Vite 8 · Tailwind v4 · GSAP/ScrollTrigger · Lenis ·
react-three-fiber · zod.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build  → dist/
npm run lint
npm run format
```

---

## One signature per company

**Hero — the building erects itself.** `src/three/BuildScene.tsx`. Slab →
columns → rafters → purlins → PUF wall panels → roof sheeting, on an 11-second
loop with a 4.5-second hold on the finished building. The caption strip beside
it names the stage currently being built, reading the same playhead the model
does, so the animation is legible as a process rather than admired as an effect.
The whole 3D bundle is a separate lazy chunk and never loads before first paint.

Then it is handed over and *occupied*: a roller shutter and a personnel door in
the front gable, **"BALAJI PREFAB / SOLUTIONS" on the fascia above it**, and six
people walking the yard. That last beat is not
decoration — an 8.5 m eave means nothing until there is a 1.75 m figure standing
under it, and the shutter only reads as lorry-sized once somebody walks past it.
The yard, apron, drive and kerbs are there from the first frame, because a slab
with nothing under it reads as a product render on a turntable.

Three numbers in there are load-bearing:

- **The yard plane is 400 m.** Absurd for a plot, correct here: at 86 m its far
  edge sat inside the frame as a hard horizontal line and the scene read as a
  diorama on a tabletop. It has to run past the camera's horizon.
- **The door openings are whole multiples of `panelWidth`, centred on module
  centres.** The cladding is cut by whole panels, so a 4.4 m shutter leaves a
  300 mm sliver of wall either side of its frame.
- **The crew's speeds and offsets are deliberately unequal.** Six people moving
  in step reads as a screensaver.

The stage has **no container** — no grid, no border, no radius. It had one, and it was right while the stage
held an abstract drawing — but graph paper behind a rendered building reads as
leftover scaffolding, and the grid stopped dead at the yard's edge, putting a
hard seam across the middle of the frame. The horizon now lives inside the scene:
`src/three/skyTexture.ts` paints a dusk gradient onto a back-faced sphere, and
`<fog>` in `BuildScene` is matched to it so the 400 m yard dissolves into the sky
rather than ending somewhere. Both read the same exported `HORIZON` constant, so
they cannot drift apart. Two traps in there:

- **The gradient stops are placed for a SPHERE.** Texture `v` runs zenith (0) →
  nadir (1), so the horizon is at `v = 0.5`, not `v = 1`. Putting the horizon
  colour at the bottom of the ramp leaves the exact hard line the sky exists to
  remove — that bug shipped for one iteration and is worth not repeating.
- **`fog: false` and `depthWrite: false` on the sky material.** Fogging the sky
  flattens it to a wall of the fog colour, erasing the gradient; writing depth
  lets the inside of the sphere occlude the scene.

The `.blueprint` grid is kept in the PUF panel section, which genuinely is a
drawing.

The card edge went the same way and for the same reason: a bright sky inside a
bordered rounded rect on a dark page reads as a box stuck on top of the design.
Two things remove it, and both are needed:

- **The sky's zenith is `--color-ground` exactly.** At the top of the frame the
  sky and the page are the same colour, so there is no edge to see. If the
  ground token changes, `skyTexture.ts` must change with it.
- **`.stage-bleed` in `index.css` feathers the edges.** Two linear ramps
  intersected with `mask-composite`, *not* one radial: the building fills most
  of the frame, so any radial tight enough to reach zero alpha at the top edge
  also eats the roof, and any radial loose enough to spare the roof leaves the
  edges ~40% opaque — still a visible rectangle. Narrow bands at each edge fade
  only the margins and leave the middle untouched. WebKit needs the older
  `-webkit-mask-composite: source-in` keyword alongside the standard one.

The sign is real type, not geometry: `src/three/signTexture.ts` draws the lockup
on a 2D canvas — the page's own Manrope over `/mark.png`, the same asset the
header uses — and hands it to three.js as a texture. It was an abstract gold
block with two white bars, which told a visitor nothing. Two things there are
easy to break: the texture needs `colorSpace = SRGBColorSpace` or every colour
comes out washed and pale, and it needs `anisotropy` or the sign blurs to mud at
the steep angle it is almost always seen from. To change the wording, edit the
`createSignTexture` call in `Signage`; if the copy ever moves into
`content/site.json`, key the `useMemo` on it or the sign will keep the old text.

**The three verticals, numbered.** After the build process the page runs the
three companies in order, each with one section of its own and a `Vertical 0n ·`
prefix on its eyebrow: **01** `components/PrefabSolutions.tsx` builds the
building, **02** `components/RoofingLine.tsx` makes the panel that clads it,
**03** `components/TradeRoutes.tsx` moves the goods. The desktop nav's secondary
links point at those three ids.

Keep the number prefix on all three. It is the only thing tying the sequence
together on a phone, where the three sections are thousands of pixels apart and
nothing else says they are a set. Section 01 is deliberately NOT a repeat of the
Divisions cards near the top: the cards answer "who are these three companies",
01 answers "what will they actually build for me".

Their titles and ledes are kept to one line each. They ran to four-line titles
and 220-character ledes, which is survivable on a desktop and awful on a 360px
phone — every one of the three now fits on a single line above `sm`, and two
lines at worst on the narrowest phone.

**Balaji Roofing — the line.** `src/three/PanelLineScene.tsx`, section
`components/RoofingLine.tsx`. Coil at one end, finished cut-to-length panel
stacked at the other, running continuously: decoiler → roll-formers → foaming
head → double-belt press → cut-off saw → stack. The whole line is in frame at
once — a close-up of the press is a photograph of a press, and the argument
here is that it IS a line.

This exists because the page had a distribution problem, not a decoration
problem: prefab owned the hero *and* the build steps, while roofing had one
section drawing and trade had two dashed arrows. That is not a group of three
companies, it is one company with two footnotes. Each division now has one piece
that makes its own argument — and roofing's argument ("the cladding schedule is
ours to hold, not a supplier's to miss") is a claim about owning plant, which
only a picture of plant can make.

Two things to know before editing it:

- **The second Canvas is nearly free.** three.js is ~880 KB and already in the
  page's lazy 3D chunk; this scene shares that module, so the marginal cost is
  the file itself. Check the build output — `BuildScene` is ~15 KB on top of the
  shared chunk, not another copy of three.
- **The caption is driven by one phase over the full line length**, not by
  whichever pooled slab is furthest right. Reading it off the pool pinned the
  caption to "06 · Stack" forever, because the slabs wrap independently and
  there is almost always one near the end.
- **The line is turned away from the camera (`YAW`) on purpose.** Shot head-on
  it cannot fill the stage: once the distance is set by the width, the visible
  height is fixed at `halfWidth / aspect` — about 19 units against a machine
  barely 3 tall, so the line sat in a tenth of the frame with air above and
  below, at every aspect and every distance. That is arithmetic, not framing,
  and no camera move fixes it. Turning the line converts its length into depth,
  and depth seen from above (`PITCH`) becomes height on screen. If you ever
  square it back up to an elevation, expect the empty stage back.

**Balaji Prefab Import & Exports — the dispatch yard.** `components/TradeRoutes.tsx`
+ `src/three/TradeYardScene.tsx`.

This section was rebuilt four times, and the first three failed the same way.
A fan of five labelled lanes; then a real world map (Natural Earth 110m,
decoded and projected at authoring time); then a dial plotting every market by
its true bearing and great-circle distance from the works. Each one drew WHERE
the goods go. None of them drew the trade — and a list of countries is not a
business. The business is that a finished panel gets on a lorry and a coil of
steel comes off one.

So the two halves swapped jobs. **The words carry the destinations** — a
destination is a name, and names belong in type. **The picture carries the
movement** — which is the one thing type cannot do. The shutter lifts, a
flatbed loaded with panels runs for the port; switch to imports and the whole
yard reverses, a truck coming in off the quay with a coil.

- **`mode` is the only state in the section.** It picks the direction the yard
  runs, the cargo on the bed, the copy, and which markets are listed. There is
  no separate filter any more: choosing to look at exports IS the filter.
  Markets marked `both` are listed under each, which is honest for somewhere
  like Singapore that takes panels and sends back machinery.
- **`DIR` is the only directional number in the scene** (+1 out, −1 in). It
  flips travel, cargo and which way the cab faces, so the two modes cannot
  drift apart — the import run is not a second model.
- **Why the map and the dial were dropped, so nobody rebuilds them.** The
  geography defeats the drawing: four Gulf ports sit inside *two degrees* of
  bearing from Hyderabad, and Singapore and Port Klang are on the same bearing
  to one decimal place. On a map they are one blob of pins; on a dial they are
  one blob of nodes. Spacing them evenly fixes the legibility and forfeits the
  geography, at which point the drawing is a decorated list.
- **The plant carries the name.** An unmarked white shed is a stock asset; the
  moment it carries "BALAJI PREFAB / IMPORT & EXPORTS" it is this company's
  yard. Same canvas-texture trick as the hero — see `signTexture.ts`.
- **The sign's tray sits 60 mm behind its face, not flush.** Flush made the two
  coplanar, the depth buffer had nothing to choose between them, and the sign
  flickered per pixel and per frame. `polygonOffset` on the face as well, for
  the shallow angles that wall is seen at.
- **What makes a box read as a building** is not detail for its own sake: a
  pitched roof with gables, a base plinth, the vertical joints where 1 m
  cladding modules meet, and its owner's name. The first version had none of
  them and looked like a white carton.
- **Third Canvas on the page, and it is cheap.** three.js is already in the
  shared lazy chunk; `TradeYardScene` is ~7.5 KB on top of it. It arms on its
  own IntersectionObserver, like the panel line.

## Every photograph on the site is generated, and every one is flagged

Fourteen images, 1.2 MB of WebP, in four sets:

| Folder | Used by | Count |
|---|---|---|
| `public/divisions/` | the three-up cards near the top | 3 |
| `public/build/` | the six build steps | 6 |
| `public/prefab/` | vertical 01's erection shot | 1 |
| `public/products/` | the order-list cards | 4 |

None of them is the group's own work. **Every one carries
`imagePlaceholder: true` in `content/site.json`**, and the CMS shows that as a
tick-box reading "This photo is a placeholder (not our own work)". Untick it the
day real photography replaces the file. The flag exists so nobody has to
remember which images were real — if the box is ticked, it is not.

The brief they were generated to, worth matching if you add more: architectural
/ editorial photography, blue-hour dusk, deep navy tonality, **one** warm gold
accent and nothing else warm, no text, no logos, no people looking at camera.
The `products/` and `prefab/` sets follow it exactly. The `divisions/` three
predate it and are bright daylight — they are the odd set out, and regenerating
them to the dusk brief is the one obvious outstanding job on the imagery.

When downloading generated images, **checksum them before you trust the
filename.** The ChatGPT download button silently did nothing on several
attempts and left the previous image in place, byte-identical, which is
indistinguishable from success if you go by filename. Fetch the blobs from the
page, `md5` the set, and open each one before converting.

**Read the warning at the top of `config.yml` before touching content.** Sveltia
writes back only the fields it declares: any key present in `site.json` but
missing from `config.yml` is silently deleted on the client's first save. Every
key is currently declared. `npm run build` will not catch an omission — only a
client save will, and by then the content is gone.

## Deploy

Static build, no server. Vercel/Netlify: build `npm run build`, publish `dist`.

---

## Notes for whoever picks this up

- **A tab that loads in the background stays blank until you switch to it.**
  That is deliberate (`lib/motion.ts`): a hidden tab gets no rAF, so the
  entrance timeline would sit frozen with everything staged invisible. It waits
  for `visibilitychange` and then plays the whole sequence. It also means
  **automated screenshots come out blank** unless the browser window is
  genuinely frontmost — that cost real time on this build.
- **`prefers-reduced-motion` is honoured everywhere** and gives a composed still
  frame: the finished building held with the crew standing still, and every
  section visible. Verified.
- **If the hero looks frozen on the finished building, check the URL.** During
  this build a temporary `?rm=1` flag forced reduced motion so the finished
  state could be inspected in an environment that reports every tab as hidden.
  It has been removed, but that is the shape of the symptom: reduced motion —
  whether from the OS setting or anything forcing it — pins the timeline at
  stage 06 by design. The full loop was verified by polling the caption:
  01 → 06, hold, then 01 again.
- **The hero headline is costed, not eyeballed.** Both lines measure 8.07em in
  Fraunces 300 at -0.02em tracking, and the tightest budget on the page is
  1280px (9.35em) — *not* the 360px phone (9.25em is wider relative to the type
  size). The comment on the `h1` in `Hero.tsx` has the numbers. Re-measure
  before changing the copy or the clamp; the failure mode is a third line
  appearing at one width nobody screenshotted.
- **Division anchors are namespaced** via `divisionAnchor()` in `data/site.ts`.
  The third division's own id is `trade` and so is the Global Trade section's;
  without the prefix the "Global trade" nav link scrolled to a card in the
  divisions grid.
