// The API's DTOs (document 1, DT-03 to DT-14). Enums come as strings (DT-00-R5).

export type Role = 'Admin' | 'Member'
export type Status = 'Open' | 'Taken' | 'Done'

export interface AuthResponse {
  token: string
  displayName: string
  role: Role
}

export interface UserResponse {
  id: number
  email: string
  displayName: string
  role: Role
  createdAt: string
}

export interface LabelResponse {
  id: number
  name: string
}

export interface ProjectResponse {
  id: number
  name: string
  description: string | null
  createdAt: string
  taskCount: number
}

export interface TaskResponse {
  id: number
  title: string
  description: string | null
  status: Status
  projectId: number
  projectName: string
  takenByUserId: number | null
  takenByDisplayName: string | null
  createdAt: string
  completedAt: string | null
  labels: LabelResponse[]
}

export interface PagedResponse<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
}

export interface TaskRequest {
  title: string
  description: string | null
  projectId: number
  labelIds: number[]
}
