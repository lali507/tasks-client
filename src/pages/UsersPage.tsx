import { useCallback, useEffect, useState } from 'react'
import { looksLikeEmail } from '../api/auth'
import { messageFor, usersApi } from '../api/resources'
import type { PagedResponse, UserResponse } from '../api/types'
import { Field } from '../components/Field'
import { Page } from '../components/Layout'
import { Modal } from '../components/Modal'
import { useNotice } from '../components/Notice'
import { Pager } from '../components/Pager'
import { useFormSubmit } from '../components/useFormSubmit'

const notFound = 'המשתמש כבר לא קיים'
const roleText = { Admin: 'מנהל/ת', Member: 'חבר/ת צוות' }

// SC-07
export function UsersPage() {
  const [page, setPage] = useState(1)
  const [data, setData] = useState<PagedResponse<UserResponse> | null>(null)
  const [editing, setEditing] = useState<UserResponse | 'new' | null>(null)
  const notice = useNotice()

  const load = useCallback(async () => {
    try {
      setData(await usersApi.list(page))
    } catch (error) {
      notice.show(messageFor(error), 'error')
    }
  }, [page, notice.show])

  useEffect(() => { void load() }, [load])

  const saved = async (text: string) => {
    setEditing(null)
    notice.show(text)
    await load()
  }

  // SC-00-R6; 409 "למשתמש יש משימה פעילה" is the server's title
  const remove = async (user: UserResponse) => {
    if (!window.confirm(`האם למחוק את ${user.displayName}?`)) return
    try {
      await usersApi.remove(user.id)
      notice.show('המשתמש נמחק')
    } catch (error) {
      notice.show(messageFor(error, { 404: notFound }), 'error')
    }
    await load()
  }

  return (
    <Page title="ניהול משתמשים" subtitle="המשתמשים שנוספים כאן הם תמיד חברי צוות"
      action={<button type="button" onClick={() => setEditing('new')}>+ משתמש חדש</button>}>
      {notice.element}
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>שם תצוגה</th><th>אימייל</th><th>תפקיד</th><th>נוצר</th><th /></tr>
          </thead>
          <tbody>
            {data?.items.map((user) => (
              <tr key={user.id}>
                <td>
                  <span className="person">
                    <span className="avatar small" aria-hidden="true">{user.displayName.trim().charAt(0)}</span>
                    <strong>{user.displayName}</strong>
                  </span>
                </td>
                <td dir="ltr" className="ltr">{user.email}</td>
                <td><span className={`role ${user.role}`}>{roleText[user.role]}</span></td>
                <td className="muted">{new Date(user.createdAt).toLocaleDateString('he-IL')}</td>
                <td>
                  {/* UM-03: no edit or delete on the Admin row */}
                  {user.role !== 'Admin' && (
                    <div className="actions">
                      <button type="button" className="secondary small" onClick={() => setEditing(user)}>עריכה</button>
                      <button type="button" className="danger small" onClick={() => void remove(user)}>מחיקה</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data && <Pager page={page} pageSize={data.pageSize} totalCount={data.totalCount} onChange={setPage} />}

      {editing && (
        <UserForm user={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)}
          onSaved={() => saved(editing === 'new' ? 'המשתמש נוסף' : 'המשתמש עודכן')} />
      )}
    </Page>
  )
}

function UserForm({ user, onClose, onSaved }: { user?: UserResponse; onClose: () => void; onSaved: () => Promise<void> }) {
  const [email, setEmail] = useState(user?.email ?? '')
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [password, setPassword] = useState('')
  // 409 "האימייל כבר רשום" is the server's title
  const { errors, busy, submit } = useFormSubmit(['email', 'displayName', 'password', 'newPassword'], { 404: notFound })

  const onSubmit = submit(
    () => ({
      email: !email.trim() ? 'שדה חובה' : !looksLikeEmail(email) ? 'פורמט אימייל לא תקין' : undefined,
      displayName: !displayName.trim() ? 'שדה חובה' : undefined,
      // A new user needs a password; on edit it is optional
      password: !user && !password ? 'שדה חובה' : undefined,
    }),
    async () => {
      await (user
        ? usersApi.update(user.id, { email, displayName, newPassword: password || null })
        : usersApi.create({ email, displayName, password }))
      await onSaved()
    })

  return (
    <Modal title={user ? 'עריכת משתמש' : 'משתמש חדש'} onClose={onClose}>
      <form className="form" onSubmit={onSubmit} noValidate>
        <Field label="אימייל" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} autoFocus />
        <Field label="שם תצוגה" value={displayName} onChange={(e) => setDisplayName(e.target.value)} error={errors.displayName} />
        <Field label={user ? 'סיסמה חדשה (רשות)' : 'סיסמה'} type="password" autoComplete="new-password"
          value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password ?? errors.newPassword}
          hint={user ? 'להשאיר ריק כדי לא לשנות' : '8–64 תווים, לפחות אות אחת וספרה אחת'} />
        {errors.form && <div className="form-error" role="alert">{errors.form}</div>}
        <div className="actions">
          <button type="submit" disabled={busy}>{busy ? 'שומרים…' : 'שמירה'}</button>
          <button type="button" className="secondary" onClick={onClose}>ביטול</button>
        </div>
      </form>
    </Modal>
  )
}
