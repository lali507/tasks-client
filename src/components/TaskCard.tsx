import type { ReactNode } from 'react'
import type { Status, TaskResponse } from '../api/types'

export const statusText: Record<Status, string> = { Open: 'פתוחה', Taken: 'נלקחה', Done: 'הושלמה' }

const date = (iso: string) => new Date(iso).toLocaleDateString('he-IL')

// SC-03: title, project, status, who took it, labels, creation date
export function TaskCard({ task, children }: { task: TaskResponse; children?: ReactNode }) {
  // FN-MB-02-R1: a Done task without a taker belonged to a deleted user
  const taker = task.takenByDisplayName ?? (task.status === 'Done' ? 'משתמש שנמחק' : null)
  return (
    <article className="card task-card">
      <header>
        <div>
          <div className="project">{task.projectName}</div>
          <h3>{task.title}</h3>
        </div>
        <span className={`chip ${task.status}`}>{statusText[task.status]}</span>
      </header>
      {task.description && <p>{task.description}</p>}
      {task.labels.length > 0 && (
        <div className="labels">{task.labels.map((l) => <span key={l.id} className="label">{l.name}</span>)}</div>
      )}
      <div className="meta">
        {taker && <span>לקח/ה: <strong>{taker}</strong></span>}
        <span>נוצרה {date(task.createdAt)}</span>
        {task.completedAt && <span>הושלמה {date(task.completedAt)}</span>}
      </div>
      {children && <footer>{children}</footer>}
    </article>
  )
}

// While the first page loads
export function TaskSkeletons() {
  return <>{[1, 2, 3].map((i) => <div key={i} className="skeleton" />)}</>
}
