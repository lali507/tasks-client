import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { messageFor, projectsApi } from '../api/resources'
import type { PagedResponse, ProjectResponse } from '../api/types'
import { Field } from '../components/Field'
import { Page } from '../components/Layout'
import { Modal } from '../components/Modal'
import { useNotice } from '../components/Notice'
import { Pager } from '../components/Pager'
import { useFormSubmit } from '../components/useFormSubmit'

const notFound = 'הפרויקט כבר לא קיים'

// SC-05
export function ProjectsPage() {
  const [page, setPage] = useState(1)
  const [data, setData] = useState<PagedResponse<ProjectResponse> | null>(null)
  const [editing, setEditing] = useState<ProjectResponse | 'new' | null>(null)
  const notice = useNotice()

  const load = useCallback(async () => {
    try {
      setData(await projectsApi.list(page))
    } catch (error) {
      notice.show(messageFor(error), 'error')
    }
  }, [page, notice.show])

  useEffect(() => { void load() }, [load])

  // SC-00-R4: reload and confirm after every successful action
  const saved = async (text: string) => {
    setEditing(null)
    notice.show(text)
    await load()
  }

  // SC-00-R6; 409 "לא ניתן למחוק פרויקט שיש בו משימות" is the server's title
  const remove = async (project: ProjectResponse) => {
    if (!window.confirm(`האם למחוק את הפרויקט "${project.name}"?`)) return
    try {
      await projectsApi.remove(project.id)
      notice.show('הפרויקט נמחק')
    } catch (error) {
      notice.show(messageFor(error, { 404: notFound }), 'error')
    }
    await load()
  }

  return (
    <Page title="ניהול פרויקטים" subtitle="לחיצה על שם פרויקט מציגה את המשימות שלו"
      action={<button type="button" onClick={() => setEditing('new')}>+ פרויקט חדש</button>}>
      {notice.element}
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>שם</th><th>תיאור</th><th>משימות</th><th /></tr>
          </thead>
          <tbody>
            {data?.items.map((project) => (
              <tr key={project.id}>
                <td><Link to={`/tasks?projectId=${project.id}`}><strong>{project.name}</strong></Link></td>
                <td className="muted">{project.description ?? '—'}</td>
                <td><span className="count-badge">{project.taskCount}</span></td>
                <td>
                  <div className="actions">
                    <button type="button" className="secondary small" onClick={() => setEditing(project)}>עריכה</button>
                    <button type="button" className="danger small" onClick={() => void remove(project)}>מחיקה</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && data.items.length === 0 && <div className="empty flat"><strong>אין פרויקטים</strong>אפשר ליצור פרויקט חדש</div>}
      </div>
      {data && <Pager page={page} pageSize={data.pageSize} totalCount={data.totalCount} onChange={setPage} />}

      {editing && (
        <ProjectForm project={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)}
          onSaved={() => saved(editing === 'new' ? 'הפרויקט נוצר' : 'הפרויקט עודכן')} />
      )}
    </Page>
  )
}

function ProjectForm({ project, onClose, onSaved }: { project?: ProjectResponse; onClose: () => void; onSaved: () => Promise<void> }) {
  const [name, setName] = useState(project?.name ?? '')
  const [description, setDescription] = useState(project?.description ?? '')
  // 409 "שם הפרויקט כבר קיים" is the server's title
  const { errors, busy, submit } = useFormSubmit(['name', 'description'], { 404: notFound })

  const onSubmit = submit(
    () => ({ name: !name.trim() ? 'שדה חובה' : undefined }),
    async () => {
      const body = { name, description: description || null }
      await (project ? projectsApi.update(project.id, body) : projectsApi.create(body))
      await onSaved()
    })

  return (
    <Modal title={project ? 'עריכת פרויקט' : 'פרויקט חדש'} onClose={onClose}>
      <form className="form" onSubmit={onSubmit} noValidate>
        <Field label="שם" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} autoFocus />
        <label className="field">
          <span>תיאור</span>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          {errors.description && <span className="error">{errors.description}</span>}
        </label>
        {errors.form && <div className="form-error" role="alert">{errors.form}</div>}
        <div className="actions">
          <button type="submit" disabled={busy}>{busy ? 'שומרים…' : 'שמירה'}</button>
          <button type="button" className="secondary" onClick={onClose}>ביטול</button>
        </div>
      </form>
    </Modal>
  )
}
