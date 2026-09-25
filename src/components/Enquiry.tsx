import { useState } from 'react'
import { CONTENT, SITE } from '../data/site'
import { EMPTY_ENQUIRY, submitEnquiry } from '../lib/enquiry'
import type { Enquiry as EnquiryValues, EnquiryErrors } from '../lib/enquiry'
import { useReveal } from '../lib/motion'
import { Eyebrow, Lede, Section, SectionTitle } from './ui'

/**
 * The enquiry. Validated with zod, handed off to WhatsApp.
 *
 * For this buyer the handoff matters more than the form: a project manager
 * sourcing a shed will send a WhatsApp from a site and expect a reply on it.
 * Set VITE_ENQUIRY_ENDPOINT and every enquiry is mirrored to it as well, so the
 * office keeps a record — see lib/enquiry.ts.
 *
 * Validation here is a convenience for the visitor, never a security boundary.
 * Anything reaching a real endpoint must be revalidated server-side.
 */
export default function Enquiry() {
  const ref = useReveal<HTMLElement>({ stagger: 0.07 })
  const [values, setValues] = useState<EnquiryValues>(EMPTY_ENQUIRY)
  const [errors, setErrors] = useState<EnquiryErrors>({})
  const [busy, setBusy] = useState(false)

  const set = (key: keyof EnquiryValues) => (event: { target: { value: string } }) => {
    // Immutable update, and the field's error clears as soon as it is touched —
    // leaving a red message under a field somebody is actively fixing is what
    // makes forms feel hostile.
    setValues((prev) => ({ ...prev, [key]: event.target.value }))
    setErrors((prev) => (key in prev ? { ...prev, [key]: undefined } : prev))
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    try {
      const result = await submitEnquiry(values)
      if (!result.ok) {
        setErrors(result.errors)
        return
      }
      setErrors({})
      window.open(result.href, '_blank', 'noopener,noreferrer')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Section id="contact" ref={ref}>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
        <div>
          <Eyebrow>{CONTENT.contact.eyebrow}</Eyebrow>
          <SectionTitle>{CONTENT.contact.title}</SectionTitle>
          <Lede>{CONTENT.contact.lede}</Lede>

          <dl className="reveal mt-10 space-y-5 border-t border-line/60 pt-8">
            <Direct label="Hyderabad desk" value={SITE.phoneDisplay} href={`tel:${SITE.phone}`} />
            {SITE.phoneAlt ? (
              <Direct
                label="Balaji Prefab line"
                value={SITE.phoneAltDisplay}
                href={`tel:${SITE.phoneAlt}`}
              />
            ) : null}
            <Direct label="Email" value={SITE.email} href={`mailto:${SITE.email}`} />
            {/* Second address only while there is one, like the second phone line. */}
            {SITE.emailAlt ? (
              <Direct label="Email (alt)" value={SITE.emailAlt} href={`mailto:${SITE.emailAlt}`} />
            ) : null}
          </dl>
        </div>

        <form onSubmit={onSubmit} className="reveal" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="name"
              label="Your name"
              value={values.name}
              onChange={set('name')}
              error={errors.name}
              autoComplete="name"
              required
            />
            <Field
              id="phone"
              label="Phone"
              type="tel"
              value={values.phone}
              onChange={set('phone')}
              error={errors.phone}
              autoComplete="tel"
              inputMode="tel"
              required
            />
            <Field
              id="email"
              label="Email"
              type="email"
              value={values.email}
              onChange={set('email')}
              error={errors.email}
              autoComplete="email"
              inputMode="email"
              hint="Optional"
            />
            <Field
              id="date"
              label="Needed by"
              value={values.date ?? ''}
              onChange={set('date')}
              error={errors.date}
              hint="Optional — a month is enough"
            />
          </div>

          <Field
            id="message"
            label="Span, area and what it is for"
            textarea
            value={values.message ?? ''}
            onChange={set('message')}
            error={errors.message}
            hint="e.g. 24 m × 60 m warehouse, Medchal, 60 mm PUF walls"
            className="mt-5"
          />

          <button
            type="submit"
            disabled={busy}
            className="tap-44 mt-7 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-accent px-7 py-4 text-[0.84rem] font-semibold tracking-[0.04em] text-ground transition-all duration-300 ease-micro hover:bg-accent-glow hover:shadow-[0_10px_24px_-10px_rgba(0,84,168,0.55)] disabled:opacity-60 sm:w-auto"
          >
            {busy ? 'Opening WhatsApp…' : 'Send on WhatsApp'}
            <svg
              viewBox="0 0 24 24"
              className="size-3.5"
              fill="none"
              stroke="currentColor"
              aria-hidden
            >
              <path d="M4 12h15m0 0-6-6m6 6-6 6" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          <p className="mt-4 text-[0.78rem] leading-relaxed text-body">
            Nothing is stored in the browser. The button opens WhatsApp with these details written
            out, so you can read them before sending.
          </p>
        </form>
      </div>
    </Section>
  )
}

function Direct({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
      <dt className="tech-sm text-body">{label}</dt>
      <dd>
        <a
          href={href}
          className="text-[1rem] text-heading transition-colors duration-200 ease-micro hover:text-accent"
        >
          {value}
        </a>
      </dd>
    </div>
  )
}

type FieldProps = {
  id: string
  label: string
  value: string
  onChange: (event: { target: { value: string } }) => void
  error?: string
  hint?: string
  type?: string
  textarea?: boolean
  required?: boolean
  autoComplete?: string
  inputMode?: 'tel' | 'email' | 'text'
  className?: string
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  type = 'text',
  textarea,
  required,
  autoComplete,
  inputMode,
  className = '',
}: FieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  const shared = `mt-2.5 w-full rounded-xl border bg-raised/50 px-4 py-3.5 text-[0.95rem] text-heading transition-colors duration-200 ease-micro placeholder:text-body/50 focus:outline-none ${
    error ? 'border-alert' : 'border-line focus:border-accent'
  }`

  return (
    <div className={className}>
      <label htmlFor={id} className="tech-sm text-body">
        {label}
        {!required && hint === 'Optional' ? <span className="text-body"> · optional</span> : null}
      </label>

      {textarea ? (
        <textarea
          id={id}
          rows={4}
          value={value}
          onChange={onChange}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${shared} resize-y`}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={shared}
        />
      )}

      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-2 text-[0.78rem] text-alert">
          {error}
        </p>
      ) : hint && hint !== 'Optional' ? (
        <p id={`${id}-hint`} className="mt-2 text-[0.78rem] text-body">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
