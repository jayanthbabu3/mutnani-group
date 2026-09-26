import ContactCta from '../components/ContactCta'
import Divisions from '../components/Divisions'
import { PageTitle } from '../components/ui'
import { PAGES } from '../data/site'
import { usePageMeta } from '../lib/meta'

/**
 * The three companies as one overview. Each card's "View more" opens that
 * company's own page — /what-we-build, /roofing-range, /imports — which is
 * where its full section now lives.
 */
export default function CompaniesPage() {
  const page = PAGES.companies
  usePageMeta('Our companies', page.meta)

  return (
    <>
      <PageTitle>{page.title.replace(' | ', ' ')}</PageTitle>

      <Divisions />
      <ContactCta />
    </>
  )
}
