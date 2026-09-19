import { useEffect, useMemo, useRef } from 'react'
import type { Ref, RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import DOTS from '../data/globe-dots.json'
import { COLOR } from './layout'

/**
 * Mutnani IMEX: goods arriving in India from China, Vietnam and the UAE.
 *
 * A lit, dotted globe turned to India and the countries it buys from. The
 * source countries are picked out in the logo green, India in the logo blue —
 * green is where goods come from, blue is where they land — and the lead trade
 * lines run from one to the other, green at the source, blue by the time they
 * reach the Mumbai desk, before a short green hop inland to the Hyderabad
 * works. Fainter lines from the rest of the world say the network does not
 * stop at three countries.
 *
 * No line starts at a real city: the client does not want the sourcing list
 * readable off the site. The country is the claim; the suppliers are not.
 *
 * It is meant to feel like a globe, not a diagram: one sun lights it, so the
 * sea and the dots both fall off toward the night side; it has an atmosphere
 * and a graticule; and it can be dragged round, with momentum, before it
 * drifts back home.
 *
 * Exports reverse the flow outward in green over dimmed tracks — the desk is
 * not open yet and the picture should not claim otherwise.
 */

type Mode = 'out' | 'in'
type LabelKey = 'mumbai' | 'hyderabad' | 'india' | 'china' | 'vietnam' | 'uae'
type Props = {
  mode: Mode
  active: boolean
  still: boolean
  /** DOM labels, positioned from here every frame. */
  labels: Record<LabelKey, RefObject<HTMLDivElement | null>>
}

/* ── Places ──────────────────────────────────────────────────────────────── */

const PLACES: Record<LabelKey, readonly [number, number]> = {
  mumbai: [19.07, 72.88],
  hyderabad: [17.38, 78.48],
  india: [30.5, 77.5],
  china: [44.5, 101],
  // Off the coast, in the South China Sea: Vietnam is too narrow to hold a
  // pill, and inland it would sit on the Hyderabad label.
  vietnam: [14, 113.5],
  uae: [25.5, 54],
}

/** The lead lines: two from inside China, one each from Vietnam and the UAE —
    all deliberately off any city. */
const FROM_SOURCES: readonly (readonly [number, number])[] = [
  [30.5, 111],
  [37.5, 104],
  [15.2, 107.9],
  [23.6, 54.8],
]

/** The rest of the network, drawn quieter: Europe, East Africa, Australia.
    Regions, never ports. */
const FROM_WORLD: readonly (readonly [number, number])[] = [
  [49, 9],
  [-4, 33],
  [-24, 134],
]

/** The point that faces the camera: east of India, so China and Vietnam sit
    square on the near side and the UAE is still well clear of the limb. */
const FACE = { lat: 22, lon: 86 }

/** The sun, fixed in the world — the globe turns under it. Upper left, in front. */
const SUN = new THREE.Vector3(-0.55, 0.5, 0.67).normalize()

const GREEN = '#2f7a0a' // mirrors --color-secondary
const LIME = '#5aa312' // a lifted secondary, for the source countries' dots

/* ── Timing ──────────────────────────────────────────────────────────────── */

/** Every lead line lands once per LEAD seconds. */
const LEAD = 7.2
/** The quieter lines run slower, off the lead beat. */
const WORLD = 9.5
/** How long the lit tail is, as a fraction of the line. */
const TAIL = 0.34
/** The head runs past the end by one tail, so the tail drains into Mumbai. */
const RUN = 1 + TAIL
/** Fraction of a line's own cycle at which its head lands. */
const LAND = 1 / RUN

const D2R = Math.PI / 180

/** Latitude/longitude to a point on the sphere, three.js axes. */
function toVec(lat: number, lon: number, r = 1) {
  const la = lat * D2R
  const lo = lon * D2R
  return new THREE.Vector3(
    r * Math.cos(la) * Math.cos(lo),
    r * Math.sin(la),
    -r * Math.cos(la) * Math.sin(lo),
  )
}

/** A great-circle arc from a to b, lifted off the surface in proportion to its length. */
function arcCurve(a: THREE.Vector3, b: THREE.Vector3, lift?: number) {
  const h = lift ?? 0.06 + 0.55 * (a.angleTo(b) / Math.PI)
  const qb = new THREE.Quaternion().setFromUnitVectors(a.clone().normalize(), b.clone().normalize())
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= 48; i++) {
    const s = i / 48
    const q = new THREE.Quaternion().slerp(qb, s)
    pts.push(
      a
        .clone()
        .normalize()
        .applyQuaternion(q)
        .multiplyScalar(1.004 + h * Math.sin(Math.PI * s)),
    )
  }
  return new THREE.CatmullRomCurve3(pts)
}

const frac = (x: number) => x - Math.floor(x)

/* ── Materials ───────────────────────────────────────────────────────────── */

/** Shared GLSL: how much sun a world-space normal gets, soft at the terminator. */
const LIGHT = /* glsl */ `
  uniform vec3 uSun;
  float sunlight(vec3 n) { return smoothstep(-0.35, 0.85, dot(n, uSun)); }
`

/** The sea: lit pale, falling to a cool blue on the night side, with a glint. */
const globeMaterial = () =>
  new THREE.ShaderMaterial({
    uniforms: {
      uSun: { value: SUN },
      uLit: { value: new THREE.Color('#f5f9fe') },
      uDark: { value: new THREE.Color('#a9c0db') },
      uRim: { value: new THREE.Color('#7fa6d6') },
    },
    vertexShader: /* glsl */ `
      varying vec3 vN;
      varying vec3 vW;
      void main() {
        vN = normalize(mat3(modelMatrix) * normal);
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }
    `,
    fragmentShader: /* glsl */ `
      ${LIGHT}
      uniform vec3 uLit;
      uniform vec3 uDark;
      uniform vec3 uRim;
      varying vec3 vN;
      varying vec3 vW;
      void main() {
        vec3 n = normalize(vN);
        vec3 v = normalize(cameraPosition - vW);
        vec3 col = mix(uDark, uLit, sunlight(n));
        float rim = pow(1.0 - max(dot(n, v), 0.0), 3.0);
        col = mix(col, uRim, rim * 0.55);
        float spec = pow(max(dot(reflect(-uSun, n), v), 0.0), 40.0);
        col += spec * 0.22;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  })

/**
 * The atmosphere: a shell a little larger than the globe, drawn from the
 * front. On the shell, the normal against the line of sight says how far a
 * pixel is from the centre of the disc — so it can glow brightest just outside the globe's
 * edge, fade to nothing at its own edge, and lay a thin haze over the globe's
 * rim. `uEdge` is where the globe's silhouette falls on the shell.
 */
const ATMOSPHERE_R = 1.16
const atmosphereMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uColor: { value: new THREE.Color('#5b97dd') },
      uEdge: { value: Math.sqrt(1 - 1 / (ATMOSPHERE_R * ATMOSPHERE_R)) },
    },
    vertexShader: /* glsl */ `
      varying float vZ;
      void main() {
        // Against the line of sight, not the camera axis: then vZ is exactly
        // 0 at the shell's silhouette and uEdge at the globe's, in perspective.
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vZ = dot(normalize(normalMatrix * normal), normalize(-mv.xyz));
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uEdge;
      varying float vZ;
      void main() {
        float outside = pow(clamp(vZ / uEdge, 0.0, 1.0), 1.8);
        float haze = smoothstep(uEdge + 0.3, uEdge, vZ) * 0.55;
        float a = vZ < uEdge ? outside : haze;
        gl_FragColor = vec4(uColor, a * 0.38);
      }
    `,
  })

/**
 * The land dots. `aKind` is 0 for the world, 1 for India, 2 for a source
 * country; those are drawn larger and stronger, and breathe very slightly so
 * they read as the subject even at a glance.
 */
const dotMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uSun: { value: SUN },
      uLand: { value: new THREE.Color('#8ea4bf') },
      uIndia: { value: new THREE.Color(COLOR.accent) },
      uSource: { value: new THREE.Color(LIME) },
      /** Dot diameter in world units — a little over half the dot spacing. */
      uSize: { value: 0.0142 },
      /** World units to device pixels at unit depth; set from the canvas each frame. */
      uScale: { value: 1000 },
      uTime: { value: 0 },
    },
    vertexShader: /* glsl */ `
      ${LIGHT}
      attribute float aKind;
      uniform float uSize;
      uniform float uScale;
      uniform float uTime;
      varying float vKind;
      varying float vFacing;
      varying float vLight;
      void main() {
        vKind = aKind;
        vec3 wn = normalize(mat3(modelMatrix) * position);
        vLight = sunlight(wn);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vFacing = dot(normalize(normalMatrix * position), normalize(-mv.xyz));
        float hot = step(0.5, aKind);
        float breathe = 1.0 + hot * 0.08 * sin(uTime * 1.6 + aKind * 1.7);
        gl_PointSize = uSize * uScale * mix(1.0, 1.32, hot) * breathe / -mv.z;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uLand;
      uniform vec3 uIndia;
      uniform vec3 uSource;
      varying float vKind;
      varying float vFacing;
      varying float vLight;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float edge = smoothstep(0.5, 0.34, d);
        float face = smoothstep(0.08, 0.55, vFacing);
        vec3 col = vKind > 1.5 ? uSource : vKind > 0.5 ? uIndia : uLand;
        // The night side darkens the world but only dims the highlighted countries.
        float hot = step(0.5, vKind);
        col *= mix(mix(0.62, 1.08, vLight), mix(0.8, 1.05, vLight), hot);
        gl_FragColor = vec4(col, edge * face * mix(0.8, 1.0, hot));
      }
    `,
  })

/** Latitude and longitude every 20°, barely there — the thing that says "globe". */
function graticule() {
  const pts: number[] = []
  const push = (a: THREE.Vector3, b: THREE.Vector3) => pts.push(a.x, a.y, a.z, b.x, b.y, b.z)
  for (let lat = -60; lat <= 60; lat += 20)
    for (let lon = -180; lon < 180; lon += 4) push(toVec(lat, lon, 1.001), toVec(lat, lon + 4, 1.001))
  for (let lon = -180; lon < 180; lon += 20)
    for (let lat = -80; lat < 80; lat += 4) push(toVec(lat, lon, 1.001), toVec(lat + 4, lon, 1.001))
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
  return geo
}

/**
 * A trade line. The whole track is drawn faint; a lit segment of length
 * `uTail` runs along it with its head at `uHead` (0 at the source, 1 at the
 * destination). Colour runs from `uFrom` to `uTo` along the line.
 */
const arcMaterial = (from: string, to: string, base: number) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uFrom: { value: new THREE.Color(from) },
      uTo: { value: new THREE.Color(to) },
      uHead: { value: 0 },
      uTail: { value: TAIL },
      uBase: { value: base },
      uReverse: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying float vT;
      void main() {
        vT = uv.x;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uFrom;
      uniform vec3 uTo;
      uniform float uHead;
      uniform float uTail;
      uniform float uBase;
      uniform float uReverse;
      varying float vT;
      void main() {
        float t = mix(vT, 1.0 - vT, uReverse);
        float lit = smoothstep(uHead - uTail, uHead, t) * step(t, uHead);
        float ends = smoothstep(0.0, 0.04, vT) * smoothstep(1.0, 0.96, vT);
        vec3 col = mix(uFrom, uTo, smoothstep(0.1, 0.9, vT));
        gl_FragColor = vec4(col, (uBase + lit * (1.0 - uBase)) * ends);
      }
    `,
  })

/* ── Scene ───────────────────────────────────────────────────────────────── */

export default function ImportGlobe(props: Props) {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 4.7], fov: 30 }}
      frameloop={props.active && !props.still ? 'always' : 'demand'}
    >
      <Globe {...props} />
    </Canvas>
  )
}

type Line = {
  curve: THREE.CatmullRomCurve3
  geo: THREE.TubeGeometry
  mat: THREE.ShaderMaterial
  from: THREE.Vector3
  lead: boolean
}

function Globe({ mode, still, labels }: Props) {
  const tilt = useRef<THREE.Group>(null)
  const spin = useRef<THREE.Group>(null)
  const out = mode === 'out'

  const invalidate = useThree((s) => s.invalidate)
  const gl = useThree((s) => s.gl)
  // A still globe only renders on demand, so a mode switch has to ask for a frame.
  useEffect(() => invalidate(), [mode, invalidate])

  /*
    Drag to turn it. Horizontal drags spin, vertical ones tilt a little; let
    go and it coasts, then drifts home after a moment. `pan-y` keeps a
    vertical swipe on a phone scrolling the page, not grabbing the globe.
  */
  const drag = useRef({ yaw: 0, pitch: 0, vYaw: 0, vPitch: 0, down: false, x: 0, y: 0, idle: 0 })
  useEffect(() => {
    const el = gl.domElement
    const d = drag.current
    el.style.touchAction = 'pan-y'
    el.style.cursor = 'grab'
    const onDown = (e: PointerEvent) => {
      d.down = true
      d.x = e.clientX
      d.y = e.clientY
      d.vYaw = d.vPitch = 0
      el.setPointerCapture(e.pointerId)
      el.style.cursor = 'grabbing'
    }
    const onMove = (e: PointerEvent) => {
      if (!d.down) return
      const dx = (e.clientX - d.x) * 0.006
      const dy = (e.clientY - d.y) * 0.004
      d.x = e.clientX
      d.y = e.clientY
      d.yaw += dx
      d.pitch = THREE.MathUtils.clamp(d.pitch + dy, -0.5, 0.5)
      d.vYaw = dx
      d.vPitch = dy
      d.idle = 0
      invalidate()
    }
    const onUp = () => {
      d.down = false
      el.style.cursor = 'grab'
    }
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
    }
  }, [gl, invalidate])

  const scene = useMemo(() => {
    // Land dots. The highlighted countries last, so they draw over any neighbour.
    const lists = [
      [DOTS.land, 0],
      [DOTS.sources, 2],
      [DOTS.india, 1],
    ] as const
    const n = lists.reduce((sum, [list]) => sum + list.length / 2, 0)
    const pos = new Float32Array(n * 3)
    const kind = new Float32Array(n)
    let k = 0
    for (const [list, flag] of lists) {
      for (let i = 0; i < list.length; i += 2) {
        toVec(list[i], list[i + 1], 1.003).toArray(pos, k * 3)
        kind[k++] = flag
      }
    }
    const dotGeo = new THREE.BufferGeometry()
    dotGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    dotGeo.setAttribute('aKind', new THREE.BufferAttribute(kind, 1))

    const mumbai = toVec(...PLACES.mumbai)
    const hyderabad = toVec(...PLACES.hyderabad)

    const makeLine = ([lat, lon]: readonly [number, number], lead: boolean): Line => {
      const curve = arcCurve(toVec(lat, lon), mumbai)
      return {
        curve,
        geo: new THREE.TubeGeometry(curve, 96, lead ? 0.011 : 0.0058, 8, false),
        mat: lead
          ? arcMaterial(GREEN, COLOR.accent, 0.3)
          : arcMaterial(COLOR.accent, COLOR.accent, 0.13),
        from: toVec(lat, lon, 1.004),
        lead,
      }
    }

    const hopCurve = arcCurve(mumbai, hyderabad, 0.05)

    return {
      dotGeo,
      dotMat: dotMaterial(),
      globeMat: globeMaterial(),
      atmoMat: atmosphereMaterial(),
      gridGeo: graticule(),
      lead: FROM_SOURCES.map((o) => makeLine(o, true)),
      world: FROM_WORLD.map((o) => makeLine(o, false)),
      hop: {
        curve: hopCurve,
        geo: new THREE.TubeGeometry(hopCurve, 48, 0.01, 8, false),
        mat: arcMaterial(COLOR.accent, GREEN, 0.25),
      },
      anchors: Object.fromEntries(
        (Object.keys(PLACES) as LabelKey[]).map((key) => [key, toVec(...PLACES[key], 1.006)]),
      ) as Record<LabelKey, THREE.Vector3>,
      normalM: mumbai.clone(),
      normalH: hyderabad.clone(),
    }
  }, [])

  /** Lead lines first, then the world's — the same order they render in. */
  const packets = useRef<(THREE.Mesh | null)[]>([])
  const hopPacket = useRef<THREE.Mesh>(null)
  const ringsM = useRef<(THREE.Mesh | null)[]>([])
  const ringH = useRef<THREE.Mesh>(null)
  const scratch = useMemo(() => new THREE.Vector3(), [])
  const normal = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    const time = still ? LEAD * 0.62 : state.clock.elapsedTime
    const g = spin.current
    const t = tilt.current
    if (!g || !t) return

    const cam = state.camera as THREE.PerspectiveCamera
    scene.dotMat.uniforms.uScale.value =
      (state.size.height * state.viewport.dpr) / (2 * Math.tan((cam.fov * D2R) / 2))
    scene.dotMat.uniforms.uTime.value = time

    // Coast after a drag, then drift home once it has been left alone.
    const d = drag.current
    if (!d.down && !still) {
      d.yaw += d.vYaw
      d.pitch = THREE.MathUtils.clamp(d.pitch + d.vPitch, -0.5, 0.5)
      d.vYaw *= 0.94
      d.vPitch *= 0.9
      d.idle += delta
      if (d.idle > 2.2) {
        // The shortest way home, not back through every turn it was given.
        d.yaw = Math.atan2(Math.sin(d.yaw), Math.cos(d.yaw))
        const k = 1 - Math.exp(-delta * 1.4)
        d.yaw -= d.yaw * k
        d.pitch -= d.pitch * k
      }
    }

    // A slow sway either side of home: alive, but never carrying India away.
    const sway = still ? 0 : Math.sin(time * 0.16) * 0.12
    g.rotation.y = -Math.PI / 2 - FACE.lon * D2R + sway + d.yaw
    t.rotation.x = FACE.lat * D2R + d.pitch

    const drive = (lines: Line[], period: number, offset: number) =>
      lines.forEach((line, i) => {
        const head = frac(time / period + i / lines.length) * RUN
        const u = line.mat.uniforms
        u.uHead.value = head
        u.uReverse.value = out ? 1 : 0
        u.uBase.value = out ? (line.lead ? 0.14 : 0.07) : line.lead ? 0.3 : 0.13
        u.uFrom.value.set(out ? GREEN : line.lead ? GREEN : COLOR.accent)
        u.uTo.value.set(out ? GREEN : COLOR.accent)
        const p = packets.current[offset + i]
        if (!p) return
        p.visible = head <= 1
        if (p.visible) line.curve.getPointAt(out ? 1 - head : head, p.position)
        // A lead packet leaves green and arrives blue, like its line.
        ;(p.material as THREE.MeshBasicMaterial).color.set(
          out || (line.lead && head < 0.5) ? GREEN : COLOR.accent,
        )
      })
    drive(scene.lead, LEAD, 0)
    drive(scene.world, WORLD, scene.lead.length)

    // Every lead landing at Mumbai sets off a ring there and a hop inland.
    const count = scene.lead.length
    const beat = frac((time * count) / LEAD - count * LAND)
    ringsM.current.forEach((ring, j) => {
      if (!ring) return
      const r = frac(beat + j * 0.5)
      ring.scale.setScalar(0.02 + r * 0.08)
      ;(ring.material as THREE.MeshBasicMaterial).opacity = (1 - r) * 0.75
    })

    const hopHead = out ? 0 : beat * 1.7
    scene.hop.mat.uniforms.uHead.value = hopHead
    scene.hop.mat.uniforms.uBase.value = out ? 0.06 : 0.25
    if (hopPacket.current) {
      hopPacket.current.visible = !out && hopHead <= 1
      if (hopPacket.current.visible) scene.hop.curve.getPointAt(hopHead, hopPacket.current.position)
    }
    if (ringH.current) {
      const r = frac(beat - 1 / 1.7)
      ringH.current.visible = !out
      ringH.current.scale.setScalar(0.02 + r * 0.06)
      ;(ringH.current.material as THREE.MeshBasicMaterial).opacity = (1 - r) * 0.7
    }

    // Pin the DOM labels to their places, and fade any that turn away.
    t.updateMatrixWorld()
    for (const key of Object.keys(labels) as LabelKey[]) {
      const el = labels[key].current
      if (!el) continue
      const at = scene.anchors[key]
      normal.copy(at).applyMatrix4(g.matrixWorld).normalize()
      const facing = normal.dot(scratch.copy(cam.position).normalize())
      scratch.copy(at).applyMatrix4(g.matrixWorld).project(cam)
      const x = (scratch.x * 0.5 + 0.5) * state.size.width
      const y = (-scratch.y * 0.5 + 0.5) * state.size.height
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
      el.style.opacity = String(THREE.MathUtils.clamp((facing - 0.25) * 4, 0, 1))
    }
  })

  return (
    <group ref={tilt}>
      <group ref={spin}>
        <mesh material={scene.globeMat}>
          <sphereGeometry args={[1, 96, 72]} />
        </mesh>
        <lineSegments geometry={scene.gridGeo}>
          <lineBasicMaterial color="#6f93bf" transparent opacity={0.13} depthWrite={false} />
        </lineSegments>
        <points geometry={scene.dotGeo} material={scene.dotMat} />

        {[...scene.lead, ...scene.world].map((line, i) => (
          <group key={i}>
            <mesh geometry={line.geo} material={line.mat} />
            {/* The far end: a quiet mark, not a pin. */}
            <mesh position={line.from}>
              <sphereGeometry args={[line.lead ? 0.012 : 0.008, 10, 8]} />
              <meshBasicMaterial
                color={line.lead ? GREEN : COLOR.accent}
                transparent
                opacity={line.lead ? 0.55 : 0.25}
              />
            </mesh>
            <mesh ref={(m) => void (packets.current[i] = m)}>
              <sphereGeometry args={[line.lead ? 0.024 : 0.016, 14, 10]} />
              <meshBasicMaterial color={COLOR.accent} />
            </mesh>
          </group>
        ))}

        <mesh geometry={scene.hop.geo} material={scene.hop.mat} />
        <mesh ref={hopPacket}>
          <sphereGeometry args={[0.017, 14, 10]} />
          <meshBasicMaterial color={GREEN} />
        </mesh>

        {/* The two desks. */}
        <Pin at={scene.anchors.mumbai} color={COLOR.accent} />
        <Pin at={scene.anchors.hyderabad} color={GREEN} />
        {[0, 1].map((j) => (
          <Ring
            key={j}
            ref={(m) => void (ringsM.current[j] = m)}
            at={scene.anchors.mumbai}
            normal={scene.normalM}
            color={COLOR.accent}
          />
        ))}
        <Ring ref={ringH} at={scene.anchors.hyderabad} normal={scene.normalH} color={GREEN} />
      </group>
      {/* Outside the spin: the atmosphere is round, it does not need to turn. */}
      <mesh material={scene.atmoMat}>
        <sphereGeometry args={[ATMOSPHERE_R, 64, 48]} />
      </mesh>
    </group>
  )
}

function Pin({ at, color }: { at: THREE.Vector3; color: string }) {
  return (
    <mesh position={at}>
      <sphereGeometry args={[0.02, 16, 12]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

/** A flat ring lying on the surface, which the frame loop grows and fades. */
function Ring({
  ref,
  at,
  normal,
  color,
}: {
  ref: Ref<THREE.Mesh>
  at: THREE.Vector3
  normal: THREE.Vector3
  color: string
}) {
  const quat = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal),
    [normal],
  )
  return (
    <mesh ref={ref} position={at} quaternion={quat}>
      <ringGeometry args={[0.82, 1, 48]} />
      <meshBasicMaterial color={color} transparent depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  )
}
