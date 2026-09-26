import Enquiry from '../components/Enquiry'
import { OfficeCard } from '../components/Offices'
import { Eyebrow, PageTitle, Section, SectionTitle } from '../components/ui'
import { OFFICES, PAGES } from '../data/site'
import { useReveal } from '../lib/motion'
import { usePageMeta } from '../lib/meta'

/** The enquiry form and direct lines, then both offices with their maps. */
export default function ContactPage() {
  const page = PAGES.contact
  usePageMeta('Contact us', page.meta)
  const ref = useReveal<HTMLElement>({ stagger: 0.08 })

  return (
    <>
      <PageTitle>{page.title.replace(' | ', ' ')}</PageTitle>

      <Enquiry />
      <Section id="offices" ref={ref}>
        <Eyebrow>Offices</Eyebrow>
        <SectionTitle>Hyderabad and | Mumbai</SectionTitle>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {OFFICES.map((office) => (
            <OfficeCard key={office.id} office={office} />
          ))}
        </div>
      </Section>
    </>
  )
}
