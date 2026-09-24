import { useEffect, useSyncExternalStore } from 'react'
import { ScrollTrigger, scrollToTarget } from './motion'

/**
 * The site's router: four paths, no library.
 *
 * Home, /companies, /about, /contact and /what-we-build are one React app
 * sharing a header,
 * footer and tab bar, so a router is a pathname, a way to change it and a way
 * to hear it change — which is what this is. A dependency would bring nested
 * routes, loaders and params for four flat pages that need none of them.
 *
 * Every same-site link on the page is picked up by the one click listener in
 * `useLinkInterception`, so components write plain `<a href="/about">` and
 * `<a href="/#videos">` and never import anything from here.
 *
 * On Vercel, vercel.json rewrites these paths to index.html so a refresh or a
 * shared link lands on the right page; Vite's dev server does the same.
 */

export type Page =
  | 'home'
  | 'companies'
  | 'about'
  | 'contact'
  | 'applications'
  | 'roofing'
  | 'missing'

const PAGES: Record<string, Page> = {
  '/': 'home',
  '/companies': 'companies',
  '/about': 'about',
  '/contact': 'contact',
  '/what-we-build': 'applications',
  '/roofing-range': 'roofing',
}

/** "/about/" and "/about" are the same page. */
const normalise = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path)

const EVENT = 'site:navigate'

const subscribe = (fn: () => void) => {
  window.addEventListener('popstate', fn)
  window.addEventListener(EVENT, fn)
  return () => {
    window.removeEventListener('popstate', fn)
    window.removeEventListener(EVENT, fn)
  }
}

const getPath = () => normalise(window.location.pathname)

/** The current path, re-rendering on every navigation. */
export function usePath() {
  return useSyncExternalStore(subscribe, getPath, () => '/')
}

export const pageFor = (path: string): Page => PAGES[normalise(path)] ?? 'missing'

/**
 * Go to a same-site URL. A hash on the SAME page just scrolls; anything else
 * pushes history, and the page scrolls once the new one has rendered (see
 * `useScrollOnNavigate`).
 */
export function navigate(to: string) {
  const url = new URL(to, window.location.href)
  const samePage = normalise(url.pathname) === getPath()

  if (samePage) {
    if (url.hash) {
      const target = document.querySelector(url.hash)
      if (target) scrollToTarget(target as HTMLElement)
    } else {
      scrollToTarget(0)
    }
    if (url.hash !== window.location.hash) history.replaceState(null, '', url.pathname + url.hash)
    return
  }

  history.pushState(null, '', url.pathname + url.hash)
  window.dispatchEvent(new Event(EVENT))
}

/**
 * One listener for every link. It only takes plain left clicks on same-origin
 * links that point at a path; new-tab clicks, `target="_blank"`, downloads,
 * tel:, mailto: and WhatsApp all go through untouched. Bare "#section" links
 * are left to the smooth-scroll handler in lib/motion.ts.
 */
export function useLinkInterception() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return
      const a = (e.target as HTMLElement)?.closest?.('a')
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return
      const href = a.getAttribute('href')
      if (!href || !href.startsWith('/') || href.startsWith('//')) return
      if (normalise(new URL(href, window.location.href).pathname).startsWith('/admin')) return
      e.preventDefault()
      navigate(href)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
}

/**
 * After a page change: have ScrollTrigger measure the new page, then land on
 * the hash if there is one, otherwise at the top.
 *
 * Measure FIRST. Pinned sections add their pin spacing during a refresh, so
 * scrolling before it lands on where a section was, not where it ends up —
 * "/#videos" from another page came to rest two thousand pixels short.
 */
export function useScrollOnNavigate(path: string) {
  useEffect(() => {
    // Two frames: one for React to commit the new page, one for layout.
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        ScrollTrigger.refresh()
        const hash = window.location.hash
        const target = hash ? document.querySelector(hash) : null
        scrollToTarget(target ? (target as HTMLElement) : 0, { immediate: true })
      }),
    )
    return () => cancelAnimationFrame(id)
  }, [path])
}
