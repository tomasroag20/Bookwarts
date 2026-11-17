
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Registro() {
  const navigate = useNavigate()

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [loading, setLoading] = useState(false)

  async function registrar(e) {
    e.preventDefault()
    setLoading(true)
    setMensaje('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre }
      }
    })

    setLoading(false)

    if (error) {
      setMensaje(error.message)
      return
    }

    if (data.session) {
      navigate('/perfil')
    } else {
      setMensaje(
        'Cuenta creada. Confirma tu correo y luego inicia sesión.'
      )
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 480 }}>
      <div className="card shadow p-4">
        <h1 className="text-center">🪄 BOOKWARTS</h1>
        <p className="text-center text-muted">
          Únete al mundo mágico
        </p>

        <form onSubmit={registrar}>
          <input
            className="form-control mb-3"
            placeholder="Nombre"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
          />

          <input
            className="form-control mb-3"
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <input
            className="form-control mb-3"
            type="password"
            placeholder="Contraseña"
            minLength={6}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          {mensaje && (
            <div className="alert alert-info">{mensaje}</div>
          )}

          <button
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center mt-3">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}
