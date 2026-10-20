import { useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import { messageFor } from '../api/resources'

type Errors = Record<string, string | undefined>

// The shared part of every admin form: local checks first, then the request;
// a 400 puts the server's message next to each field (GN-03-R3), anything else goes on top of the form (SC-00-R5)
export function useFormSubmit(fields: string[], byStatus: Partial<Record<number, string>> = {}) {
  const [errors, setErrors] = useState<Errors>({})
  const [busy, setBusy] = useState(false)

  const submit = (check: () => Errors, save: () => Promise<unknown>) => async (event: FormEvent) => {
    event.preventDefault()
    const local = check()
    setErrors(local)
    if (Object.values(local).some(Boolean)) return

    setBusy(true)
    try {
      await save()
    } catch (error) {
      setErrors(error instanceof ApiError && error.status === 400
        ? Object.fromEntries(fields.map((f) => [f, error.field(f)]))
        : { form: messageFor(error, byStatus) })
    } finally {
      setBusy(false)
    }
  }

  return { errors, busy, submit }
}
