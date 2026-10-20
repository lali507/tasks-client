// One place for every request: the API address from the build (SC-00-R8), the token (SC-01-R2), and ProblemDetails errors (GN-03)

const baseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, '')
const tokenKey = 'auth'

// SC-00-R5
export const GENERIC_ERROR = 'אירעה שגיאה, נסה שוב'
export const FORBIDDEN = 'אין לך הרשאה לפעולה זו'

// The error the screens get: status, the server's title, and errors per field on 400
export class ApiError extends Error {
  readonly status: number
  readonly errors: Record<string, string[]>

  constructor(status: number, title: string, errors: Record<string, string[]> = {}) {
    super(title)
    this.status = status
    this.errors = errors
  }

  // The message for one field, matched case-insensitively ("Email" on the server, "email" in the form)
  field(name: string): string | undefined {
    const key = Object.keys(this.errors).find((k) => k.toLowerCase() === name.toLowerCase())
    return key ? this.errors[key][0] : undefined
  }
}

// SC-01-R3: any 401 logs out; AuthProvider listens
const unauthorizedEvent = 'api:unauthorized'
export const onUnauthorized = (handler: () => void) => {
  window.addEventListener(unauthorizedEvent, handler)
  return () => window.removeEventListener(unauthorizedEvent, handler)
}

export const storedToken = (): string | null => {
  try {
    return (JSON.parse(localStorage.getItem(tokenKey) ?? 'null') as { token?: string } | null)?.token ?? null
  } catch {
    return null
  }
}

export const authStorageKey = tokenKey

export async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {}
  const token = storedToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let response: Response
  try {
    response = await fetch(baseUrl + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  } catch {
    // No connection (SC-00-R5)
    throw new ApiError(0, GENERIC_ERROR)
  }

  // A wrong password on login is a 401 too, but it is answered on the login screen, not by logging out
  if (response.status === 401 && token) window.dispatchEvent(new Event(unauthorizedEvent))

  if (!response.ok) {
    const problem = await response.json().catch(() => null) as { title?: string; errors?: Record<string, string[]> } | null
    const title = response.status >= 500 || !problem?.title ? GENERIC_ERROR : problem.title
    throw new ApiError(response.status, title, problem?.errors ?? {})
  }

  return (response.status === 204 ? undefined : await response.json()) as T
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  delete: (path: string) => request<void>('DELETE', path),
}

// Builds "?page=2&status=Open", skipping empty values
export const query = (params: Record<string, string | number | boolean | undefined | null>) => {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params))
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value))
  const text = search.toString()
  return text ? `?${text}` : ''
}
