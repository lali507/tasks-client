import { Navigate, Route, Routes } from 'react-router'
import { GuestOnly, RequireAuth } from './components/Guards'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { TasksPage } from './pages/TasksPage'
import { MyTasksPage } from './pages/MyTasksPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { LabelsPage } from './pages/LabelsPage'
import { UsersPage } from './pages/UsersPage'

// SC-00: the screens and who sees them
export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
        <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
        <Route path="/tasks" element={<RequireAuth><TasksPage /></RequireAuth>} />
        <Route path="/my-tasks" element={<RequireAuth roles={['Member']}><MyTasksPage /></RequireAuth>} />
        <Route path="/admin/projects" element={<RequireAuth roles={['Admin']}><ProjectsPage /></RequireAuth>} />
        <Route path="/admin/labels" element={<RequireAuth roles={['Admin']}><LabelsPage /></RequireAuth>} />
        <Route path="/admin/users" element={<RequireAuth roles={['Admin']}><UsersPage /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/tasks" replace />} />
      </Route>
    </Routes>
  )
}
