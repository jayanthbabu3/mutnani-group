/**
 * Builds src/data/globe-dots.json — the land dots on the imports globe.
 *
 *   node scripts/build-globe-dots.mjs
 *
 * Run once; the output is committed, so the page never ships a world map or a
 * geometry library. Points are an even Fibonacci spiral over the sphere, kept
 * where they fall on land (Natural Earth 1:110m, via world-atlas).
 *
 * India and China are their own lists so the scene can colour them. China is
 * the People's Republic only (156), not Taiwan.
 *
 * Natural Earth draws the de facto line in India's north, which is not the
 * boundary India recognises, and a map on an Indian company's site must not
 * show the country short of it. So India here is the Natural Earth shape PLUS
 * every land dot inside the box that covers Jammu & Kashmir and Ladakh as
 * India claims them — and India is tested before China, so none of that
 * ground is coloured as China.
 */
import { writeFileSync } from 'node:fs'
import { geoContains } from 'd3-geo'
import { feature } from 'topojson-client'
import land110 from 'world-atlas/land-110m.json' with { type: 'json' }
import countries110 from 'world-atlas/countries-110m.json' with { type: 'json' }

const N = 22000
const land = feature(land110, land110.objects.land)
const india = feature(countries110, countries110.objects.countries).features.find(
  (f) => f.id === '356',
)
const china = feature(countries110, countries110.objects.countries).features.find(
  (f) => f.id === '156',
)
if (!india || !china) throw new Error('India (356) or China (156) not found in countries-110m')

/**
 * Jammu & Kashmir and Ladakh, as India's official map draws them. Two boxes,
 * not one: south of 35°N the west edge has to stop short of Islamabad.
 */
const inClaimedNorth = (lat, lon) =>
  lat <= 37.1 && lon <= 80.4 && ((lat >= 35 && lon >= 72.5) || (lat >= 32.4 && lon >= 73.6))

const round = (n) => Math.round(n * 10) / 10
const out = { land: [], india: [], china: [] }
const golden = Math.PI * (3 - Math.sqrt(5))

for (let i = 0; i < N; i++) {
  const y = 1 - (i / (N - 1)) * 2
  const lat = (Math.asin(y) * 180) / Math.PI
  const lon = ((((i * golden * 180) / Math.PI) % 360) + 540) % 360 - 180
  const p = [lon, lat]
  if (!geoContains(land, p)) continue
  // India is tested first, so the claimed north is never coloured as China.
  const target =
    geoContains(india, p) || inClaimedNorth(lat, lon)
      ? out.india
      : geoContains(china, p)
        ? out.china
        : out.land
  target.push(round(lat), round(lon))
}

writeFileSync(new URL('../src/data/globe-dots.json', import.meta.url), JSON.stringify(out))
console.log(`land ${out.land.length / 2} · india ${out.india.length / 2} · china ${out.china.length / 2}`)
