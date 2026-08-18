import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { COLOR, PERSON_HEIGHT } from './layout'
import { createSignTexture } from './signTexture'
import { HORIZON, createSkyTexture } from './skyTexture'

/**
 * Balaji Prefab Import & Exports — the dispatch yard.
 *
 * The trade division has been the hardest section on the site to draw, because
 * what it sells is not a thing, it is a MOVEMENT: a finished panel leaving for
 * a port, a coil of pre-painted steel arriving from one. Two earlier attempts
 * drew the destinations — a fan of lanes, then a world map, then a dial of
 * bearings and distances. All three drew where the goods GO. None of them drew
 * the going.
 *
 * So this draws the going. A loading apron outside the works: the shutter
 * lifts, a flatbed comes out stacked with panels and runs for the port past
 * the container yard. Switch to imports and the traffic reverses — a truck
 * comes in off the quay carrying a steel coil and takes it inside. Same yard,
 * same road, opposite direction, which is exactly the difference between the
 * two halves of the business.
 *
 * ── The one number that matters ───────────────────────────────────────────
 * `DIR`: +1 for export, −1 for import. It flips the truck's travel, its cargo
 * and which way the cab faces. Everything directional reads it rather than
 * being modelled twice, so the two modes cannot drift apart.
 *
 * ── Conventions carried over from the hero ────────────────────────────────
 * · Materials are module-scope singletons and are NEVER written to. An earlier
 *   scene animated `.opacity` on a shared material and faded three unrelated
 *   meshes with it; animate transforms instead.
 * · The scene group is YAWED. Straight on, a road running left to right is an
 *   elevation drawing — flat, and it wastes the frame's height. Turning it
 *   converts length into depth, which is what makes the yard look like a place
 *   you could stand in.
 * · A person is 1.75 m and everything else is sized against them, which is the
 *   only reason a 5 m shutter reads as big.
 */

type Mode = 'out' | 'in'
type Props = { mode: Mode; active: boolean }

/* ── The yard, in metres ──────────────────────────────────────────────────
   The works sit on the left, the port on the right, and the road runs between
   them. Every position below is a point on that line. */
const SHED = { x0: -38, x1: -16, halfDepth: 9, eave: 9, rise: 2.6 }
/** Where the shutter is, and so where a load is picked up or set down. */
const DOOR_X = SHED.x1
const DOOR_W = 5.5
const DOOR_H = 5.5
/**
 * Where the truck waits at the far end of its run.
 *
 * Just past the frame edge, not far past it: the stage feathers its own edges,
 * so a truck that stops here fades out rather than popping, and it does not
 * spend the hold sitting invisible in the middle of nowhere.
 */
const ROAD_END = 42
/** Seconds for one round of the loop. */
const CYCLE = 12
/**
 * Fraction of the cycle spent parked at each end.
 *
 * Kept short. The export run STARTS inside the shed — that is the point, the
 * truck comes out of the door — but inside the shed it is also hidden by it,
 * and a long hold there is a third of the loop spent looking at an empty yard.
 */
const HOLD = 0.07

const YAW = 0.24
const PITCH = 0.24
/** Half-width the camera has to contain, after the yaw. */
const HALF_WIDTH = 40

const MAT = {
  /*
    The yard tints are lifted well above the page ground. At the token values
    the apron, the road and the kerbs were within a few points of each other
    and of the background, and the whole lower half of the frame read as one
    dark smear with a shed sitting on nothing.
  */
  apron: new THREE.MeshStandardMaterial({ color: '#072a54', roughness: 1 }),
  drive: new THREE.MeshStandardMaterial({ color: '#0e3765', roughness: 1 }),
  kerb: new THREE.MeshStandardMaterial({ color: '#1d4a7d', roughness: 1 }),
  panel: new THREE.MeshStandardMaterial({ color: COLOR.panel, roughness: 0.62 }),
  panelEdge: new THREE.MeshStandardMaterial({ color: COLOR.panelEdge, roughness: 0.7 }),
  roof: new THREE.MeshStandardMaterial({ color: COLOR.roof, roughness: 0.6 }),
  steel: new THREE.MeshStandardMaterial({ color: COLOR.steel, metalness: 0.55, roughness: 0.45 }),
  steelDark: new THREE.MeshStandardMaterial({
    color: COLOR.steelDark,
    metalness: 0.5,
    roughness: 0.55,
  }),
  dark: new THREE.MeshStandardMaterial({ color: '#06264c', roughness: 0.9 }),
  tyre: new THREE.MeshStandardMaterial({ color: '#0a1c33', roughness: 0.95 }),
  glass: new THREE.MeshStandardMaterial({
    color: '#123f6c',
    metalness: 0.6,
    roughness: 0.15,
  }),
  /** Bare coil stock — warmer than the finished panel, which is the point. */
  coil: new THREE.MeshStandardMaterial({ color: '#cfdcf0', metalness: 0.82, roughness: 0.24 }),
  coilCore: new THREE.MeshStandardMaterial({ color: '#5b7db3', roughness: 0.8 }),
  container: new THREE.MeshStandardMaterial({ color: '#2d5488', roughness: 0.75 }),
  containerAlt: new THREE.MeshStandardMaterial({ color: '#1d4070', roughness: 0.75 }),
  accent: new THREE.MeshStandardMaterial({ color: COLOR.accent, roughness: 0.6 }),
  skin: new THREE.MeshStandardMaterial({ color: COLOR.skin, roughness: 0.85 }),
  clothes: new THREE.MeshStandardMaterial({ color: COLOR.clothes, roughness: 0.9 }),
  hiVis: new THREE.MeshStandardMaterial({ color: COLOR.hiVis, roughness: 0.8 }),
} as const

const GEO = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 20),
  head: new THREE.SphereGeometry(0.12, 12, 10),
} as const

export default function TradeYardScene({ mode, active }: Props) {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 20, 80], fov: 36 }}
      frameloop={active ? 'always' : 'demand'}
    >
      <fog attach="fog" args={[HORIZON, 60, 260]} />
      <Sky />

      <hemisphereLight args={['#dce8ff', '#123c72', 2] as const} />
      <directionalLight position={[26, 34, 22]} intensity={2.6} color="#fff4e0" />
      <directionalLight position={[-28, 16, -18]} intensity={1} color="#8fb0e4" />
      <directionalLight position={[12, 5, 30]} intensity={0.7} color="#c9dcff" />

      <Rig />

      <group rotation-y={YAW}>
        <Apron />
        <Works />
        <Port />
        <Crew />
        <Traffic mode={mode} active={active} />
      </group>
    </Canvas>
  )
}

/** The same dusk dome the hero stands under, so the two scenes share a world. */
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
    <mesh material={material}>
      <sphereGeometry args={[380, 24, 16]} />
    </mesh>
  )
}

/**
 * A fixed frame on the whole yard.
 *
 * The distance comes from the yard's own half-width and the camera's HORIZONTAL
 * half-angle, so a narrow stage pulls back instead of cropping the shed off one
 * end and the ship off the other. The camera then rises to PITCH, which is what
 * turns a road into a yard you are looking across rather than a line.
 */
function Rig() {
  const { camera } = useThree()

  useFrame((state) => {
    const cam = camera as THREE.PerspectiveCamera
    const halfFovY = (cam.fov * Math.PI) / 360
    const halfFovX = Math.atan(Math.tan(halfFovY) * cam.aspect)
    const distance = HALF_WIDTH / Math.sin(halfFovX)

    // A drift small enough that nobody consciously sees it and large enough
    // that the frame is never quite still.
    const t = state.clock.elapsedTime
    camera.position.set(
      Math.sin(t * 0.07) * 2.2,
      distance * Math.tan(PITCH) + Math.sin(t * 0.11) * 0.4,
      distance,
    )
    camera.lookAt(0, 3.2, 0)
  })

  return null
}

/** Ground, road and kerbs. Flat tints of the page ground so the yard recedes. */
function Apron() {
  return (
    <group>
      <mesh
        geometry={GEO.box}
        material={MAT.apron}
        position={[0, -0.3, -10]}
        scale={[400, 0.6, 240]}
      />
      {/* The road the whole animation happens on. */}
      <mesh geometry={GEO.box} material={MAT.drive} position={[8, 0.02, 0]} scale={[150, 0.1, 12]} />
      {[-6.4, 6.4].map((z) => (
        <mesh
          key={z}
          geometry={GEO.box}
          material={MAT.kerb}
          position={[8, 0.18, z]}
          scale={[150, 0.36, 0.5]}
        />
      ))}
      {/* Lane dashes. Nothing reads as a road faster, and they give the truck's
          speed something to be measured against. */}
      {Array.from({ length: 22 }, (_, i) => (
        <mesh
          key={i}
          geometry={GEO.box}
          material={MAT.kerb}
          position={[-48 + i * 7, 0.09, 0]}
          scale={[3.4, 0.06, 0.3]}
        />
      ))}
    </group>
  )
}

/**
 * The works: a clad PEB shed with the shutter the traffic comes out of.
 *
 * It began as a white box with a slab on top, which is what a building looks
 * like before anyone has decided it is a building. What makes it read as one
 * is not detail for its own sake — it is the four things a real shed has and a
 * box does not: a PITCHED roof with gables, a base PLINTH, the vertical JOINTS
 * where 1 m cladding modules meet, and its owner's NAME on the wall.
 */
function Works() {
  const width = SHED.x1 - SHED.x0
  const midX = (SHED.x0 + SHED.x1) / 2
  const d = SHED.halfDepth
  const slope = Math.hypot(d, SHED.rise)
  const pitch = Math.atan2(SHED.rise, d)

  /* The gable infill above the eave. A flat triangle is enough: it is only
     ever seen end-on, and giving it thickness would cost a lathe for a shape
     nobody can see the side of. */
  const gable = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-d, 0)
    shape.lineTo(d, 0)
    shape.lineTo(0, SHED.rise)
    shape.closePath()
    return new THREE.ShapeGeometry(shape)
  }, [d])
  useEffect(() => () => gable.dispose(), [gable])

  return (
    <group>
      {/* Walls, to the eave. */}
      <mesh
        geometry={GEO.box}
        material={MAT.panel}
        position={[midX, SHED.eave / 2, 0]}
        scale={[width, SHED.eave, d * 2]}
      />
      {/* Plinth. Real sheds do not meet the ground in bare cladding — there is
          a concrete upstand, and without it the walls look like paper. */}
      <mesh
        geometry={GEO.box}
        material={MAT.steelDark}
        position={[midX, 0.55, 0]}
        scale={[width + 0.3, 1.1, d * 2 + 0.3]}
      />

      {/* Gable infills, then the two roof slopes.

          Rotation sign matters: about x, a point at +z is pushed DOWN by a
          positive angle, so the +z slope takes +pitch and the −z slope −pitch.
          Get it the wrong way round and the roof becomes a valley. */}
      {[SHED.x0, SHED.x1].map((x) => (
        <mesh
          key={x}
          geometry={gable}
          material={MAT.panel}
          position={[x, SHED.eave, 0]}
          rotation={[0, Math.PI / 2, 0]}
        />
      ))}
      {[1, -1].map((dir) => (
        <mesh
          key={dir}
          geometry={GEO.box}
          material={MAT.roof}
          position={[midX, SHED.eave + SHED.rise / 2, (dir * d) / 2]}
          rotation={[dir * pitch, 0, 0]}
          scale={[width + 1.2, 0.26, slope + 0.5]}
        />
      ))}
      {/* Ridge cap. */}
      <mesh
        geometry={GEO.box}
        material={MAT.steel}
        position={[midX, SHED.eave + SHED.rise + 0.1, 0]}
        scale={[width + 1.3, 0.22, 0.7]}
      />
      {/* Eave gutters. */}
      {[1, -1].map((dir) => (
        <mesh
          key={dir}
          geometry={GEO.box}
          material={MAT.steel}
          position={[midX, SHED.eave - 0.1, dir * (d + 0.35)]}
          scale={[width + 1.2, 0.34, 0.4]}
        />
      ))}

      {/* Cladding joints on the long wall the camera actually sees, and on the
          gable the truck comes out of. 1 m modules, as they are really made. */}
      {Array.from({ length: Math.round(width) - 1 }, (_, i) => (
        <mesh
          key={`w${i}`}
          geometry={GEO.box}
          material={MAT.panelEdge}
          position={[SHED.x0 + 1 + i, SHED.eave / 2 + 0.5, d + 0.02]}
          scale={[0.07, SHED.eave - 1.1, 0.07]}
        />
      ))}
      {Array.from({ length: Math.round(d * 2) - 1 }, (_, i) => (
        <mesh
          key={`g${i}`}
          geometry={GEO.box}
          material={MAT.panelEdge}
          position={[SHED.x1 + 0.02, SHED.eave / 2 + 0.5, -d + 1 + i]}
          scale={[0.07, SHED.eave - 1.1, 0.07]}
        />
      ))}

      {/* The opening: a dark recess so the truck has somewhere to come from,
          a steel frame around it, and a canopy over it. */}
      <mesh
        geometry={GEO.box}
        material={MAT.dark}
        position={[SHED.x1 - 0.7, DOOR_H / 2, 0]}
        scale={[1.6, DOOR_H, DOOR_W]}
      />
      {[-1, 1].map((dir) => (
        <mesh
          key={dir}
          geometry={GEO.box}
          material={MAT.steelDark}
          position={[SHED.x1 + 0.06, DOOR_H / 2, (dir * (DOOR_W + 0.36)) / 2]}
          scale={[0.16, DOOR_H + 0.36, 0.36]}
        />
      ))}
      <mesh
        geometry={GEO.box}
        material={MAT.steelDark}
        position={[SHED.x1 + 0.06, DOOR_H + 0.18, 0]}
        scale={[0.16, 0.36, DOOR_W + 0.72]}
      />
      <mesh
        geometry={GEO.box}
        material={MAT.roof}
        position={[SHED.x1 + 0.9, DOOR_H + 0.7, 0]}
        scale={[1.9, 0.16, DOOR_W + 1.8]}
      />
      <Shutter />

      {/* Personnel door, and the reason the shed reads as occupied. */}
      <mesh
        geometry={GEO.box}
        material={MAT.dark}
        position={[SHED.x1 + 0.03, 1.05, -6.2]}
        scale={[0.1, 2.1, 1]}
      />

      <Signage x={midX} z={d + 0.14} />
    </group>
  )
}

/**
 * The division's name on the long wall.
 *
 * The user asked for the brand on the plant, and they were right: an unmarked
 * white shed is a stock asset, and the moment it carries the name it becomes
 * THIS company's yard. Drawn on a canvas in the page's own Manrope over the
 * real mark — see `signTexture.ts` for why a canvas and not geometry.
 *
 * The copy is fixed here rather than read from `content/site.json`. If it ever
 * moves into the CMS, key the `useMemo` on the strings or the sign will keep
 * rendering the old wording after an edit.
 */
function Signage({ x, z }: { x: number; z: number }) {
  const gl = useThree((state) => state.gl)

  const sign = useMemo(
    () =>
      createSignTexture({
        title: 'BALAJI PREFAB',
        subtitle: 'IMPORT & EXPORTS',
        anisotropy: gl.capabilities.getMaxAnisotropy(),
      }),
    [gl],
  )
  useEffect(() => sign.dispose, [sign])

  /*
    Emissive as well as diffuse, so the fascia reads as lit at dusk without
    adding a light to the scene. Kept LOW on purpose: the emissive map is the
    same canvas as the diffuse map, so intensity adds the artwork on top of
    itself and the type blooms into itself well before it looks bright.
  */
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: sign.texture,
        emissive: new THREE.Color('#ffffff'),
        emissiveMap: sign.texture,
        emissiveIntensity: 0.14,
        roughness: 0.55,
        metalness: 0.1,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      }),
    [sign],
  )
  useEffect(() => () => material.dispose(), [material])

  const width = 11
  const height = width / 4

  return (
    <group position={[x, SHED.eave * 0.68, z]}>
      {/*
        The tray sits a clear 60 mm BEHIND the face, not flush with it.

        Flush is what caused the flicker across the sign: the tray's front and
        the artwork plane were the same plane to the last bit, so the depth
        buffer had no way to choose between them and picked differently per
        pixel and per frame. Any gap fixes it; `polygonOffset` on the face is
        belt and braces for the shallow angles this wall is seen at.
      */}
      <mesh
        geometry={GEO.box}
        material={MAT.steelDark}
        position={[0, 0, -0.13]}
        scale={[width + 0.34, height + 0.34, 0.14]}
      />
      <mesh material={material}>
        <planeGeometry args={[width, height]} />
      </mesh>
    </group>
  )
}

/**
 * The roller shutter.
 *
 * It rides up and down on scale and position rather than on opacity, because
 * the material is shared with the rest of the cladding — fading it would fade
 * the whole shed. `Traffic` publishes how open it should be through a module
 * ref rather than React state: this changes every frame, and a setState at
 * sixty hertz would re-render the Canvas.
 */
const openness = { current: 0 }

function Shutter() {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(() => {
    const m = ref.current
    if (!m) return
    const shut = 1 - openness.current
    m.scale.set(0.16, DOOR_H * shut, DOOR_W)
    m.position.set(DOOR_X + 0.1, DOOR_H - (DOOR_H * shut) / 2, 0)
  })

  return <mesh ref={ref} geometry={GEO.box} material={MAT.steel} />
}

/** The port end: stacked boxes and a hull in the fog. */
function Port() {
  const stacks = useMemo(
    () => [
      { x: 20, z: -15, n: 3 },
      { x: 31, z: -17, n: 2 },
      { x: 25, z: -22, n: 3 },
      { x: 14, z: -23, n: 2 },
    ],
    [],
  )

  return (
    <group>
      {stacks.map((s, si) =>
        Array.from({ length: s.n }, (_, i) => (
          <mesh
            key={`${si}-${i}`}
            geometry={GEO.box}
            material={i % 2 ? MAT.containerAlt : MAT.container}
            position={[s.x, 1.3 + i * 2.6, s.z]}
            scale={[12, 2.55, 2.4]}
          />
        )),
      )}
      {/* One gold box in the yard. The accent's entire budget in this scene,
          spent on the thing the section is about: a Mutnani load, shipped. */}
      <mesh
        geometry={GEO.box}
        material={MAT.accent}
        position={[20, 8.5, -15]}
        scale={[12, 2.55, 2.4]}
      />

      {/* The ship. A hull, a house and a stack — read at this distance as a
          silhouette, which is all the fog would leave of it anyway. */}
      <group position={[34, 0, -40]}>
        <mesh geometry={GEO.box} material={MAT.steelDark} position={[0, 3, 0]} scale={[86, 6, 14]} />
        <mesh geometry={GEO.box} material={MAT.dark} position={[30, 9, 0]} scale={[12, 6, 11]} />
        <mesh geometry={GEO.cyl} material={MAT.dark} position={[34, 15, 0]} scale={[1.6, 5, 1.6]} />
        {Array.from({ length: 5 }, (_, i) => (
          <mesh
            key={i}
            geometry={GEO.box}
            material={i % 2 ? MAT.container : MAT.containerAlt}
            position={[-28 + i * 12, 8.5, 0]}
            scale={[11, 5, 11]}
          />
        ))}
      </group>
    </group>
  )
}

/** Two people by the shutter. Nothing in the yard has a size without them. */
function Crew() {
  return (
    <group>
      <Person position={[DOOR_X + 3.4, 0, 5.2]} vest />
      <Person position={[DOOR_X + 6.2, 0, 6.4]} vest={false} />
    </group>
  )
}

function Person({ position, vest }: { position: [number, number, number]; vest: boolean }) {
  const h = PERSON_HEIGHT
  return (
    <group position={position}>
      <mesh geometry={GEO.box} material={MAT.clothes} position={[0.1, h * 0.22, 0]} scale={[0.16, h * 0.44, 0.16]} />
      <mesh geometry={GEO.box} material={MAT.clothes} position={[-0.1, h * 0.22, 0]} scale={[0.16, h * 0.44, 0.16]} />
      <mesh geometry={GEO.box} material={MAT.clothes} position={[0, h * 0.62, 0]} scale={[0.42, h * 0.4, 0.24]} />
      {vest && (
        <mesh geometry={GEO.box} material={MAT.hiVis} position={[0, h * 0.63, 0]} scale={[0.45, h * 0.26, 0.27]} />
      )}
      <mesh geometry={GEO.head} material={MAT.skin} position={[0, h * 0.94, 0]} />
    </group>
  )
}

/**
 * The traffic itself — one truck, running the loop.
 *
 * Export: it leaves the shutter loaded with panels and runs right for the port.
 * Import: it comes in off the quay with a coil and takes it inside. The whole
 * difference is `DIR`, plus which cargo is mounted.
 *
 * The shutter is driven from here because the door has to be open exactly when
 * the truck is in it, and that is a fact about the truck's position, not about
 * the door.
 */
function Traffic({ mode, active }: { mode: Mode; active: boolean }) {
  const ref = useRef<THREE.Group>(null)
  const phase = useRef(0)
  const DIR = mode === 'out' ? 1 : -1

  useFrame((_, delta) => {
    const g = ref.current
    if (!g) return

    if (active) phase.current = (phase.current + delta / CYCLE) % 1

    const travel = Math.min(1, Math.max(0, (phase.current - HOLD) / (1 - HOLD * 2)))
    const eased = travel * travel * (3 - 2 * travel)

    // Export runs door → port; import runs port → door. One expression, read
    // backwards when DIR is −1.
    const from = DIR > 0 ? DOOR_X - 7 : ROAD_END
    const to = DIR > 0 ? ROAD_END : DOOR_X - 7
    const x = from + (to - from) * eased

    g.position.set(x, 0, 0)
    // The cab leads. Export faces +x, import faces −x.
    g.rotation.y = DIR > 0 ? 0 : Math.PI

    // The shutter is open while the truck is close enough to be using it, and
    // shut once it has gone. Smoothed so it rolls rather than snaps.
    const near = 1 - Math.min(1, Math.abs(x - DOOR_X) / 13)
    openness.current += (near - openness.current) * Math.min(1, delta * 3)
  })

  return (
    <group ref={ref}>
      <Truck cargo={mode} />
    </group>
  )
}

/** Flatbed, drawn nose-first along +x. Cargo swaps with the mode. */
function Truck({ cargo }: { cargo: Mode }) {
  return (
    <group>
      {/* Chassis. */}
      <mesh geometry={GEO.box} material={MAT.steelDark} position={[0, 1.15, 0]} scale={[13, 0.5, 2.9]} />
      {/* Bed. */}
      <mesh geometry={GEO.box} material={MAT.steel} position={[-1.6, 1.5, 0]} scale={[9, 0.24, 3]} />
      {/* Cab. */}
      <mesh geometry={GEO.box} material={MAT.panel} position={[5, 2.5, 0]} scale={[3.4, 2.5, 2.9]} />
      <mesh geometry={GEO.box} material={MAT.glass} position={[6.62, 3.05, 0]} scale={[0.2, 1.2, 2.5]} />
      <mesh geometry={GEO.box} material={MAT.accent} position={[6.7, 1.5, 0]} scale={[0.3, 0.5, 2.6]} />

      {/* Wheels. Rotated so the cylinder's axis lies across the road. */}
      {[
        [5.2, -1.1],
        [-1.5, -1.1],
        [-4.2, -1.1],
        [5.2, 1.1],
        [-1.5, 1.1],
        [-4.2, 1.1],
      ].map(([x, z], i) => (
        <mesh
          key={i}
          geometry={GEO.cyl}
          material={MAT.tyre}
          position={[x, 0.85, z * 1.35]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[0.85, 0.5, 0.85]}
        />
      ))}

      {cargo === 'out' ? <PanelLoad /> : <CoilLoad />}
    </group>
  )
}

/** Going out: a banded stack of finished panels. */
function PanelLoad() {
  return (
    <group position={[-1.6, 0, 0]}>
      {Array.from({ length: 4 }, (_, i) => (
        <mesh
          key={i}
          geometry={GEO.box}
          material={i % 2 ? MAT.panelEdge : MAT.panel}
          position={[0, 1.9 + i * 0.42, 0]}
          scale={[8.6, 0.38, 2.8]}
        />
      ))}
      {/* Load straps. */}
      {[-2.6, 0, 2.6].map((x) => (
        <mesh
          key={x}
          geometry={GEO.box}
          material={MAT.accent}
          position={[x, 2.6, 0]}
          scale={[0.14, 1.9, 2.95]}
        />
      ))}
    </group>
  )
}

/** Coming in: a coil of pre-painted steel, on its side across the bed. */
function CoilLoad() {
  return (
    <group position={[-1.6, 0, 0]}>
      <mesh
        geometry={GEO.cyl}
        material={MAT.coil}
        position={[0, 3.1, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[1.5, 2.6, 1.5]}
      />
      <mesh
        geometry={GEO.cyl}
        material={MAT.coilCore}
        position={[0, 3.1, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[0.5, 2.7, 0.5]}
      />
      {/* Chocks, so it is not floating on the bed. */}
      {[-1.7, 1.7].map((x) => (
        <mesh
          key={x}
          geometry={GEO.box}
          material={MAT.steelDark}
          position={[x, 1.9, 0]}
          scale={[0.4, 0.6, 2.8]}
        />
      ))}
    </group>
  )
}
