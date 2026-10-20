import { useCallback, useEffect, useState } from 'react'
import { messageFor, tasksApi } from '../api/resources'
import type { PagedResponse, TaskResponse } from '../api/types'
import { Page } from '../components/Layout'
import { useNotice } from '../components/Notice'
import { Pager } from '../components/Pager'
import { TaskCard, TaskSkeletons } from '../components/TaskCard'

// SC-04: the tasks the Member took (Taken and Done)
export function MyTasksPage() {
  const [page, setPage] = useState(1)
  const [data, setData] = useState<PagedResponse<TaskResponse> | null>(null)
  const notice = useNotice()

  const load = useCallback(async () => {
    try {
      setData(await tasksApi.list({ page, mine: true }))
    } catch (error) {
      notice.show(messageFor(error), 'error')
    }
  }, [page, notice.show])

  useEffect(() => { void load() }, [load])

  // 409 "ניתן לסמן רק משימה שנלקחה" and 403 "רק מי שלקח יכול לסמן" are the server's titles
  const complete = async (task: TaskResponse) => {
    try {
      await tasksApi.complete(task.id)
      notice.show('המשימה סומנה כהושלמה')
    } catch (error) {
      notice.show(messageFor(error, { 404: 'המשימה כבר לא קיימת' }), 'error')
    }
    await load()
  }

  return (
    <Page title="המשימות שלי" subtitle="משימות שלקחת – סמנו כהושלמה כשמסיימים">
      {notice.element}
      <div className="tasks">
        {data?.items.map((task) => (
          <TaskCard key={task.id} task={task}>
            {task.status === 'Taken' && <button type="button" className="success small" onClick={() => void complete(task)}>✓ סמן כהושלמה</button>}
          </TaskCard>
        ))}
        {!data && <TaskSkeletons />}
        {data && data.items.length === 0 && <div className="empty"><strong>עוד לא לקחת משימות</strong>אפשר לקחת משימה פתוחה במסך "משימות"</div>}
      </div>
      {data && <Pager page={page} pageSize={data.pageSize} totalCount={data.totalCount} onChange={setPage} />}
    </Page>
  )
}
