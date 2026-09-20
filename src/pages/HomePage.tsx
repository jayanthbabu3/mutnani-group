import About from '../components/About'
import Appreciation from '../components/Appreciation'
import BuildSteps from '../components/BuildSteps'
import Divisions from '../components/Divisions'
import Enquiry from '../components/Enquiry'
import Hero from '../components/Hero'
import Partners from '../components/Partners'
import PrefabSolutions from '../components/PrefabSolutions'
import RoofingLine from '../components/RoofingLine'
import SiteVideos from '../components/SiteVideos'
import TradeRoutes from '../components/TradeRoutes'
import Trust from '../components/Trust'
import { Divider } from '../components/ui'
import { usePageMeta } from '../lib/meta'

/**
 * The home page: the whole story on one scroll. Unchanged by the inner pages
 * — they give each part room of its own, they do not take it away from here.
 *
 * Section order is the buyer's order of questions: what do you do (hero) → how
 * does this actually go up (build) → who are you three (divisions) → each
 * company in turn (prefab, roofing, trade) → who else has bought (the
 * partners logo strip) → show me (site videos) → who is behind it (about) →
 * why you (trust) → talk to me (enquiry).
 *
 * About sits late on the client's instruction: the work leads, and the
 * group's story and awards come once the visitor has seen what it builds.
 */
export default function HomePage() {
  usePageMeta()

  return (
    <>
      <Hero />
      <BuildSteps />
      <Divider />
      <Divisions />
      <Divider />
      {/* Proof, straight after the claim: the letters the contractors wrote. */}
      <Appreciation />
      <Divider />

      {/* One signature per company, in the group's own order.
          01 Balaji Prefab Private Limited builds the building, 02 Balaji
          Roofing Industries makes the sheet that clads it, 03 Mutnani IMEX
          Infra brings in what neither makes. */}
      <PrefabSolutions />
      <Divider />
      <RoofingLine />
      <Divider />
      <TradeRoutes />
      <Divider />

      <Partners />
      <SiteVideos />
      {/* Who the group is, and the only section with its own photography. */}
      <About />
      <Divider />
      <Trust />
      <Divider />
      <Enquiry />
    </>
  )
}
