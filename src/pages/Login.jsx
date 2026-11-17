
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function ingresar(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password
      })

    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    navigate('/')
  }

  return (
    <div className="container py-5" style={{ maxWidth: 480 }}>
      <div className="card shadow p-4">
        <h1 className="text-center">🏰 BOOKWARTS</h1>
        <p className="text-center text-muted">
          Bienvenido de nuevo
        </p>

        <form onSubmit={ingresar}>
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
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="alert alert-danger">{error}</div>
          )}

          <button
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-center mt-3">
          ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
        </p>
      </div>
    </div>
  )
}
