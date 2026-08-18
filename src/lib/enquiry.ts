import { z } from 'zod'
import { SITE, whatsappHref } from '../data/site'

/**
 * Enquiry handling with no backend.
 *
 * Default route is WhatsApp — for a local service business it converts far
 * better than a form that drops into an inbox, and there is nothing to host.
 * Set VITE_ENQUIRY_ENDPOINT (Formspree, Google Apps Script, whatever) and the
 * enquiry is POSTed there as well, so the client keeps a record.
 *
 * Validation is client-side only. It is a convenience for the visitor, not a
 * security boundary — anything reaching a real endpoint must be revalidated
 * server-side.
 */

export const enquirySchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name'),
  phone: z
    .string()
    .trim()
    .regex(/^[\d\s+()-]{8,18}$/, 'Please enter a valid phone number'),
  email: z.union([z.literal(''), z.string().trim().email('Please check the email address')]),
  date: z.string().trim().optional(),
  message: z.string().trim().max(1000).optional(),
})

export type Enquiry = z.infer<typeof enquirySchema>
export type EnquiryErrors = Partial<Record<keyof Enquiry, string>>

export const EMPTY_ENQUIRY: Enquiry = { name: '', phone: '', email: '', date: '', message: '' }

/** Field-keyed errors, ready to render under each input. */
export function validateEnquiry(input: unknown): EnquiryErrors | null {
  const result = enquirySchema.safeParse(input)
  if (result.success) return null

  return result.error.issues.reduce<EnquiryErrors>((acc, issue) => {
    const key = issue.path[0] as keyof Enquiry
    // First message per field wins — stacking them just makes noise.
    return key in acc ? acc : { ...acc, [key]: issue.message }
  }, {})
}

/** Readable on a phone screen, which is where it lands. */
export function enquiryMessage(e: Enquiry) {
  return [
    `Hi ${SITE.name}, I'd like to enquire.`,
    '',
    `Name: ${e.name}`,
    `Phone: ${e.phone}`,
    e.email ? `Email: ${e.email}` : null,
    e.date ? `Date: ${e.date}` : null,
    e.message ? `\n${e.message}` : null,
  ]
    .filter((line) => line !== null)
    .join('\n')
}

const ENDPOINT = import.meta.env.VITE_ENQUIRY_ENDPOINT as string | undefined

export type SubmitResult = { ok: true; href: string } | { ok: false; errors: EnquiryErrors }

/**
 * Validates, mirrors to the endpoint if configured, and returns the WhatsApp
 * href for the caller to open. A failed POST never blocks the visitor — the
 * conversation matters more than the record.
 */
export async function submitEnquiry(input: Enquiry): Promise<SubmitResult> {
  const errors = validateEnquiry(input)
  if (errors) return { ok: false, errors }

  const body = enquiryMessage(input)

  if (ENDPOINT) {
    try {
      await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...input, summary: body }),
      })
    } catch (error) {
      // Deliberately swallowed: the WhatsApp handoff below still works, and a
      // visitor cannot act on a logging failure.
      console.warn('Enquiry mirror failed', error)
    }
  }

  return { ok: true, href: whatsappHref(body) }
}
