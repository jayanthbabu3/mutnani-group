import { useEffect, useState } from 'react'
import About from './components/About'
import BuildSteps from './components/BuildSteps'
import Divisions from './components/Divisions'
import Enquiry from './components/Enquiry'
import FontOptions from './components/FontOptions'
import Footer from './components/Footer'
import Header from './components/Header'
import Hero from './components/Hero'
import MobileTabBar from './components/MobileTabBar'
import Partners from './components/Partners'
import PrefabSolutions from './components/PrefabSolutions'
import RoofingLine from './components/RoofingLine'
import SiteVideos from './components/SiteVideos'
import TradeRoutes from './components/TradeRoutes'
import Trust from './components/Trust'
import WhatsAppFab from './components/WhatsAppFab'
import { Divider } from './components/ui'
import { ScrollTrigger, useSmoothScroll } from './lib/motion'

/**
 * Mutnani Group of Companies.
 *
 * Section order is the buyer's order of questions: what do you do (hero) → who
 * are you (about) → who are you three (divisions) → how does this actually go up (build) → what is in
 * the panel (mechanism) → what can I order (products) → who else has bought
 * (the partners logo strip) → show me (site videos) → why you (trust) →
 * talk to me (enquiry).
 *
 * No grain or vignette on the root: both were dark-ground effects holding the
 * large flat navy fields together, and on white grain reads as a dirty screen.
 */
export default function App() {
  const [showFonts, setShowFonts] = useState(false)

  useSmoothScroll()

  useEffect(() => {
    if (window.location.search.includes('fonts')) {
      setShowFonts(true)
      return
    }

    // Fonts land after first paint and shift every measurement ScrollTrigger
    // already took. Re-measure once they are in.
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
  }, [])

  if (showFonts) {
    return <FontOptions />
  }

  return (
    <div className="relative min-h-screen">
      <Header />

      <main>
        <Hero />
        {/* Who the group is, and the only section with its own photography. */}
        <About />
        <Divider />
        <Divisions />
        <Divider />

        {/* One signature per company, in the group's own order.
            01 Balaji Prefab Solutions — the hero, then how a building goes up.
            02 Balaji Roofing — the line that makes the panel, then what is
               inside the panel it makes.
            03 Balaji Prefab Import & Exports — the lanes.
            Before this, prefab had two sections and the other two had a
            footnote each, which is not a group of three companies. */}
        <BuildSteps />
        <Divider />
        {/* The three companies, in order and numbered: 01 builds the building,
            02 makes the panel that clads it, 03 moves the goods. */}
        <PrefabSolutions />
        <Divider />
        <RoofingLine />
        <Divider />
        <TradeRoutes />
        <Divider />

        <Partners />
        <SiteVideos />
        <Trust />
        <Divider />
        <Enquiry />
      </main>

      <Footer />

      <WhatsAppFab />
      <MobileTabBar />
    </div>
  )
}
