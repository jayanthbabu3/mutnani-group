import About, { Awards } from '../components/About'
import ContactCta from '../components/ContactCta'
import PageHero from '../components/PageHero'
import Partners from '../components/Partners'
import Trust from '../components/Trust'
import { Divider } from '../components/ui'
import { PAGES } from '../data/site'
import { usePageMeta } from '../lib/meta'

/** Who the group is: its story and awards, why clients come back, and who they are. */
export default function AboutPage() {
  const page = PAGES.about
  usePageMeta('About us', page.meta)

  return (
    <>
      <PageHero crumb="About" eyebrow={page.eyebrow} title={page.title} lede={page.lede} />
      <About />
      <Divider />
      <Awards />
      <Divider />
      <Trust />
      <Partners />
      <ContactCta />
    </>
  )
}
