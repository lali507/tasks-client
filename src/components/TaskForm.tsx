import { useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import { messageFor } from '../api/resources'
import type { LabelResponse, ProjectResponse, TaskRequest, TaskResponse } from '../api/types'
import { Field } from './Field'

// SC-03 (Admin): title, description, project and labels
export function TaskForm({ task, projects, labels, onSave, onCancel }: {
  task?: TaskResponse
  projects: ProjectResponse[]
  labels: LabelResponse[]
  onSave: (body: TaskRequest) => Promise<unknown>
  onCancel: () => void
}) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [projectId, setProjectId] = useState<number | ''>(task?.projectId ?? '')
  const [labelIds, setLabelIds] = useState<number[]>(task?.labels.map((l) => l.id) ?? [])
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [busy, setBusy] = useState(false)

  const toggle = (id: number) => setLabelIds((ids) => ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const local = { title: !title.trim() ? 'שדה חובה' : undefined, projectId: projectId === '' ? 'שדה חובה' : undefined }
    setErrors(local)
    if (local.title || local.projectId) return

    setBusy(true)
    try {
      await onSave({ title, description: description || null, projectId: projectId as number, labelIds })
    } catch (error) {
      // 400 next to each field; 409 on edit: "המשימה השתנתה, טען מחדש" / "לא ניתן לעדכן משימה שהושלמה"
      setErrors(error instanceof ApiError && error.status === 400
        ? { title: error.field('title'), description: error.field('description'), projectId: error.field('projectId'), labelIds: error.field('labelIds') }
        : { form: messageFor(error, { 404: 'המשימה כבר לא קיימת' }) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="card form form-card" onSubmit={submit} noValidate>
      <h2>{task ? 'עריכת משימה' : 'משימה חדשה'}</h2>
      <div className="form-grid">
        <Field label="כותרת" value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title} />
        <label className="field">
          <span>פרויקט</span>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : '')} aria-invalid={!!errors.projectId}>
            <option value="">בחרי פרויקט</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {errors.projectId && <span className="error">{errors.projectId}</span>}
        </label>
        <label className="field full">
          <span>תיאור</span>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          {errors.description && <span className="error">{errors.description}</span>}
        </label>
        <fieldset className="field full">
          <span>תוויות</span>
          <div className="checks">
            {labels.map((l) => (
              <label key={l.id} className="check-pill"><input type="checkbox" checked={labelIds.includes(l.id)} onChange={() => toggle(l.id)} /> {l.name}</label>
            ))}
          </div>
          {errors.labelIds && <span className="error">{errors.labelIds}</span>}
        </fieldset>
      </div>
      {errors.form && <div className="form-error" role="alert">{errors.form}</div>}
      <div className="actions">
        <button type="submit" disabled={busy}>{busy ? 'שומרים…' : 'שמירה'}</button>
        <button type="button" className="secondary" onClick={onCancel}>ביטול</button>
      </div>
    </form>
  )
}
