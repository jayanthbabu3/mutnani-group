import { SITE } from '../data/site'

/**
 * The group's logo lockup: the M, "MUTNANI GROUP" and the "From vision to
 * reality" line, as one image.
 *
 * It is cut from the client's supplied artwork, not redrawn or re-set in a web
 * font — the two-colour wordmark and the spaced tagline are theirs, and any
 * approximation of them would be visibly wrong to anyone who knows the brand.
 * The stacked original is re-arranged side by side here because a header bar
 * has room for width, not height. A vector should replace this raster when the
 * client's designer can supply one.
 *
 * The artwork was delivered on white and keyed to transparency, so it belongs
 * on the white page only — never on a dark or photographic ground.
 */
export default function Logo({ className = '' }: { className?: string }) {
  return (
    <a href="/" className={`flex items-center ${className}`} aria-label={`${SITE.name} Group — home`}>
      <img
        src="/brand/logo-horizontal.webp"
        alt={`${SITE.name} Group — from vision to reality`}
        width={824}
        height={104}
        // Eager and high priority: it is above the fold in the header, and a
        // logo that pops in after first paint reads as a broken page.
        fetchPriority="high"
        className="h-[30px] w-auto sm:h-[34px]"
      />
    </a>
  )
}
