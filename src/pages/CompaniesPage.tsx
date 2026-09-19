import BuildSteps from '../components/BuildSteps'
import ContactCta from '../components/ContactCta'
import Divisions from '../components/Divisions'
import PageHero from '../components/PageHero'
import PrefabSolutions from '../components/PrefabSolutions'
import RoofingLine from '../components/RoofingLine'
import TradeRoutes from '../components/TradeRoutes'
import { Divider } from '../components/ui'
import { PAGES } from '../data/site'
import { usePageMeta } from '../lib/meta'

/**
 * The three companies, each at full length: the overview cards, then Balaji
 * Prefab with how its buildings go up, Balaji Roofing's line, and Mutnani
 * IMEX's globe.
 */
export default function CompaniesPage() {
  const page = PAGES.companies
  usePageMeta('Our companies', page.meta)

  return (
    <>
      <PageHero crumb="Companies" eyebrow={page.eyebrow} title={page.title} lede={page.lede} />
      <Divisions />
      <Divider />
      <PrefabSolutions />
      <Divider />
      <BuildSteps />
      <Divider />
      <RoofingLine />
      <Divider />
      <TradeRoutes />
      <ContactCta />
    </>
  )
}
