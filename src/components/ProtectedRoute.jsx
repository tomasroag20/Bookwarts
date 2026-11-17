
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({
  children,
  adminOnly = false
}) {
  const { user, perfil, loading } = useAuth()

  if (loading) {
    return <p className="text-center mt-5">Cargando BOOKWARTS...</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && perfil?.rol !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}
