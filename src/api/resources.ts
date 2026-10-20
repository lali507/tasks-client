import { ApiError, FORBIDDEN, GENERIC_ERROR, api, query } from './client'
import type { LabelResponse, PagedResponse, ProjectResponse, Status, TaskRequest, TaskResponse, UserResponse } from './types'

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

export interface ProjectBody { name: string; description: string | null }

export const projectsApi = {
  list: (page: number, pageSize = PAGE_SIZE) => api.get<PagedResponse<ProjectResponse>>(`/api/projects${query({ page, pageSize })}`),
  forSelect: async () => (await projectsApi.list(1, MAX_PAGE_SIZE)).items,
  create: (body: ProjectBody) => api.post<ProjectResponse>('/api/projects', body),
  update: (id: number, body: ProjectBody) => api.put<ProjectResponse>(`/api/projects/${id}`, body),
  remove: (id: number) => api.delete(`/api/projects/${id}`),
}

export const labelsApi = {
  list: () => api.get<LabelResponse[]>('/api/labels'),
  create: (name: string) => api.post<LabelResponse>('/api/labels', { name }),
  update: (id: number, name: string) => api.put<LabelResponse>(`/api/labels/${id}`, { name }),
  remove: (id: number) => api.delete(`/api/labels/${id}`),
}

// SC-07: Role is never sent (UM-02); an empty NewPassword keeps the old one (FN-AD-17-R1)
export const usersApi = {
  list: (page: number) => api.get<PagedResponse<UserResponse>>(`/api/users${query({ page, pageSize: PAGE_SIZE })}`),
  create: (body: { email: string; displayName: string; password: string }) => api.post<UserResponse>('/api/users', body),
  update: (id: number, body: { email: string; displayName: string; newPassword: string | null }) => api.put<UserResponse>(`/api/users/${id}`, body),
  remove: (id: number) => api.delete(`/api/users/${id}`),
}

// SC-00-R5: the message for a failed action – the server's title (GN-07-R3), or the screen's own wording where it has one.
// 500 and no connection already carry "אירעה שגיאה, נסה שוב" (client.ts).
export const messageFor = (error: unknown, byStatus: Partial<Record<number, string>> = {}) => {
  if (!(error instanceof ApiError)) return GENERIC_ERROR
  return byStatus[error.status] ?? (error.status === 403 ? error.message || FORBIDDEN : error.message)
}
