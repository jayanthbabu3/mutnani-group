import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { prefersReducedMotion } from '../lib/motion'
import { BUILDING, COLOR, PERSON_HEIGHT, derived, frameZ, phaseProgress } from './layout'
import { createSignTexture } from './signTexture'
import { HORIZON, createSkyTexture } from './skyTexture'

/**
 * THE hero signature: a pre-engineered building erecting itself.
 *
 * Slab → columns → rafters → purlins → PUF wall panels → roof sheeting. It is
 * the group's actual sequence, in the group's actual order, which is the point
 * — every competitor in this industry shows a photograph of a finished shed,
 * so none of them shows the thing that is being sold: that the structure
 * arrives already made and goes up bolted, fast, in that order.
 *
 * How it is driven: one `progress` number, 0..1, tweened by GSAP on a plain
 * object and read inside useFrame. No React state per frame — a setState at
 * 60fps would re-render the whole hero. The parent owns the timeline so the
 * caption strip and the model share one playhead.
 *
 * Reduced motion gets the finished building, held still. Not a blank canvas
 * and not a broken half-built frame.
 */

type Props = {
  /** Ref the parent writes 0..1 into. Read every frame, never rendered. */
  progress: { current: number }
  /** Bumped by the parent to restart the build. */
  seq: number
  /** Paused when the hero is off-screen, so the loop costs nothing. */
  active: boolean
}

export default function BuildScene({ progress, seq, active }: Props) {
  return (
    <Canvas
      // Below 1 the diagonals of the steelwork alias badly; above 1.75 a mid
      // phone drops frames for pixels nobody sees.
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [30, 12, 34], fov: 34 }}
      // The stage is decorative; the caption strip beside it carries the
      // meaning for anyone who cannot see this.
      aria-hidden
      frameloop={active ? 'always' : 'never'}
    >
      <Rig progress={progress} active={active} />

      {/*
        Fog, matched to the sky's horizon stop by construction — both read
        HORIZON from skyTexture, so they cannot drift apart.

        `near` sits past the building (which is ~36 m from the camera) so the
        shed itself is never hazed; only the yard beyond it fades. That is what
        removes the hard edge where a finite ground plane used to end.
      */}
      <fog attach="fog" args={[HORIZON, 55, 190]} />
      <Sky />

      {/* Site light. The hemisphere's second colour is the bounce off the
          slab, so it must be a lit navy rather than the ground token — with
          near-black there, every downward-facing surface renders as a hole. */}
      <hemisphereLight args={['#d6e4ff', '#0d3260', 1.5] as const} />
      <directionalLight position={[18, 26, 14]} intensity={2.3} color="#fff4e0" />
      <directionalLight position={[-20, 12, -14]} intensity={0.9} color="#8fb0e4" />
      {/* Low fill from the camera side, so the near faces of the columns are
          not silhouettes against the lit roof. */}
      <directionalLight position={[14, 3, 20]} intensity={0.55} color="#c9dcff" />

      {/* No y offset: the camera aims at the building's own mid-height, so
          shifting the model down as well would double the correction. */}
      <group position={[0, 0, 0]}>
        {/* The yard exists from the first frame — a site is a place before it
            is a building, and it is what stops the shed floating in space. */}
        <Yard progress={progress} />
        <Slab progress={progress} seq={seq} />
        <Columns progress={progress} />
        <Rafters progress={progress} />
        <Purlins progress={progress} />
        <WallPanels progress={progress} />
        <Roof progress={progress} />
        <Doors progress={progress} />
        <Signage progress={progress} />
        {/* Handed over and occupied: the lorry backs up to the shutter and the
            crew walks the yard. Nothing here appears until the roof is on. */}
        <Occupation progress={progress} />
      </group>
    </Canvas>
  )
}

/**
 * The horizon. A back-faced sphere carrying the gradient from skyTexture.
 *
 * `fog: false` on the material matters: fog is on so the yard can dissolve into
 * the sky, and a fogged sky is a flat wall of the fog colour — the gradient
 * would be erased by the very thing it exists to blend with.
 *
 * `depthWrite: false` keeps it out of the depth buffer, so nothing in the scene
 * can ever be occluded by the inside of the sky.
 */
function Sky() {
  const sky = useMemo(() => createSkyTexture(), [])
  useEffect(() => sky.dispose, [sky])

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: sky.texture,
        side: THREE.BackSide,
        fog: false,
        depthWrite: false,
      }),
    [sky],
  )
  useEffect(() => () => material.dispose(), [material])

  return (
    <mesh material={material} scale={[1, 1, 1]}>
      <sphereGeometry args={[300, 24, 16]} />
    </mesh>
  )
}

/**
 * Camera work. It orbits a few degrees while the building goes up and settles
 * as it finishes — enough to read the structure as three-dimensional, not
 * enough to make anyone seasick. Nothing here is scroll-scrubbed.
 *
 * Drag to orbit, on top of that. A horizontal drag on the canvas adds yaw
 * with inertia (same feel as the living-walls villa), so a visitor can walk
 * round the shed and look at the far gable; let go and it coasts, then the
 * slow idle orbit takes back over. Vertical is left to the page —
 * `touch-action: pan-y` on the canvas — so a thumb swiping down a phone
 * scrolls instead of spinning the building. Reduced motion: no drag either;
 * the still frame stays still.
 */
function Rig({ progress, active }: { progress: { current: number }; active: boolean }) {
  const { camera, gl } = useThree()
  const still = prefersReducedMotion()
  const orbit = useRef({ y: 0, vel: 0, dragging: false })

  useEffect(() => {
    if (still) return
    const el = gl.domElement
    const o = orbit.current
    let lastX = 0
    let lastT = 0

    const down = (e: PointerEvent) => {
      o.dragging = true
      o.vel = 0
      lastX = e.clientX
      lastT = performance.now()
      el.setPointerCapture(e.pointerId)
      el.style.cursor = 'grabbing'
    }
    const move = (e: PointerEvent) => {
      if (!o.dragging) return
      const now = performance.now()
      const dx = e.clientX - lastX
      const dt = Math.max(now - lastT, 1)
      // Dragging right walks the camera left round the building, so the shed
      // turns the way the hand moves.
      o.y -= dx * 0.006
      o.vel = -(dx / dt) * 0.1
      lastX = e.clientX
      lastT = now
    }
    const up = () => {
      o.dragging = false
      el.style.cursor = 'grab'
    }

    el.style.cursor = 'grab'
    el.style.touchAction = 'pan-y'
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
    }
  }, [gl, still])

  useFrame((state) => {
    if (!active) return
    const t = progress.current
    const o = orbit.current
    if (!o.dragging) {
      // Coast after a release, then the idle orbit below is all that is left.
      o.y += o.vel
      o.vel *= 0.94
    }

    /**
     * Framing, derived rather than dialled in.
     *
     * The finished building is `span` wide, `length` deep and `ridge` tall, so
     * its half-diagonal in plan plus its height give the radius of a sphere
     * that contains all of it. Solving the vertical field of view for that
     * sphere is what guarantees nothing is ever cropped — hand-picked numbers
     * fit at one aspect ratio and clip at the next, which is exactly what
     * happened before this was computed.
     */
    const halfDiagonal = Math.hypot(derived.half, derived.length / 2)
    const contain = Math.hypot(halfDiagonal, derived.ridge / 2)
    const halfFov = ((camera as THREE.PerspectiveCamera).fov * Math.PI) / 360
    // 0.82× the strict bounding-sphere fit. Exactly 1.0 frames the whole
    // sphere, and the building is a box inside it, so most of that sphere is
    // empty air — coming in to 0.82 fills the stage while still clearing the
    // box's own corners at every aspect ratio.
    const radius = (contain / Math.sin(halfFov)) * 0.82

    /**
     * Camera height. Two failure modes bracket it, and both were seen here:
     * above the ridge with a high lookAt, the shed flattens into a plan drawing
     * and the columns stop reading as vertical; below the eave, the camera is
     * under the roof looking at rafter undersides the key light never reaches,
     * so the steel renders as black plates. Between the eave and the ridge,
     * tipped slightly down, is the only place both read.
     */
    const angle = still
      ? 0.78
      : 0.66 + Math.sin(state.clock.elapsedTime * 0.09) * 0.1 + t * 0.14 + o.y
    camera.position.set(
      Math.cos(angle) * radius,
      derived.ridge * 0.8 + t * 1.1 + (still ? 0 : Math.sin(state.clock.elapsedTime * 0.13) * 0.4),
      Math.sin(angle) * radius,
    )
    // Aims at the middle of the building's height, so it sits centred in the
    // stage rather than hanging off the bottom edge.
    camera.lookAt(0, derived.ridge * 0.44, 0)
  })

  return null
}

/**
 * Shared materials, created once for the whole scene.
 *
 * Module scope rather than a hook: a `useMemo` inside each part would give the
 * seven parts seven copies of the same six materials, which is seven times the
 * shader compiles for identical pixels. This file only ever loads inside the
 * lazy 3D chunk, so nothing is constructed until the scene is actually wanted.
 *
 * `transparent: true` everywhere is deliberate — every phase fades its parts
 * in, and an opaque material silently ignores `.opacity`, which shows up as
 * parts popping into existence instead of arriving.
 */
const MAT = {
  steel: new THREE.MeshStandardMaterial({
    color: COLOR.steel,
    metalness: 0.72,
    roughness: 0.38,
    transparent: true,
  }),
  steelDark: new THREE.MeshStandardMaterial({
    color: COLOR.steelDark,
    metalness: 0.6,
    roughness: 0.5,
    transparent: true,
  }),
  panel: new THREE.MeshStandardMaterial({
    color: COLOR.panel,
    metalness: 0.12,
    roughness: 0.62,
    transparent: true,
  }),
  roof: new THREE.MeshStandardMaterial({
    color: COLOR.roof,
    metalness: 0.35,
    roughness: 0.45,
    transparent: true,
  }),
  slab: new THREE.MeshStandardMaterial({
    color: COLOR.slab,
    metalness: 0.05,
    roughness: 0.95,
    transparent: true,
  }),
  /**
   * The sign tray gets its OWN material rather than reusing MAT.slab, and this
   * is not tidiness — Signage animates opacity on it, and these materials are
   * shared singletons. Pointing the sign at MAT.slab faded the actual slab
   * along with it. The sign FACE builds its own material in the component,
   * because it carries a canvas texture.
   */
  signPlate: new THREE.MeshStandardMaterial({
    color: COLOR.slab,
    metalness: 0.2,
    roughness: 0.6,
    transparent: true,
  }),
  /* ── The yard. Rough and unlit-looking, so it reads as ground. ────────── */
  yard: new THREE.MeshStandardMaterial({ color: COLOR.yard, roughness: 1, metalness: 0 }),
  drive: new THREE.MeshStandardMaterial({ color: COLOR.drive, roughness: 0.95, metalness: 0 }),
  kerb: new THREE.MeshStandardMaterial({ color: COLOR.kerb, roughness: 0.9, metalness: 0 }),

  /* ── Doors ─────────────────────────────────────────────────────────────── */
  shutter: new THREE.MeshStandardMaterial({
    color: COLOR.steel,
    metalness: 0.55,
    roughness: 0.42,
    transparent: true,
  }),
  doorFrame: new THREE.MeshStandardMaterial({
    color: COLOR.steelDark,
    metalness: 0.5,
    roughness: 0.5,
    transparent: true,
  }),
  /* The opening itself. Near-black so it reads as depth rather than a panel. */
  opening: new THREE.MeshStandardMaterial({ color: '#02132b', roughness: 1, metalness: 0 }),

  /* ── Scale figures ─────────────────────────────────────────────────────── */
  skin: new THREE.MeshStandardMaterial({ color: COLOR.skin, roughness: 0.85, transparent: true }),
  clothes: new THREE.MeshStandardMaterial({
    color: COLOR.clothes,
    roughness: 0.9,
    transparent: true,
  }),
  clothesAlt: new THREE.MeshStandardMaterial({
    color: COLOR.clothesAlt,
    roughness: 0.9,
    transparent: true,
  }),
  hiVis: new THREE.MeshStandardMaterial({
    color: COLOR.hiVis,
    roughness: 0.6,
    emissive: new THREE.Color(COLOR.hiVis),
    // Just enough to catch the eye at 20 px tall. A hi-vis vest is retro-
    // reflective, not self-lit, and above ~0.15 six of them start reading as
    // little lamps dotted round the yard.
    emissiveIntensity: 0.12,
    transparent: true,
  }),
}

/** Shared geometry for the crowd, so four people cost four draw calls, not twelve. */
const GEO = {
  torso: new THREE.CapsuleGeometry(0.19, 0.5, 4, 8),
  head: new THREE.SphereGeometry(0.115, 10, 8),
  leg: new THREE.CapsuleGeometry(0.075, 0.6, 3, 6),
  vest: new THREE.BoxGeometry(0.42, 0.44, 0.28),
}

/** Phase 1 — the slab, with the anchor-bolt grid the columns land on. */
function Slab({ progress, seq }: { progress: { current: number }; seq: number }) {
  const group = useRef<THREE.Group>(null)
  const grid = useRef<THREE.LineSegments>(null)

  // A fresh grid on every seq change would leak geometry; this is built once
  // and only its opacity is driven.
  const gridGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pts: number[] = []
    const half = derived.half + 1.2
    const long = derived.length / 2 + 1.2
    for (let x = -half; x <= half; x += 2) pts.push(x, 0, -long, x, 0, long)
    for (let z = -long; z <= long; z += 2) pts.push(-half, 0, z, half, 0, z)
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [])

  useEffect(() => () => gridGeometry.dispose(), [gridGeometry])
  // Nothing to reset per seq beyond the playhead the parent already rewinds,
  // but the dependency documents that the slab is stage one of each run.
  useEffect(() => {}, [seq])

  useFrame(() => {
    const p = phaseProgress(progress.current, 0)
    if (group.current) {
      group.current.scale.setScalar(0.82 + p * 0.18)
      const mat = group.current.children[0] as THREE.Mesh
      if (mat.material instanceof THREE.Material) mat.material.opacity = p
    }
    if (grid.current && grid.current.material instanceof THREE.LineBasicMaterial) {
      // The grid fades back out once the steel is up — it is a setting-out
      // drawing, and a setting-out drawing does not stay on site.
      grid.current.material.opacity = p * 0.5 * (1 - phaseProgress(progress.current, 4) * 0.75)
    }
  })

  return (
    <group ref={group}>
      <mesh position={[0, -0.15, 0]} material={MAT.slab}>
        <boxGeometry args={[BUILDING.span + 2.4, 0.3, derived.length + 2.4]} />
      </mesh>
      <lineSegments ref={grid} geometry={gridGeometry} position={[0, 0.02, 0]}>
        <lineBasicMaterial color={COLOR.accent} transparent opacity={0} />
      </lineSegments>
    </group>
  )
}

/**
 * Phase 2 — columns. Tapered built-up sections, as a real PEB uses: deeper at
 * the eave where the moment is, shallower at the base. They rise out of the
 * slab, each frame a beat behind the last down the length of the building.
 */
function Columns({ progress }: { progress: { current: number } }) {
  const refs = useRef<(THREE.Group | null)[]>([])

  const positions = useMemo(
    () =>
      frameZ.flatMap((z, frame) =>
        [-derived.half, derived.half].map((x, side) => ({ x, z, frame, side })),
      ),
    [],
  )

  useFrame(() => {
    const p = phaseProgress(progress.current, 1)
    positions.forEach((pos, i) => {
      const g = refs.current[i]
      if (!g) return
      // Staggered down the length: frame 0 first, the far frame last.
      const stagger = pos.frame / (BUILDING.frames - 1)
      const local = Math.min(1, Math.max(0, (p - stagger * 0.28) / 0.72))
      g.scale.y = Math.max(0.001, local)
      g.visible = local > 0.001
    })
  })

  return (
    <>
      {positions.map((pos, i) => (
        <group
          key={`${pos.frame}-${pos.side}`}
          ref={(el) => {
            refs.current[i] = el
          }}
          // Scaling y from the base, not the centre, so the column grows out
          // of the slab instead of expanding from its own middle.
          position={[pos.x, 0, pos.z]}
        >
          <mesh position={[0, BUILDING.eave / 2, 0]} material={MAT.steel}>
            <boxGeometry args={[0.34, BUILDING.eave, 0.62]} />
          </mesh>
          {/* The taper: a wedge widening toward the eave. */}
          <mesh position={[0, BUILDING.eave * 0.72, 0]} material={MAT.steelDark}>
            <boxGeometry args={[0.4, BUILDING.eave * 0.5, 0.22]} />
          </mesh>
          {/* Base plate, so the column visibly lands on something. */}
          <mesh position={[0, 0.06, 0]} material={MAT.steelDark}>
            <boxGeometry args={[0.9, 0.12, 1.1]} />
          </mesh>
        </group>
      ))}
    </>
  )
}

/**
 * THE SLOPE CONVENTION — read this before touching anything roof-shaped.
 *
 * Rafters, purlins and roof sheets all sit on the same two slopes, and getting
 * the sign wrong once produces a butterfly roof: high at the eaves, low at the
 * ridge, which is a valley gutter down the middle of the building and the exact
 * opposite of what a shed is. It happened here, so the rule is written down.
 *
 * For a slope on side `dir` (+1 = the +x eave, -1 = the -x eave):
 *   · the pivot is the EAVE point,  (dir * half, eave)
 *   · the ridge is inboard and up,  (0, eave + rise)
 *   · so the bar runs toward -dir in x, and the rotation about z that lifts its
 *     far end is  -dir * pitch.  Not `+dir * pitch`.
 *   · a mesh offset along the bar therefore sits at  -dir * length / 2
 *
 * `slopeNormal` gives the outward perpendicular, which is how anything stacks
 * on a slope: purlins ride 0.26 above the rafter, sheets 0.46, so the sheet is
 * always outboard of the purlin. Offsetting in +y instead — the other bug that
 * was here — pushes the purlins through the sheet at the ridge, because +y is
 * not perpendicular to a pitched plane.
 */
const slopeNormal = (dir: number) => ({
  x: dir * Math.sin(derived.pitch),
  y: Math.cos(derived.pitch),
})

/** The eave point of one slope, which every sloped part pivots on. */
const eavePoint = (dir: number) => ({ x: dir * derived.half, y: BUILDING.eave })

/**
 * Phase 3 — rafters. Two per frame, meeting at the ridge, and this is the
 * sentence the whole hero is making: there is no column in the middle. Each
 * one drops in from above and rotates up into pitch about its eave, which is
 * how a crane actually lands it.
 */
function Rafters({ progress }: { progress: { current: number } }) {
  const refs = useRef<(THREE.Group | null)[]>([])

  const rafters = useMemo(
    () => frameZ.flatMap((z, frame) => [-1, 1].map((dir) => ({ z, frame, dir }))),
    [],
  )

  useFrame(() => {
    const p = phaseProgress(progress.current, 2)
    rafters.forEach((r, i) => {
      const g = refs.current[i]
      if (!g) return
      const stagger = r.frame / (BUILDING.frames - 1)
      const local = Math.min(1, Math.max(0, (p - stagger * 0.3) / 0.7))
      // Drops from 8 m up and rolls flat-to-pitched on the way down.
      g.position.y = BUILDING.eave + (1 - local) * 8
      g.rotation.z = -r.dir * derived.pitch * local
      // No opacity here: MAT.steel is shared with the columns, so fading it
      // would fade them out too. The drop and the roll into pitch already read
      // as arrival — an opacity ramp on top would be a third emphasis.
      g.visible = local > 0.001
    })
  })

  return (
    <>
      {rafters.map((r, i) => (
        <group
          key={`${r.frame}-${r.dir}`}
          ref={(el) => {
            refs.current[i] = el
          }}
          // Pivot on the eave, per the slope convention above.
          position={[eavePoint(r.dir).x, BUILDING.eave, r.z]}
        >
          <mesh position={[(-r.dir * derived.slope) / 2, 0, 0]} material={MAT.steel}>
            <boxGeometry args={[derived.slope, 0.52, 0.4]} />
          </mesh>
        </group>
      ))}
    </>
  )
}

/** Phase 4 — purlins, running the length across the rafters. */
function Purlins({ progress }: { progress: { current: number } }) {
  const refs = useRef<(THREE.Mesh | null)[]>([])

  const purlins = useMemo(() => {
    const out: { x: number; y: number; dir: number; step: number }[] = []
    for (const dir of [-1, 1]) {
      const eave = eavePoint(dir)
      const normal = slopeNormal(dir)
      for (let n = 0; n <= BUILDING.purlinsPerSlope; n++) {
        const along = n / BUILDING.purlinsPerSlope
        out.push({
          // Along the slope from eave to ridge, then lifted clear of the
          // rafter along the slope's own perpendicular.
          x: dir * derived.half * (1 - along) + normal.x * 0.26,
          y: eave.y + BUILDING.rise * along + normal.y * 0.26,
          dir,
          step: n,
        })
      }
    }
    return out
  }, [])

  useFrame(() => {
    const p = phaseProgress(progress.current, 3)
    purlins.forEach((pl, i) => {
      const mesh = refs.current[i]
      if (!mesh) return
      // Eave upward, so the roof visibly fills in toward the ridge.
      const stagger = pl.step / (BUILDING.purlinsPerSlope + 1)
      const local = Math.min(1, Math.max(0, (p - stagger * 0.4) / 0.6))
      mesh.scale.z = Math.max(0.001, local)
      mesh.visible = local > 0.001
    })
  })

  return (
    <>
      {purlins.map((pl, i) => (
        <mesh
          key={`${pl.dir}-${pl.step}`}
          ref={(el) => {
            refs.current[i] = el
          }}
          position={[pl.x, pl.y, 0]}
          // Laid in the plane of the roof, not level — a level purlin on a
          // pitched roof reads as a mistake even at this size.
          rotation={[0, 0, -pl.dir * derived.pitch]}
          material={MAT.steelDark}
        >
          <boxGeometry args={[0.16, 0.28, derived.length + 0.6]} />
        </mesh>
      ))}
    </>
  )
}

/**
 * Phase 5 — the PUF wall panels. This is Balaji Roofing's product arriving on
 * Balaji Prefab's structure, which is the group's whole argument, so the panels
 * slide in horizontally from outside the building rather than fading: a fade
 * would be a graphic, a slide is a fitting sequence.
 *
 * All four walls are clad — the building closes. An earlier version left the
 * near two open as a cutaway, which kept the frame visible but read as an
 * unfinished shed with missing walls, and the last caption says "handover".
 *
 * The frame is not lost by closing it: phases 02 to 04 spend six of the eleven
 * seconds building the columns, rafters and purlins in full view, and the
 * gable triangles above the eave stay open, so the rafter pair and the ridge
 * are still readable in the finished frame.
 *
 * Order matters. The far long wall goes on first, then the two gables, and the
 * NEAR long wall last — so the cladding closes toward the camera and the
 * structure is watched disappearing behind it, rather than winking out.
 */
function WallPanels({ progress }: { progress: { current: number } }) {
  const refs = useRef<(THREE.Mesh | null)[]>([])

  const panels = useMemo(() => {
    const out: {
      pos: [number, number, number]
      rotY: number
      w: number
      /** Panel height. Less than the eave where it is a header over a door. */
      h: number
      /** Which axis this panel slides in along. Its sign comes from `pos`. */
      slide: 'x' | 'z'
      order: number
    }[] = []
    let order = 0

    const alongCount = Math.round(derived.length / BUILDING.panelWidth)
    const gableCount = Math.round(BUILDING.span / BUILDING.panelWidth)

    /**
     * The openings in the front gable, as [from, to, height] in x.
     *
     * A panel that falls inside one of these becomes a HEADER — a short panel
     * spanning only the wall above the opening — instead of being dropped. Drop
     * it entirely and there is a full-height slot of missing wall above the
     * door; keep it full height and the door is a sticker on a solid wall,
     * which is what it looked like first time round.
     *
     * Both openings are whole multiples of panelWidth and centred on module
     * centres, so every cut lands on a panel joint. See BUILDING.doorWidth.
     */
    const openings = [
      { from: -BUILDING.doorWidth / 2, to: BUILDING.doorWidth / 2, height: BUILDING.doorHeight },
      {
        from: BUILDING.wicketX - BUILDING.wicketWidth / 2,
        to: BUILDING.wicketX + BUILDING.wicketWidth / 2,
        height: BUILDING.wicketHeight,
      },
    ]

    /** How much of this module's full height is taken by an opening. */
    const cutAt = (x: number) => {
      const half = BUILDING.panelWidth / 2
      let cut = 0
      for (const o of openings) {
        // Overlap test on the module's own extent, not just its centre.
        if (x + half > o.from + 0.001 && x - half < o.to - 0.001) cut = Math.max(cut, o.height)
      }
      return cut
    }

    const longWall = (dir: number) => {
      for (let n = 0; n < alongCount; n++) {
        const z = -derived.length / 2 + n * BUILDING.panelWidth + BUILDING.panelWidth / 2
        out.push({
          pos: [dir * (derived.half + 0.22), BUILDING.eave / 2, z],
          rotY: Math.PI / 2,
          w: BUILDING.panelWidth,
          h: BUILDING.eave,
          slide: 'x',
          order: order++,
        })
      }
    }

    const gable = (dir: number) => {
      for (let n = 0; n < gableCount; n++) {
        const x = -derived.half + n * BUILDING.panelWidth + BUILDING.panelWidth / 2
        // Only the near gable has the doors in it.
        const cut = dir === 1 ? cutAt(x) : 0
        const h = BUILDING.eave - cut
        out.push({
          pos: [x, cut + h / 2, dir * (derived.length / 2 + 0.22)],
          rotY: 0,
          w: BUILDING.panelWidth,
          h,
          slide: 'z',
          order: order++,
        })
      }
    }

    // Far first, near last — the cladding closes toward the camera.
    longWall(-1)
    gable(-1)
    gable(1)
    longWall(1)

    return out
  }, [])

  useFrame(() => {
    const p = phaseProgress(progress.current, 4)
    panels.forEach((panel, i) => {
      const mesh = refs.current[i]
      if (!mesh) return
      const stagger = panel.order / panels.length
      const local = Math.min(1, Math.max(0, (p - stagger * 0.55) / 0.45))
      // Slides in along its own facing direction, from outside the building.
      // Each panel travels outward along its own facing normal, which is -x
      // for the far long wall and +z for the near gable. Signing this off the
      // panel's own position keeps the two walls consistent if either moves.
      const outward = (1 - local) * 5
      mesh.position.x = panel.pos[0] + (panel.slide === 'x' ? Math.sign(panel.pos[0]) * outward : 0)
      mesh.position.z = panel.pos[2] + (panel.slide === 'z' ? Math.sign(panel.pos[2]) * outward : 0)
      mesh.position.y = panel.pos[1] + (1 - local) * 0.6
      // Shared material — the horizontal slide is what says "fitted", so
      // nothing here needs a fade.
      mesh.visible = local > 0.001
    })
  })

  return (
    <>
      {panels.map((panel, i) => (
        <mesh
          key={panel.order}
          ref={(el) => {
            refs.current[i] = el
          }}
          position={panel.pos}
          rotation={[0, panel.rotY, 0]}
          material={MAT.panel}
        >
          {/* 60 mm thick, to scale: the depth here is the panel thickness. */}
          <boxGeometry args={[panel.w - 0.02, panel.h, 0.06]} />
        </mesh>
      ))}
    </>
  )
}

/**
 * Phase 6 — roof sheeting closes the envelope, unrolling from each eave up to
 * the ridge, which is the order it is actually laid in.
 *
 * The unroll is a scale on a GROUP pivoted at the eave, not on the mesh: a
 * centred box scaled in x grows out of its own middle in both directions, so
 * the sheet would appear in mid-air over the purlins and expand toward the
 * eave and the ridge at once.
 */
function Roof({ progress }: { progress: { current: number } }) {
  const refs = useRef<(THREE.Group | null)[]>([])

  const sheets = useMemo(
    () =>
      [-1, 1].map((dir) => {
        const eave = eavePoint(dir)
        const normal = slopeNormal(dir)
        return {
          dir,
          // Outboard of the purlins, on the slope's own perpendicular.
          x: eave.x + normal.x * 0.46,
          y: eave.y + normal.y * 0.46,
        }
      }),
    [],
  )

  useFrame(() => {
    const p = phaseProgress(progress.current, 5)
    sheets.forEach((_sheet, i) => {
      const g = refs.current[i]
      if (!g) return
      const local = Math.min(1, Math.max(0, (p - i * 0.18) / 0.82))
      g.scale.x = Math.max(0.001, local)
      g.visible = local > 0.001
    })
  })

  return (
    <>
      {sheets.map((sheet, i) => (
        <group
          key={sheet.dir}
          ref={(el) => {
            refs.current[i] = el
          }}
          position={[sheet.x, sheet.y, 0]}
          rotation={[0, 0, -sheet.dir * derived.pitch]}
        >
          <mesh position={[(-sheet.dir * derived.slope) / 2, 0, 0]} material={MAT.roof}>
            <boxGeometry args={[derived.slope, 0.09, derived.length + 0.9]} />
          </mesh>
        </group>
      ))}
    </>
  )
}

/**
 * The yard.
 *
 * Present from the first frame, because a site is a place before it is a
 * building — and because a slab with nothing under it reads as a product render
 * on a turntable, which is exactly what this looked like before.
 *
 * Everything here is a tint of the ground token, so the yard recedes and the
 * building stays the subject. It fades in with the slab rather than arriving
 * separately: the ground is not one of the six erection stages.
 */
function Yard({ progress }: { progress: { current: number } }) {
  const group = useRef<THREE.Group>(null)

  /** Just under the slab's underside, so there is no z-fighting on the edge. */
  const y = -0.32

  useFrame(() => {
    if (!group.current) return
    const p = phaseProgress(progress.current, 0)
    group.current.visible = p > 0.001
  })

  return (
    <group ref={group} position={[0, y, 0]}>
      {/*
        The yard itself. 400 m, which is absurd for a plot and exactly right
        here: at 86 m its far edge sat inside the frame as a hard horizontal
        line, and the whole scene read as a diorama on a tabletop. The plane has
        to run past the camera's horizon, not to the edge of the site.
      */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={MAT.yard}>
        <planeGeometry args={[400, 400]} />
      </mesh>

      {/* The apron: the concrete skirt a lorry actually stands on. */}
      <mesh
        position={[0, 0.02, derived.length / 2 + 9]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={MAT.drive}
      >
        <planeGeometry args={[BUILDING.span + 8, 20]} />
      </mesh>

      {/* The drive out to the gate, lining up with the shutter. */}
      <mesh
        position={[0, 0.03, derived.length / 2 + 26]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={MAT.drive}
      >
        <planeGeometry args={[9, 22]} />
      </mesh>

      {/* Kerbs. Two hairlines in three dimensions — the same line language as
          the rest of the page, and they are what make the apron read as a
          surface rather than a change of colour. */}
      {[-1, 1].map((dir) => (
        <mesh
          key={dir}
          position={[dir * (BUILDING.span / 2 + 4), 0.09, derived.length / 2 + 9]}
          material={MAT.kerb}
        >
          <boxGeometry args={[0.3, 0.18, 20]} />
        </mesh>
      ))}

      {/* Light masts. No lamp glow: the hero already spends its one glow on the
          gold wash behind the stage, and two more would flatten it. */}
      {[
        [-(BUILDING.span / 2 + 3.5), derived.length / 2 + 7],
        [BUILDING.span / 2 + 4, -(derived.length / 2 - 1)],
      ].map(([x, z]) => (
        <group key={`${x}-${z}`} position={[x, 0, z]}>
          <mesh position={[0, 4.5, 0]} material={MAT.steelDark}>
            <cylinderGeometry args={[0.09, 0.13, 9, 8]} />
          </mesh>
          <mesh position={[0, 9.05, 0.4]} material={MAT.steelDark}>
            <boxGeometry args={[0.7, 0.14, 1.1]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/**
 * The front doors — the roller shutter a lorry backs into, and the personnel
 * door beside it.
 *
 * This is what the front was missing. A blank clad gable is a box; a shutter
 * and a wicket door at human height is a building somebody works in, and it
 * also tells you instantly how big the shed is.
 *
 * The opening is a dark panel set slightly behind the cladding line, so the
 * shutter reads as sitting in a hole rather than stuck onto a wall. It arrives
 * in the roof-and-handover phase, after the walls it sits in.
 */
function Doors({ progress }: { progress: { current: number } }) {
  const group = useRef<THREE.Group>(null)
  const shutter = useRef<THREE.Mesh>(null)

  const z = derived.length / 2 + 0.24
  const { doorWidth, doorHeight, wicketWidth, wicketHeight } = BUILDING
  /** Clear of the shutter, on the side away from the drive. */
  const wicketX = -(doorWidth / 2 + 1.6)

  useFrame(() => {
    const p = phaseProgress(progress.current, 5)
    const local = Math.min(1, Math.max(0, (p - 0.35) / 0.5))
    if (!group.current) return
    group.current.visible = local > 0.001

    // The shutter rolls DOWN into its opening as the building is handed over,
    // then stops. Scaling from the head, not the middle, so it closes the way a
    // shutter closes.
    if (shutter.current) {
      const closed = Math.min(1, local * 1.4)
      shutter.current.scale.y = Math.max(0.001, closed)
      shutter.current.position.y = doorHeight - (doorHeight * closed) / 2
    }
  })

  return (
    <group ref={group}>
      {/* ── Roller shutter opening ──────────────────────────────────────── */}
      <mesh position={[0, doorHeight / 2, z - 0.12]} material={MAT.opening}>
        <boxGeometry args={[doorWidth, doorHeight, 0.06]} />
      </mesh>
      {/* The shutter curtain. Slats are drawn as a stack of thin boxes rather
          than a texture — at this size a texture would just be noise. */}
      <mesh ref={shutter} position={[0, doorHeight / 2, z]} material={MAT.shutter}>
        <boxGeometry args={[doorWidth - 0.16, doorHeight, 0.05]} />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh
          key={i}
          position={[0, 0.3 + i * ((doorHeight - 0.4) / 8), z + 0.04]}
          material={MAT.doorFrame}
        >
          <boxGeometry args={[doorWidth - 0.16, 0.035, 0.02]} />
        </mesh>
      ))}
      {/* Frame and head box. */}
      <mesh position={[0, doorHeight + 0.28, z + 0.04]} material={MAT.doorFrame}>
        <boxGeometry args={[doorWidth + 0.5, 0.56, 0.34]} />
      </mesh>
      {[-1, 1].map((dir) => (
        <mesh
          key={dir}
          position={[dir * (doorWidth / 2 + 0.14), doorHeight / 2, z + 0.02]}
          material={MAT.doorFrame}
        >
          <boxGeometry args={[0.28, doorHeight, 0.22]} />
        </mesh>
      ))}

      {/* ── Personnel door ──────────────────────────────────────────────── */}
      <mesh position={[wicketX, wicketHeight / 2, z - 0.1]} material={MAT.opening}>
        <boxGeometry args={[wicketWidth, wicketHeight, 0.06]} />
      </mesh>
      <mesh position={[wicketX, wicketHeight / 2, z + 0.02]} material={MAT.doorFrame}>
        <boxGeometry args={[wicketWidth + 0.16, wicketHeight + 0.14, 0.08]} />
      </mesh>
      <mesh position={[wicketX + 0.22, wicketHeight / 2, z + 0.07]} material={MAT.shutter}>
        <boxGeometry args={[wicketWidth - 0.14, wicketHeight - 0.12, 0.04]} />
      </mesh>
    </group>
  )
}

/**
 * The building in use: the crew walking the yard once it is handed over.
 *
 * This is the beat the animation was missing. Six stages of steel going up
 * prove capability; people moving around it afterwards is what makes it a place
 * rather than a product render. It is also the cheapest possible scale
 * reference — an 8.5 m eave means nothing until there is a 1.75 m figure
 * standing under it, and the roller shutter only reads as lorry-sized once
 * somebody is walking past it.
 *
 * A lorry was here too and has been removed: at the size the stage occupies it
 * was a pale box that obscured the door it was meant to explain, and it made
 * the yard busier without making it more legible. People alone do the job.
 *
 * All of it appears only after the roof, and under reduced motion the crew
 * stands still at their route midpoints instead of walking.
 */
function Occupation({ progress }: { progress: { current: number } }) {
  const group = useRef<THREE.Group>(null)
  const crew = useRef<(THREE.Group | null)[]>([])
  const still = prefersReducedMotion()

  /**
   * Routes, in yard metres. Each person walks their segment, turns, walks back.
   *
   * Straight segments rather than splines on purpose: at this scale nobody can
   * see the difference except that a figure drifting along a curve reads as
   * floating. Speeds are deliberately unequal and the offsets are spread, so
   * the group never falls into step — six people moving in sync reads as a
   * screensaver.
   */
  const routes = useMemo(() => {
    const front = derived.length / 2
    return [
      // Across the apron in front of the shutter, left to right.
      { from: [-8, front + 6.5], to: [7, front + 7.2], speed: 0.1, offset: 0, vest: true },
      // Walking out toward the gate.
      { from: [1.5, front + 9], to: [2.5, front + 22], speed: 0.072, offset: 0.45, vest: false },
      // Down the near long side of the shed.
      {
        from: [derived.half + 3.2, -(front - 2)],
        to: [derived.half + 3.8, front + 3],
        speed: 0.061,
        offset: 0.7,
        vest: true,
      },
      // A pair standing and talking by the personnel door — barely moving.
      {
        from: [BUILDING.wicketX - 1.9, front + 2.4],
        to: [BUILDING.wicketX - 1.4, front + 3.3],
        speed: 0.028,
        offset: 0.2,
        vest: false,
      },
      {
        from: [BUILDING.wicketX - 0.7, front + 3.2],
        to: [BUILDING.wicketX - 1.1, front + 2.2],
        speed: 0.031,
        offset: 1.15,
        vest: true,
      },
      // One coming round the far corner, so the yard has depth.
      {
        from: [-(derived.half + 4), -(front - 4)],
        to: [-(derived.half + 3.4), front + 5],
        speed: 0.055,
        offset: 1.4,
        vest: false,
      },
    ]
  }, [])

  useFrame((state) => {
    const p = phaseProgress(progress.current, 5)
    const local = Math.min(1, Math.max(0, (p - 0.55) / 0.45))
    if (group.current) group.current.visible = local > 0.001
    if (local <= 0.001) return

    routes.forEach((route, i) => {
      const g = crew.current[i]
      if (!g) return

      // Triangle wave: 0 → 1 → 0, so they walk out and back with no teleport
      // at the seam.
      const raw = still ? 0.5 : (state.clock.elapsedTime * route.speed + route.offset) % 2
      const t = raw > 1 ? 2 - raw : raw
      const forward = raw <= 1

      g.position.x = route.from[0] + (route.to[0] - route.from[0]) * t
      g.position.z = route.from[1] + (route.to[1] - route.from[1]) * t

      // Face the direction of travel, which flips on the return leg.
      const dx = (route.to[0] - route.from[0]) * (forward ? 1 : -1)
      const dz = (route.to[1] - route.from[1]) * (forward ? 1 : -1)
      g.rotation.y = Math.atan2(dx, dz)

      // A small bob at stride frequency. Without it they glide, which is the
      // single thing that gives away a figure moving along a path.
      g.position.y = still ? 0 : Math.abs(Math.sin(state.clock.elapsedTime * 3.4 + i)) * 0.035
    })
  })

  return (
    <group ref={group}>
      {routes.map((route, i) => (
        <group
          key={i}
          ref={(el) => {
            crew.current[i] = el
          }}
        >
          <Person vest={route.vest} alt={i % 2 === 1} />
        </group>
      ))}
    </group>
  )
}

/**
 * One figure, five primitives.
 *
 * Deliberately not a detailed model: at the size these occupy, anything more
 * than a silhouette is wasted polygons, and a half-detailed human reads worse
 * than a clean abstraction. What matters is the height and the proportions.
 */
function Person({ vest, alt }: { vest: boolean; alt: boolean }) {
  const h = PERSON_HEIGHT
  return (
    <group>
      <mesh
        geometry={GEO.leg}
        material={alt ? MAT.clothesAlt : MAT.clothes}
        position={[0.1, h * 0.22, 0]}
      />
      <mesh
        geometry={GEO.leg}
        material={alt ? MAT.clothesAlt : MAT.clothes}
        position={[-0.1, h * 0.22, 0]}
      />
      <mesh
        geometry={GEO.torso}
        material={alt ? MAT.clothesAlt : MAT.clothes}
        position={[0, h * 0.62, 0]}
      />
      {vest ? <mesh geometry={GEO.vest} material={MAT.hiVis} position={[0, h * 0.63, 0]} /> : null}
      <mesh geometry={GEO.head} material={MAT.skin} position={[0, h * 0.92, 0]} />
    </group>
  )
}

/**
 * The last beat: the division's sign lights on the NEAR gable, above the door.
 *
 * It reads "BALAJI PREFAB / SOLUTIONS" beside the group's mark, because that is
 * the division whose product the whole animation has just built. It used to be
 * an abstract gold block with two white bars standing in for a wordmark, which
 * told a visitor nothing and read as a missing texture — the type is drawn on a
 * canvas now, in the page's own Manrope, over the real logo mark. See
 * `signTexture.ts` for why a canvas and not geometry.
 *
 * Near, not far: the camera orbits the +x/+z side, so a sign on the far gable is
 * a sign nobody in the hero ever sees.
 *
 * It is also the only gold in the model besides the crew's vests, which is what
 * keeps the accent inside its budget — a shed clad in gold panels would look
 * like a trophy, not a building.
 */
function Signage({ progress }: { progress: { current: number } }) {
  const ref = useRef<THREE.Group>(null)
  const gl = useThree((state) => state.gl)

  /**
   * Built once. It is keyed on nothing but the renderer, because the copy is
   * fixed — if it ever comes from `content/site.json`, key it on that string or
   * the sign will silently keep the old text.
   */
  const sign = useMemo(
    () =>
      createSignTexture({
        title: 'Balaji Prefab',
        subtitle: 'Solutions',
        anisotropy: gl.capabilities.getMaxAnisotropy(),
      }),
    [gl],
  )

  useEffect(() => sign.dispose, [sign])

  /**
   * The sign's own material, holding the canvas as both map and emissive map.
   *
   * Emissive as well as diffuse so it reads as an illuminated fascia at dusk —
   * which is what the navy ground implies — without adding a light. The one
   * glow this hero spends is the CSS gold wash behind the stage; a point light
   * here would be a second.
   *
   * Keep `emissiveIntensity` LOW. Because the emissive map is the same canvas
   * as the diffuse map, intensity adds the artwork on top of itself: at 0.55
   * the white type and the gold rule blew past white, the letterforms bloomed
   * into each other and the middle of "BALAJI PREFAB" became unreadable. The
   * job here is a faint lift off the wall, not a light source.
   */
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: sign.texture,
        emissive: new THREE.Color('#ffffff'),
        emissiveMap: sign.texture,
        emissiveIntensity: 0,
        roughness: 0.55,
        metalness: 0.1,
        transparent: true,
      }),
    [sign],
  )

  useEffect(() => () => material.dispose(), [material])

  useFrame(() => {
    const p = phaseProgress(progress.current, 5)
    const local = Math.min(1, Math.max(0, (p - 0.6) / 0.4))
    if (!ref.current) return
    ref.current.visible = local > 0.001
    ref.current.scale.setScalar(0.94 + local * 0.06)
    material.opacity = local
    // Comes up rather than snapping on, so the sign lighting reads as the last
    // thing that happens at handover. See the note on the material: this number
    // is deliberately small — it is a lift, not a lamp.
    material.emissiveIntensity = local * 0.14
    MAT.signPlate.opacity = local
  })

  /** Sized to the fascia band between the door head and the eave. */
  const width = 6.4
  const height = width / 4

  return (
    <group ref={ref} position={[0, BUILDING.eave * 0.76, derived.length / 2 + 0.3]}>
      {/* The tray the sign sits in, a hair larger than the face, so the panel
          has an edge instead of floating on the cladding. */}
      <mesh position={[0, 0, -0.05]} material={MAT.signPlate}>
        <boxGeometry args={[width + 0.16, height + 0.16, 0.1]} />
      </mesh>
      <mesh material={material}>
        <planeGeometry args={[width, height]} />
      </mesh>
    </group>
  )
}
