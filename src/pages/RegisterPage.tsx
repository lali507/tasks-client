import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { looksLikeEmail, register } from '../api/auth'
import { ApiError, GENERIC_ERROR } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { Field } from '../components/Field'

// SC-02
export function RegisterPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', displayName: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [busy, setBusy] = useState(false)

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value })

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    // SC-01-R1 basic checks; SC-02-R1: the confirmation is checked here only and never sent
    const local = {
      email: !form.email.trim() ? 'שדה חובה' : !looksLikeEmail(form.email) ? 'פורמט אימייל לא תקין' : undefined,
      displayName: !form.displayName.trim() ? 'שדה חובה' : undefined,
      password: !form.password ? 'שדה חובה' : undefined,
      confirm: form.password !== form.confirm ? 'הסיסמאות אינן זהות' : undefined,
    }
    setErrors(local)
    if (Object.values(local).some(Boolean)) return

    setBusy(true)
    try {
      // 201: logged in right away
      signIn(await register(form.email, form.displayName, form.password))
      navigate('/tasks')
    } catch (error) {
      // 400 next to each field; 409 "האימייל כבר רשום"; 500 or no connection – generic
      const e = error instanceof ApiError ? error : new ApiError(0, GENERIC_ERROR)
      setErrors(e.status === 400
        ? { email: e.field('email'), displayName: e.field('displayName'), password: e.field('password') }
        : e.status === 409 ? { email: e.message } : { form: e.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="center card">
      <h1>הרשמה</h1>
      <form className="form" onSubmit={submit} noValidate>
        <Field label="אימייל" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
        <Field label="שם תצוגה" autoComplete="name" value={form.displayName} onChange={set('displayName')} error={errors.displayName} />
        <Field label="סיסמה" type="password" autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password}
          hint="8–64 תווים, לפחות אות אחת וספרה אחת" />
        <Field label="אימות סיסמה" type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
        {errors.form && <div className="form-error" role="alert">{errors.form}</div>}
        <button type="submit" disabled={busy}>הרשמה</button>
        <span>יש לך חשבון? <Link to="/login">התחברות</Link></span>
      </form>
    </div>
  )
}
