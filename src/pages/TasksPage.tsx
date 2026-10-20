import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { labelsApi, messageFor, projectsApi, tasksApi } from '../api/resources'
import type { LabelResponse, PagedResponse, ProjectResponse, Status, TaskRequest, TaskResponse } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { Page } from '../components/Layout'
import { Modal } from '../components/Modal'
import { useNotice } from '../components/Notice'
import { Pager } from '../components/Pager'
import { TaskCard, TaskSkeletons, statusText } from '../components/TaskCard'
import { TaskForm } from '../components/TaskForm'

// SC-03: the filters live in the address, so "projects -> click a name" opens this screen filtered (SC-05)
export function TasksPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'Admin'
  const [params, setParams] = useSearchParams()
  const status = (params.get('status') ?? '') as Status | ''
  const projectId = params.get('projectId') ? Number(params.get('projectId')) : ''
  const page = Number(params.get('page') ?? 1)

  const [data, setData] = useState<PagedResponse<TaskResponse> | null>(null)
  const [projects, setProjects] = useState<ProjectResponse[]>([])
  const [labels, setLabels] = useState<LabelResponse[]>([])
  const [editing, setEditing] = useState<TaskResponse | 'new' | null>(null)
  const notice = useNotice()

  const setFilter = (key: string, value: string | number) => {
    const next = new URLSearchParams(params)
    if (value === '' || (key === 'page' && value === 1)) next.delete(key)
    else next.set(key, String(value))
    if (key !== 'page') next.delete('page')
    setParams(next)
  }

  const load = useCallback(async () => {
    try {
      setData(await tasksApi.list({ page, status, projectId }))
    } catch (error) {
      notice.show(messageFor(error), 'error')
    }
  }, [page, status, projectId, notice.show])

  useEffect(() => { void load() }, [load])

  // Selection lists for the filter and the form (SC-00-R7)
  useEffect(() => {
    projectsApi.forSelect().then(setProjects).catch(() => {})
    labelsApi.list().then(setLabels).catch(() => {})
  }, [])

  // SC-00-R4: after a successful action, reload and say so
  const act = async (action: () => Promise<unknown>, success: string, byStatus: Partial<Record<number, string>> = {}) => {
    try {
      await action()
      notice.show(success)
    } catch (error) {
      notice.show(messageFor(error, byStatus), 'error')
    }
    await load()
  }

  const take = (task: TaskResponse) =>
    act(() => tasksApi.take(task.id), 'המשימה נלקחה', { 409: 'המשימה כבר נלקחה ע"י משתמש אחר', 404: 'המשימה כבר לא קיימת' })

  // SC-00-R6
  const remove = (task: TaskResponse) => {
    if (window.confirm('האם למחוק?'))
      void act(() => tasksApi.remove(task.id), 'המשימה נמחקה', { 404: 'המשימה כבר לא קיימת' })
  }

  const save = async (body: TaskRequest) => {
    await (editing === 'new' ? tasksApi.create(body) : tasksApi.update((editing as TaskResponse).id, body))
    setEditing(null)
    notice.show(editing === 'new' ? 'המשימה נוצרה' : 'המשימה עודכנה')
    await load()
  }

  return (
    <Page title="משימות" subtitle={isAdmin ? 'יצירה, עריכה ומחיקה של משימות הצוות' : 'בחרו משימה פתוחה וקחו אותה'}
      action={isAdmin && <button type="button" onClick={() => setEditing('new')}>+ משימה חדשה</button>}>
      {notice.element}

      <div className="toolbar">
        <label className="field">
          <span>סטטוס</span>
          <select value={status} onChange={(e) => setFilter('status', e.target.value)}>
            <option value="">הכול</option>
            {(Object.keys(statusText) as Status[]).map((s) => <option key={s} value={s}>{statusText[s]}</option>)}
          </select>
        </label>
        <label className="field">
          <span>פרויקט</span>
          <select value={projectId} onChange={(e) => setFilter('projectId', e.target.value)}>
            <option value="">כל הפרויקטים</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        {data && <span className="count">{data.totalCount} משימות</span>}
      </div>

      {editing && (
        <Modal title={editing === 'new' ? 'משימה חדשה' : 'עריכת משימה'} onClose={() => setEditing(null)}>
          <TaskForm task={editing === 'new' ? undefined : editing}
            projects={projects} labels={labels} onSave={save} onCancel={() => setEditing(null)} />
        </Modal>
      )}

      <div className="tasks">
        {data?.items.map((task) => (
          <TaskCard key={task.id} task={task}>
            {!isAdmin && task.status === 'Open' && <button type="button" className="small" onClick={() => void take(task)}>קחי משימה</button>}
            {isAdmin && task.status !== 'Done' && <button type="button" className="secondary small" onClick={() => setEditing(task)}>עריכה</button>}
            {isAdmin && task.status !== 'Taken' && <button type="button" className="danger small" onClick={() => remove(task)}>מחיקה</button>}
          </TaskCard>
        ))}
        {!data && <TaskSkeletons />}
        {data && data.items.length === 0 && <div className="empty"><strong>אין משימות</strong>נסו לשנות את הסינון</div>}
      </div>
      {data && <Pager page={page} pageSize={data.pageSize} totalCount={data.totalCount} onChange={(p) => setFilter('page', p)} />}
    </Page>
  )
}
