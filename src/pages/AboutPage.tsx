import About, { Awards } from '../components/About'
import ContactCta from '../components/ContactCta'
import Partners from '../components/Partners'
import Trust from '../components/Trust'
import { Divider, PageTitle } from '../components/ui'
import { PAGES } from '../data/site'
import { usePageMeta } from '../lib/meta'

/** Who the group is: its story and awards, why clients come back, and who they are. */
export default function AboutPage() {
  const page = PAGES.about
  usePageMeta('About us', page.meta)

  return (
    <>
      <PageTitle>{page.title.replace(' | ', ' ')}</PageTitle>

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
