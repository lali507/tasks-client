import { NavLink, Outlet, useNavigate } from 'react-router'
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
        <nav>
          {user && links[user.role].map((link) => (
            <NavLink key={link.to} to={link.to} end>{link.label}</NavLink>
          ))}
        </nav>
        {user && (
          <div className="user">
            <span>שלום, {user.displayName}</span>
            <button type="button" className="link" onClick={logout}>התנתקות</button>
          </div>
        )}
      </header>
      <main className="page">
        <Outlet />
      </main>
    </>
  )
}
