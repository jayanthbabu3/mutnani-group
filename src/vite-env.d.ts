/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional POST target that mirrors enquiries — Formspree, Apps Script, etc. */
  readonly VITE_ENQUIRY_ENDPOINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
