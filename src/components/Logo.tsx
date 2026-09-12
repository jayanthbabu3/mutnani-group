import { SITE } from '../data/site'

/**
 * The wordmark: the group's own mark beside the name.
 *
 * `mark.png` is cut from the client's supplied logo artwork, not redrawn — the
 * blue-to-green M is theirs and an approximation of it would be visibly wrong
 * to anyone who knows it. It is the one raster asset in the header; the README
 * notes that a vector should replace it when the client's designer can supply
 * one.
 *
 * MUTNANI is set in the body sans as tracked caps, not in Fraunces. Fraunces
 * below its 1.2rem floor loses the very stroke contrast that makes it itself,
 * and a wordmark is the one place the identity has to be unmistakable. The
 * original logo sets it in a grotesque anyway, so this matches it.
 *
 * The mark never takes the accent colour — the accent is for the action, not
 * the name. It carries its own blue-to-green gradient, which is where both
 * halves of the palette come from in the first place.
 */
export default function Logo({ className = '' }: { className?: string }) {
  return (
    <a
      href="#top"
      className={`flex items-center gap-3 ${className}`}
      aria-label={`${SITE.name} ${SITE.role} — home`}
    >
      <img
        src="/mark.png"
        alt=""
        width={209}
        height={160}
        // Eager and high priority: it is above the fold in the header, and a
        // logo that pops in after first paint reads as a broken page.
        fetchPriority="high"
        className="h-[30px] w-auto sm:h-[34px]"
      />
      <span className="leading-none">
        <span className="block text-[1.05rem] font-semibold tracking-[0.14em] text-heading sm:text-[1.15rem]">
          {SITE.name.toUpperCase()}
        </span>
        <span className="tech-sm mt-1 block text-body/70">{SITE.role}</span>
      </span>
    </a>
  )
}
