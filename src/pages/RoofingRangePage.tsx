import ContactCta from '../components/ContactCta'
import PageHero from '../components/PageHero'
import RoofingLine from '../components/RoofingLine'
import SteelStrip from '../components/SteelStrip'
import VideoGrid from '../components/VideoGrid'
import { PAGES } from '../data/site'
import { usePageMeta } from '../lib/meta'

/**
 * What Balaji Roofing rolls: the line that makes it, and the mills the coil
 * comes from.
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
      <PageHero crumb="Roofing range" eyebrow={page.eyebrow} title={page.title} lede={page.lede} />

      <RoofingLine />
      <SteelStrip />
      <VideoGrid group="roofing" />
      <ContactCta />
    </>
  )
}
