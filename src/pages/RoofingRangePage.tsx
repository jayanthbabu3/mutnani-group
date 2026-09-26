import ContactCta from '../components/ContactCta'
import RoofingLine from '../components/RoofingLine'
import VideoGrid from '../components/VideoGrid'
import { PageTitle } from '../components/ui'
import { PAGES } from '../data/site'
import { usePageMeta } from '../lib/meta'

/**
 * What Balaji Roofing rolls: the line that makes it, which names the mills
 * its coil comes from on its own — a second card repeating Tata, Jindal and
 * AMNS said the same thing twice on one page.
 *
 * The line is the section that used to sit on the home page, unchanged, so
 * the drawing of the process lives in one place and every page that shows it
 * inherits each edit.
 */
export default function RoofingRangePage() {
  const page = PAGES.roofing
  usePageMeta('Roofing range', page.meta)

  return (
    <>
      <PageTitle>{page.title.replace(' | ', ' ')}</PageTitle>

      <RoofingLine />
      <VideoGrid group="roofing" />
      <ContactCta />
    </>
  )
}
