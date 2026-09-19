import { useEffect } from 'react'

/**
 * The tab title and description for the page on screen.
 *
 * index.html carries the home page's, so that is what a crawler or a link
 * preview sees before any script runs. Inner pages set their own on mount and
 * hand the home values back when they leave.
 */
const HOME_TITLE = typeof document === 'undefined' ? '' : document.title
const HOME_DESCRIPTION =
  typeof document === 'undefined'
    ? ''
    : (document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '')

export function usePageMeta(title?: string, description?: string) {
  useEffect(() => {
    const meta = document.querySelector('meta[name="description"]')
    document.title = title ? `${title} — Mutnani Group of Companies` : HOME_TITLE
    meta?.setAttribute('content', description ?? HOME_DESCRIPTION)
    return () => {
      document.title = HOME_TITLE
      meta?.setAttribute('content', HOME_DESCRIPTION)
    }
  }, [title, description])
}
