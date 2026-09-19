import PageHero from '../components/PageHero'
import { CtaLink, Shell } from '../components/ui'
import { usePageMeta } from '../lib/meta'

/** Any path that is not a page: say so, and offer the way back. */
export default function NotFoundPage() {
  usePageMeta('Page not found')

  return (
    <>
      <PageHero
        crumb="Not found"
        eyebrow="404"
        title="This page | is not here"
        lede="The link may be old, or the address mistyped. Everything the group does is a click away from the home page."
      />
      <Shell className="pb-28">
        <CtaLink href="/">Back to the home page</CtaLink>
      </Shell>
    </>
  )
}
