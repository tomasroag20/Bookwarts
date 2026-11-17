
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet
} from 'react-router-dom'

import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/Login'
import Registro from './pages/Registro'
import Inicio from './pages/Inicio'
import Casas from './pages/Casas'
import Chats from './pages/Chats'
import Perfil from './pages/Perfil'
import Dashboard from './pages/Dashboard'

function Layout() {
  return (
    <ProtectedRoute>
      <Navbar />
      <Outlet />
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          <Route element={<Layout />}>
            <Route path="/" element={<Inicio />} />
            <Route path="/casas" element={<Casas />} />
            <Route path="/chats" element={<Chats />} />
            <Route path="/perfil" element={<Perfil />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute adminOnly>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Login />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
