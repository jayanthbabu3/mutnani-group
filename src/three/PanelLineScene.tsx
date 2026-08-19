import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { COLOR } from './layout'
import { createSkyTexture } from './skyTexture'

/**
 * Balaji Roofing's line — the manufacturing signature.
 *
 * The hero shows a building assembling itself; this shows the PANEL being made,
 * which is the other half of what the group sells and had no picture at all.
 * Coil goes in at the left, a finished insulated panel comes out at the right,
 * continuously, in a loop.
 *
 * It is a SIDE ELEVATION on purpose, not a three-quarter view: a production line
 * is a sequence, and a sequence reads left-to-right. The camera drifts a few
 * degrees so it is unmistakably three-dimensional, and no further.
 *
 * ── Why a second Canvas is affordable ─────────────────────────────────────
 * three.js is ~890 KB and it is already in the page's lazy 3D chunk for the
 * hero. This scene lives in that same chunk and shares the module, so the
 * marginal cost here is this file, not another copy of three. The two canvases
 * are never both rendering: each one's `active` flag is driven by its own
 * IntersectionObserver, and they are a full section apart.
 */

/**
 * How fast the strip travels, in scene units per second.
 *
 * Module scope because the CAMERA follows the work now, and the camera and the
 * strip have to agree about where that is. Two copies of this number is a slow
 * drift between what is in frame and what the caption says.
 */
const SPEED = 3.2

/** Where each station sits along the line, in scene units. */
const LINE = {
  start: -26,
  end: 26,
  /** Belt height above the origin. */
  belt: 0,
  /** Station centres, left to right. Order matches content `line.stations`. */
  stations: [-22, -13, -4, 5, 13, 21],
} as const

const MAT = {
  frame: new THREE.MeshStandardMaterial({ color: '#8ba4cc', metalness: 0.55, roughness: 0.45 }),
  roller: new THREE.MeshStandardMaterial({ color: COLOR.steel, metalness: 0.8, roughness: 0.3 }),
  machine: new THREE.MeshStandardMaterial({ color: '#5b7db3', metalness: 0.35, roughness: 0.55 }),
  machineDark: new THREE.MeshStandardMaterial({ color: '#41608f', metalness: 0.35, roughness: 0.65 }),
  /** Bare steel strip, before the core goes in. */
  strip: new THREE.MeshStandardMaterial({ color: '#cfdcf0', metalness: 0.8, roughness: 0.22 }),
  /**
   * The finished sandwich panel.
   *
   * Blue, and deliberately NOT `COLOR.panel`.
   *
   * `COLOR.panel` is the off-white the hero building is clad in, and that is
   * right there — the group's own site photographs are all white-walled
   * buildings. But this line's output, coming off a coating line and stacked
   * on a pallet, is the coated sheet they actually sell, and that is blue in
   * every one of those same photographs. Rendering it white made the whole
   * end of the line read as bare, unfinished stock.
   *
   * Keep these two apart. Pointing both at one token turns the hero's walls
   * blue the next time somebody adjusts this.
   */
  panel: new THREE.MeshStandardMaterial({ color: COLOR.roof, metalness: 0.25, roughness: 0.5 }),
  /** The exposed core at the cut end — the one warm note in the scene. */
  core: new THREE.MeshStandardMaterial({ color: '#e8d9bc', roughness: 0.95 }),
  accent: new THREE.MeshStandardMaterial({
    color: COLOR.accent,
    emissive: new THREE.Color(COLOR.accent),
    emissiveIntensity: 0.2,
    roughness: 0.4,
  }),
}

const GEO = {
  roller: new THREE.CylinderGeometry(0.5, 0.5, 3.4, 14),
  leg: new THREE.BoxGeometry(0.45, 4.2, 0.45),
}

type Props = { active: boolean; onStation: (i: number) => void }

export default function PanelLineScene({ active, onStation }: Props) {
  /**
   * Where the work currently is, in scene x.
   *
   * Written every frame, so a ref. The camera no longer follows it — the whole
   * line is in frame — but it is kept because it is the single place the strip's
   * position is published, and the station index handed to the caption is
   * derived from the same pass.
   */
  const focus = useRef(LINE.stations[0])

  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 3.4, 42], fov: 34 }}
      aria-hidden
      frameloop={active ? 'always' : 'never'}
    >
      <Rig active={active} />
      <Sky />

      {/* Factory light: a broad cool fill from the roof sheets, one warm key so
          the steel has a direction, and a low bounce off the floor. */}
      <hemisphereLight args={['#dbe7ff', '#0d2a4f', 1.5] as const} />
      <directionalLight position={[10, 20, 14]} intensity={2.1} color="#fff3df" />
      <directionalLight position={[-14, 8, -8]} intensity={0.8} color="#8fb0e4" />

      {/* One scale for the whole line, and one turn — see SCALE and YAW. */}
      <group scale={SCALE} rotation-y={YAW}>
        <Conveyor />
        <Machines />
        <Strip active={active} onStation={onStation} focus={focus} />
        <Stack />
      </group>
    </Canvas>
  )
}

/**
 * A fixed frame on the WHOLE line, with a slow drift.
 *
 * It tracked the active station for a while, lerping along x so the machine the
 * list was naming filled the column. It showed the machines beautifully and it
 * was the wrong shot: you never saw the line. A production line's argument is
 * that it IS a line — coil at one end, stacked panel at the other, one
 * continuous thing — and a close-up of the press is a photograph of a press.
 *
 * So: the whole thing in frame, small, and the list beside it says which part
 * you are looking at. The distance is derived from the line's own extent rather
 * than dialled in, so changing the line's length reframes it automatically.
 *
 * `SCALE` on the scene group does the shrinking. Retuning every box would have
 * meant re-deriving the machine proportions; scaling the group preserves them.
 */
export const SCALE = 0.62

/**
 * How far the line is turned away from the camera, and how far above the deck
 * the camera sits.
 *
 * Both exist for one reason: a head-on shot of this line CANNOT fill the frame.
 * Once the distance is set by the width, the visible height is fixed at
 * `halfWidth / aspect` — about 19 units against a machine barely 3 units tall,
 * so the line sat in a tenth of the stage with air above and below it, at every
 * aspect ratio and every distance. There is no camera move that fixes that,
 * because it is arithmetic, not framing.
 *
 * Turning the line into the frame converts its length into DEPTH, and depth
 * seen from above becomes height on screen: the far end rides up, the near end
 * drops, and the run fills the stage. It also stops being an elevation drawing
 * and starts being a look down a factory floor, which is the shot this section
 * was asking for.
 */
const YAW = 0.52
const PITCH = 0.42

function Rig({ active }: { active: boolean }) {
  const { camera } = useThree()

  useFrame((state) => {
    if (!active) return

    // The line is turned, so what has to fit across the frame is its FORESHORT-
    // ENED width, not its full length. The rest of the length is now depth.
    const halfWidth = ((LINE.end - LINE.start) / 2 + 6) * SCALE * Math.cos(YAW)
    const cam = camera as THREE.PerspectiveCamera
    const halfFovY = (cam.fov * Math.PI) / 360
    // The line is wide and short, so the HORIZONTAL field is what has to
    // contain it — using the vertical half-angle here would frame it far too
    // tightly on a landscape stage.
    const halfFovX = Math.atan(Math.tan(halfFovY) * cam.aspect)
    // Horizontal component of the distance. The camera then rises to PITCH, so
    // the true eye-to-line distance is a little greater and the frame carries a
    // little margin — which the stage's edge feather wants anyway.
    const distance = halfWidth / Math.sin(halfFovX)

    const t = state.clock.elapsedTime
    camera.position.set(
      Math.sin(t * 0.06) * 1.6,
      distance * Math.tan(PITCH) + Math.sin(t * 0.1) * 0.3,
      distance,
    )
    camera.lookAt(0, 0.3, 0)
  })

  return null
}

function Sky() {
  const sky = useMemo(() => createSkyTexture(), [])
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
  return (
    <mesh material={material}>
      <sphereGeometry args={[300, 24, 16]} />
    </mesh>
  )
}

/** The bed: rollers on a frame, running the whole length. */
function Conveyor() {
  const rollers = useMemo(() => {
    const out: number[] = []
    for (let x = LINE.start; x <= LINE.end; x += 1.7) out.push(x)
    return out
  }, [])

  const legs = useMemo(() => {
    const out: number[] = []
    for (let x = LINE.start + 1; x <= LINE.end; x += 6) out.push(x)
    return out
  }, [])

  return (
    <group position={[0, LINE.belt, 0]}>
      {rollers.map((x) => (
        <mesh
          key={x}
          geometry={GEO.roller}
          material={MAT.roller}
          position={[x, -0.55, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      ))}
      {/* Side rails */}
      {[-1.9, 1.9].map((z) => (
        <mesh key={z} material={MAT.frame} position={[0, -1.1, z]}>
          <boxGeometry args={[LINE.end - LINE.start + 4, 0.5, 0.4]} />
        </mesh>
      ))}
      {legs.map((x) => (
        <group key={x}>
          <mesh geometry={GEO.leg} material={MAT.frame} position={[x, -3.2, -1.9]} />
          <mesh geometry={GEO.leg} material={MAT.frame} position={[x, -3.2, 1.9]} />
        </group>
      ))}
    </group>
  )
}

/**
 * The machines the strip passes through.
 *
 * Deliberately blocky. At this scale a faithful roll-former would be a grey
 * smudge; what has to read is that there are DISCRETE stations and the thing
 * coming out is not the thing that went in.
 */
function Machines() {
  const saw = useRef<THREE.Group>(null)

  useFrame((state) => {
    // The cut-off saw drops on a cycle. It is the one moving machine, so it is
    // what the eye lands on, which is right — cutting to length is the claim.
    const t = state.clock.elapsedTime % 4
    const drop = t < 0.45 ? Math.sin((t / 0.45) * Math.PI) : 0
    if (saw.current) saw.current.position.y = 3.4 - drop * 2.9
  })

  return (
    <group>
      {/* 01 Decoiler — two coils on a stand */}
      <group position={[LINE.stations[0], 0.6, 0]}>
        {[-1, 1].map((s) => (
          <mesh
            key={s}
            material={MAT.roller}
            position={[0, s * 2.1, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[1.9, 1.9, 2.6, 20]} />
          </mesh>
        ))}
        <mesh material={MAT.frame} position={[0, 0, -2]}>
          <boxGeometry args={[0.6, 8, 0.6]} />
        </mesh>
      </group>

      {/* 02 Roll-formers — paired rollers in a cage */}
      <group position={[LINE.stations[1], 0, 0]}>
        <mesh material={MAT.machine} position={[0, 1.6, 0]}>
          <boxGeometry args={[6, 3.4, 4.4]} />
        </mesh>
        {[-2, -0.6, 0.8, 2.2].map((x) => (
          <mesh
            key={x}
            geometry={GEO.roller}
            material={MAT.roller}
            position={[x, 0.35, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          />
        ))}
      </group>

      {/* 03 Foaming head — a gantry with the mixing head under it */}
      <group position={[LINE.stations[2], 0, 0]}>
        <mesh material={MAT.machineDark} position={[0, 3.2, 0]}>
          <boxGeometry args={[3.4, 1.2, 5]} />
        </mesh>
        <mesh material={MAT.accent} position={[0, 1.9, 0]}>
          <boxGeometry args={[1.2, 1.4, 1.2]} />
        </mesh>
        {[-2.4, 2.4].map((z) => (
          <mesh key={z} material={MAT.frame} position={[0, 1.4, z]}>
            <boxGeometry args={[0.5, 4.4, 0.5]} />
          </mesh>
        ))}
      </group>

      {/* 04 Double-belt press — the long box the panel cures inside */}
      <group position={[LINE.stations[3], 0, 0]}>
        <mesh material={MAT.machine} position={[0, 1.4, 0]}>
          <boxGeometry args={[11, 3.2, 5]} />
        </mesh>
        <mesh material={MAT.machineDark} position={[0, 3.2, 0]}>
          <boxGeometry args={[11.4, 0.7, 5.2]} />
        </mesh>
      </group>

      {/* 05 Cut-off saw — the only thing that moves */}
      <group position={[LINE.stations[4], 0, 0]}>
        {[-2.2, 2.2].map((z) => (
          <mesh key={z} material={MAT.frame} position={[0, 2, z]}>
            <boxGeometry args={[0.6, 6.4, 0.6]} />
          </mesh>
        ))}
        <mesh material={MAT.frame} position={[0, 5, 0]}>
          <boxGeometry args={[1.4, 0.6, 5]} />
        </mesh>
        <group ref={saw} position={[0, 3.4, 0]}>
          <mesh material={MAT.accent}>
            <boxGeometry args={[0.35, 1.6, 4.4]} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

/**
 * What travels down the line.
 *
 * A pool of slabs, each with its own position along x. Before the foaming head
 * a slab is a thin steel strip; after the press it is a full-thickness white
 * panel. One pool, two appearances — which is exactly the claim: the same
 * material, transformed in the middle of the line.
 */
function Strip({
  active,
  onStation,
  focus,
}: {
  active: boolean
  onStation: (i: number) => void
  focus: { current: number }
}) {
  const refs = useRef<(THREE.Group | null)[]>([])
  const lastStation = useRef(-1)

  const COUNT = 7
  const SPAN = (LINE.end - LINE.start) / COUNT

  useFrame((state) => {
    if (!active) return
    const travelled = (state.clock.elapsedTime * SPEED) % SPAN

    refs.current.forEach((g, i) => {
      if (!g) return
      const x = LINE.start + travelled + i * SPAN
      g.position.x = x

      // Thin steel before the foam head; full panel after the press.
      const formed = x > LINE.stations[2]
      const pressed = x > LINE.stations[3] + 5
      const thickness = pressed ? 1 : formed ? 0.55 : 0.18
      g.scale.y = thickness
      g.children.forEach((child) => {
        if (child instanceof THREE.Mesh) child.visible = child.name === (pressed ? 'panel' : 'strip')
      })
    })

    /*
      The caption follows ONE notional slab down the whole line, not whichever
      pooled slab happens to be furthest right.

      Reading it off the pool was the first attempt and it pinned the caption to
      "06 · Stack": the slabs wrap independently, so there is almost always one
      of them near the end, and the "lead" was never the same object twice. A
      single phase over the full length cycles 01 → 06 exactly once per pass,
      which is what the strip beside it is showing.
    */
    const full = LINE.end - LINE.start
    const phase = ((state.clock.elapsedTime * SPEED) % full) / full
    const idx = Math.min(LINE.stations.length - 1, Math.floor(phase * LINE.stations.length))
    // The camera aims a little ahead of the station, so the machine sits left of
    // centre and the strip has somewhere to arrive from.
    focus.current = LINE.stations[idx] + 3
    if (idx !== lastStation.current) {
      lastStation.current = idx
      onStation(idx)
    }
  })

  return (
    <>
      {Array.from({ length: COUNT }, (_, i) => (
        <group
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          position={[LINE.start, LINE.belt + 0.3, 0]}
        >
          <mesh name="strip" material={MAT.strip}>
            <boxGeometry args={[SPAN - 0.8, 1, 3.2]} />
          </mesh>
          <mesh name="panel" material={MAT.panel} visible={false}>
            <boxGeometry args={[SPAN - 0.8, 1, 3.4]} />
          </mesh>
        </group>
      ))}
    </>
  )
}

/** The finished stack at the end of the line, so the sequence has an outcome. */
function Stack() {
  const rows = 7
  return (
    <group position={[LINE.stations[5] + 4.5, LINE.belt - 1.2, 0]}>
      {Array.from({ length: rows }, (_, i) => (
        <group key={i} position={[0, i * 0.42, 0]}>
          <mesh material={MAT.panel}>
            <boxGeometry args={[9, 0.34, 3.4]} />
          </mesh>
          {/* The cut end, showing the core. It is the only place the panel's
              inside is visible, and it is what the panel section explains. */}
          <mesh material={MAT.core} position={[4.53, 0, 0]}>
            <boxGeometry args={[0.06, 0.26, 3.3]} />
          </mesh>
        </group>
      ))}
      {/* Pallet */}
      <mesh material={MAT.frame} position={[0, -0.35, 0]}>
        <boxGeometry args={[9.6, 0.4, 3.8]} />
      </mesh>
    </group>
  )
}
