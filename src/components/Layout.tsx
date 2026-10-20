import type { ReactNode } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { useAuth } from '../auth/AuthContext'

// SC-00-R1: the top menu by Role. Hiding is display only; the server enforces 401/403.
const links = {
  Member: [
    { to: '/tasks', label: 'משימות' },
    { to: '/my-tasks', label: 'המשימות שלי' },
  ],
  Admin: [
    { to: '/tasks', label: 'משימות' },
    { to: '/admin/projects', label: 'פרויקטים' },
    { to: '/admin/labels', label: 'תוויות' },
    { to: '/admin/users', label: 'משתמשים' },
  ],
}

const roleText = { Admin: 'מנהל/ת', Member: 'חבר/ת צוות' }

export function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  // SC-01-R2: logout clears the token and goes back to login
  const logout = () => {
    signOut()
    navigate('/login')
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/tasks" className="brand">
            <span className="brand-mark" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            </span>
            <span>ניהול משימות</span>
          </Link>
          <nav>
            {user && links[user.role].map((link) => (
              <NavLink key={link.to} to={link.to} end>{link.label}</NavLink>
            ))}
          </nav>
          {user && (
            <div className="user-chip">
              <span className="avatar" aria-hidden="true">{user.displayName.trim().charAt(0)}</span>
              <span className="who">
                <span>שלום, {user.displayName}</span>
                <small>{roleText[user.role]}</small>
              </span>
              <button type="button" className="ghost small" onClick={logout}>התנתקות</button>
            </div>
          )}
        </div>
      </header>
      <Outlet />
    </>
  )
}

// The common page frame: title, a line under it, and the main action on the other side
export function Page({ title, subtitle, action, children }: {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <main className="page">
      <div className="page-head">
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </main>
  )
}
