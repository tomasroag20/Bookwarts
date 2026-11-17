
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'

export default function Perfil() {
  const { user, perfil, cargarPerfil } = useAuth()

  const [personajes, setPersonajes] = useState([])
  const [seleccionado, setSeleccionado] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    async function cargar() {
      const { data, error } = await supabase
        .from('personajes')
        .select('id, nombre, imagen, casas(nombre)')
        .order('nombre')

      if (!error) setPersonajes(data || [])
    }

    cargar()
  }, [])

  async function elegirPersonaje() {
    if (!seleccionado) return

    setGuardando(true)
    setMensaje('')

    const { error } = await supabase.rpc('elegir_personaje', {
      nuevo_personaje: Number(seleccionado)
    })

    setGuardando(false)

    if (error) {
      setMensaje(error.message)
      return
    }

    await cargarPerfil(user)
    setMensaje('¡Personaje asignado correctamente!')
  }

  return (
    <div className="container py-4">
      <h1>Mi perfil mágico</h1>

      <div className="card p-4 mt-3">
        <h3>{perfil?.nombre || 'Estudiante'}</h3>
        <p><strong>Correo:</strong> {user?.email}</p>
        <p><strong>Rol:</strong> {perfil?.rol || 'usuario'}</p>

        {perfil?.personajes ? (
          <div>
            <h4>Tu personaje</h4>

            {perfil.personajes.imagen && (
              <img
                src={perfil.personajes.imagen}
                alt={perfil.personajes.nombre}
                width="150"
                className="rounded mb-3"
              />
            )}

            <p>
              <strong>Nombre:</strong> {perfil.personajes.nombre}
            </p>

            <p>
              <strong>Casa:</strong>{' '}
              {perfil.personajes.casas?.nombre || 'Sin casa'}
            </p>
          </div>
        ) : (
          <div>
            <h4>Elige tu personaje</h4>

            <select
              className="form-select mb-3"
              value={seleccionado}
              onChange={e => setSeleccionado(e.target.value)}
            >
              <option value="">Seleccionar personaje</option>

              {personajes.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombre} - {p.casas?.nombre}
                </option>
              ))}
            </select>

            <button
              className="btn btn-success"
              onClick={elegirPersonaje}
              disabled={!seleccionado || guardando}
            >
              {guardando ? 'Guardando...' : 'Elegir personaje'}
            </button>
          </div>
        )}

        {mensaje && (
          <div className="alert alert-info mt-3">{mensaje}</div>
        )}
      </div>
    </div>
  )
}
