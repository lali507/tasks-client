import type { InputHTMLAttributes } from 'react'

// A labeled input with its error under it (GN-03-R3: the server's message next to each field)
export function Field({ label, error, hint, ...input }: InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: string
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...input} aria-invalid={!!error} />
      {hint && <span className="hint">{hint}</span>}
      {error && <span className="error">{error}</span>}
    </label>
  )
}
