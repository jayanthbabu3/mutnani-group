import { useEffect, useState } from 'react'
import FontOptions from './components/FontOptions'
import Footer from './components/Footer'
import Header from './components/Header'
import MobileTabBar from './components/MobileTabBar'
import WhatsAppFab from './components/WhatsAppFab'
import { ScrollTrigger, useSmoothScroll } from './lib/motion'
import { pageFor, useLinkInterception, usePath, useScrollOnNavigate } from './lib/router'
import AboutPage from './pages/AboutPage'
import ApplicationsPage from './pages/ApplicationsPage'
import CompaniesPage from './pages/CompaniesPage'
import ContactPage from './pages/ContactPage'
import RoofingRangePage from './pages/RoofingRangePage'
import HomePage from './pages/HomePage'
import ImportsPage from './pages/ImportsPage'
import NotFoundPage from './pages/NotFoundPage'

const PAGE_COMPONENTS = {
  home: HomePage,
  companies: CompaniesPage,
  about: AboutPage,
  contact: ContactPage,
  applications: ApplicationsPage,
  roofing: RoofingRangePage,
  imports: ImportsPage,
  missing: NotFoundPage,
}

/**
 * Mutnani Group of Companies.
 *
 * Four pages — home, companies, about, contact — sharing one header, footer,
 * tab bar and WhatsApp button. Which page is on screen is the URL's path; see
 * lib/router.ts. Each page is composed from the same section components, so
 * a section edited once is edited everywhere it appears.
 *
 * No grain or vignette on the root: both were dark-ground effects holding the
 * large flat navy fields together, and on white grain reads as a dirty screen.
 */
export default function App() {
  const [showFonts, setShowFonts] = useState(false)
  const path = usePath()
  const page = pageFor(path)
  const Page = PAGE_COMPONENTS[page]

  useSmoothScroll()
  useLinkInterception()
  useScrollOnNavigate(path)

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

      {/* Keyed by path, so every section's reveal and scroll triggers are
          built fresh for the page they are on.

          `page-inner` gives every page but home a tighter rhythm (index.css):
          a home section reserves a screen so the page reads one band at a
          time, which on an inner page left 250px+ of white between short
          bands. */}
      <main key={path} className={page === 'home' ? undefined : 'page-inner'}>
        <Page />
      </main>

      <Footer />

      <WhatsAppFab />
      <MobileTabBar />
    </div>
  )
}
