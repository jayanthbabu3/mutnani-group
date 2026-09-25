import About, { Awards } from '../components/About'
import Appreciation from '../components/Appreciation'
import BuildSteps from '../components/BuildSteps'
import Divisions from '../components/Divisions'
import Enquiry from '../components/Enquiry'
import Hero from '../components/Hero'
import Partners from '../components/Partners'
import SiteVideos from '../components/SiteVideos'
import Trust from '../components/Trust'
import { Divider } from '../components/ui'
import { usePageMeta } from '../lib/meta'

/**
 * The home page: the whole story on one scroll. Unchanged by the inner pages
 * — they give each part room of its own, they do not take it away from here.
 *
 * Section order is the client's, numbered in their own notes: what do you do
 * (hero) → what have you been given (awards) → who says so (appreciation
 * letters) → who are you three (divisions) → how a building goes up (build) →
 * who else has bought (partners) → show me (site videos) → who is behind it
 * (about) → why you (trust) → talk to me (enquiry).
 *
 * Proof leads and the story follows: the awards and the letters are both
 * third-party, and they come before anything the group says about itself.
 */
export default function HomePage() {
  usePageMeta()

  return (
    <>
      <Hero />
      <Divider />
      <Awards />
      <Divider />
      <Appreciation />
      <Divider />
      <Divisions />
      <Divider />

      {/* Each company's own section lives on its own page now, behind the
          "View more" on its card — /what-we-build, /roofing-range, /imports.
          The home page introduces the three and shows how a building goes up;
          it does not carry all three verticals as well. */}
      <BuildSteps />
      <Divider />

      <Partners />
      <SiteVideos />
      {/* Who the group is, once the work has spoken for it. */}
      <About />
      <Divider />
      <Trust />
      <Divider />
      <Enquiry />
    </>
  )
}
