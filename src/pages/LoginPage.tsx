import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { login, looksLikeEmail } from '../api/auth'
import { ApiError, GENERIC_ERROR } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { Field } from '../components/Field'

// SC-01
export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    // SC-01-R1
    const local = {
      email: !email.trim() ? 'שדה חובה' : !looksLikeEmail(email) ? 'פורמט אימייל לא תקין' : undefined,
      password: !password ? 'שדה חובה' : undefined,
    }
    setErrors(local)
    if (local.email || local.password) return

    setBusy(true)
    try {
      signIn(await login(email, password))
      navigate('/tasks')
    } catch (error) {
      // 400 next to each field; 401 "אימייל או סיסמה שגויים"; 500 or no connection – generic
      const e = error instanceof ApiError ? error : new ApiError(0, GENERIC_ERROR)
      setErrors(e.status === 400
        ? { email: e.field('email'), password: e.field('password') }
        : { form: e.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="center card">
      <h1>התחברות</h1>
      <form className="form" onSubmit={submit} noValidate>
        <Field label="אימייל" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <Field label="סיסמה" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        {errors.form && <div className="form-error" role="alert">{errors.form}</div>}
        <button type="submit" disabled={busy}>התחברות</button>
        <span>אין לך חשבון? <Link to="/register">הרשמה</Link></span>
      </form>
    </div>
  )
}
