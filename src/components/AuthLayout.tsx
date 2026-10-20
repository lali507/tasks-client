import type { ReactNode } from 'react'

// SC-01, SC-02: the form beside a short welcome panel (hidden on small screens)
export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="auth">
      <section className="auth-hero">
        <h2>כל המשימות של הצוות, במקום אחד</h2>
        <p>לוקחים משימה, מסמנים כשמסיימים, ותמיד יודעים מה פתוח ומי עובד על מה.</p>
        <ul>
          <li>סינון לפי פרויקט וסטטוס</li>
          <li>משימה נלקחת על ידי אדם אחד בלבד</li>
          <li>ניהול פרויקטים, תוויות ומשתמשים</li>
        </ul>
      </section>
      <section className="auth-panel">
        <div className="card auth-card">
          <h1>{title}</h1>
          <p className="sub">{subtitle}</p>
          {children}
        </div>
      </section>
    </main>
  )
}
