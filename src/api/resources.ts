import { ApiError, FORBIDDEN, GENERIC_ERROR, api, query } from './client'
import type { LabelResponse, PagedResponse, ProjectResponse, Status, TaskRequest, TaskResponse } from './types'

export const PAGE_SIZE = 10
// SC-00-R7: selection lists load one page of the largest size (GN-02)
export const MAX_PAGE_SIZE = 50

export const tasksApi = {
  list: (params: { page: number; status?: Status | ''; projectId?: number | ''; mine?: boolean }) =>
    api.get<PagedResponse<TaskResponse>>(`/api/tasks${query({ ...params, mine: params.mine || undefined, pageSize: PAGE_SIZE })}`),
  create: (body: TaskRequest) => api.post<TaskResponse>('/api/tasks', body),
  update: (id: number, body: TaskRequest) => api.put<TaskResponse>(`/api/tasks/${id}`, body),
  remove: (id: number) => api.delete(`/api/tasks/${id}`),
  take: (id: number) => api.put<TaskResponse>(`/api/tasks/${id}/assignee`),
  complete: (id: number) => api.put<TaskResponse>(`/api/tasks/${id}/completion`),
}

export const projectsApi = {
  list: (page: number, pageSize = PAGE_SIZE) => api.get<PagedResponse<ProjectResponse>>(`/api/projects${query({ page, pageSize })}`),
  forSelect: async () => (await projectsApi.list(1, MAX_PAGE_SIZE)).items,
}

export const labelsApi = {
  list: () => api.get<LabelResponse[]>('/api/labels'),
}

// SC-00-R5: the message for a failed action – the server's title (GN-07-R3), or the screen's own wording where it has one.
// 500 and no connection already carry "אירעה שגיאה, נסה שוב" (client.ts).
export const messageFor = (error: unknown, byStatus: Partial<Record<number, string>> = {}) => {
  if (!(error instanceof ApiError)) return GENERIC_ERROR
  return byStatus[error.status] ?? (error.status === 403 ? error.message || FORBIDDEN : error.message)
}
