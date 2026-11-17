
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Castle,
  Home,
  MessageCircle,
  UserRound,
  Shield,
  LogOut
} from 'lucide-react'

export default function Navbar() {
  const { perfil, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  async function salir() {
    try {
      await cerrarSesion()
      navigate('/login')
    } catch (error) {
      alert(error.message)
    }
  }

  const enlace = ({ isActive }) =>
    'nav-link d-flex align-items-center gap-2 ' +
    (isActive ? 'active' : '')

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bookwarts-navbar px-3">
      <div className="container-fluid">
        <NavLink className="navbar-brand fw-bold" to="/">
          ✨ BOOKWARTS
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#menuBookwarts"
          aria-controls="menuBookwarts"
          aria-expanded="false"
          aria-label="Abrir menú"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div
          className="collapse navbar-collapse"
          id="menuBookwarts"
        >
          <div className="navbar-nav ms-auto align-items-lg-center gap-lg-1">
            <NavLink className={enlace} to="/" end>
              <Home size={18} />
              Inicio
            </NavLink>

            <NavLink className={enlace} to="/casas">
              <Castle size={18} />
              Las casas
            </NavLink>

            <NavLink className={enlace} to="/chats">
              <MessageCircle size={18} />
              Chats
            </NavLink>

            <NavLink className={enlace} to="/perfil">
              <UserRound size={18} />
              Perfil
            </NavLink>

            {perfil?.rol === 'admin' && (
              <NavLink className={enlace} to="/dashboard">
                <Shield size={18} />
                Dashboard
              </NavLink>
            )}

            <button
              type="button"
              className="btn btn-outline-light ms-lg-3
                         d-flex align-items-center gap-2"
              onClick={salir}
            >
              <LogOut size={17} />
              Salir
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
