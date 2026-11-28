import { Route, Routes } from 'react-router'

import { RootLayout } from './app/layouts/RootLayout'
import { RequireAuth } from './features/auth/RequireAuth'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { HomePage } from './pages/HomePage'
import { EditItemPage, NewItemPage } from './pages/ItemFormPage'
import { ItemPage } from './pages/ItemPage'
import { NotFoundPage } from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<AuthPage mode="login" />} />
        <Route path="register" element={<AuthPage mode="register" />} />
        <Route path="items/:id" element={<ItemPage />} />
        <Route
          path="items/new"
          element={
            <RequireAuth>
              <NewItemPage />
            </RequireAuth>
          }
        />
        <Route
          path="items/:id/edit"
          element={
            <RequireAuth>
              <EditItemPage />
            </RequireAuth>
          }
        />
        <Route
          path="dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
