import { useCallback, useEffect, useRef, useState } from 'react'

type Kind = 'success' | 'error'

// SC-00-R4: a short message after an action; success messages fade, errors stay until the next action
export function useNotice() {
  const [notice, setNotice] = useState<{ text: string; kind: Kind } | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const show = useCallback((text: string, kind: Kind = 'success') => {
    window.clearTimeout(timer.current)
    setNotice({ text, kind })
    if (kind === 'success') timer.current = window.setTimeout(() => setNotice(null), 3000)
  }, [])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const clear = useCallback(() => setNotice(null), [])
  const element = notice && <div className={`notice ${notice.kind}`} role="status">{notice.text}</div>
  return { show, clear, element }
}
