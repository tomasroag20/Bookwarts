
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import PublicacionCard from '../components/PublicacionCard'

import {
  obtenerPublicaciones,
  crearPublicacion,
  eliminarPublicacion,
  darMeGusta,
  quitarMeGusta
} from '../services/publicaciones'

export default function Inicio() {
  const { user, perfil } = useAuth()

  const [publicaciones, setPublicaciones] = useState([])
  const [contenido, setContenido] = useState('')
  const [cargando, setCargando] = useState(true)
  const [publicando, setPublicando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [ocupado, setOcupado] = useState(false)

  const cargarPublicaciones = useCallback(async () => {
    try {
      const datos = await obtenerPublicaciones()
      setPublicaciones(datos)
      setMensaje('')
    } catch (error) {
      setMensaje(error.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarPublicaciones()
  }, [cargarPublicaciones])

  // Actualizar publicaciones al cambiar los datos
  useEffect(() => {
    const canal = supabase
      .channel('muro-bookwarts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'publicaciones'
        },
        () => cargarPublicaciones()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'me_gusta'
        },
        () => cargarPublicaciones()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [cargarPublicaciones])

  async function publicar(e) {
    e.preventDefault()

    if (!contenido.trim() || publicando) return

    setPublicando(true)
    setMensaje('')

    try {
      await crearPublicacion(contenido, user.id)
      setContenido('')
      await cargarPublicaciones()
    } catch (error) {
      setMensaje(error.message)
    } finally {
      setPublicando(false)
    }
  }

  async function manejarLike(publicacion) {
    if (ocupado) return
    setOcupado(true)

    try {
      const yaMeGusta = (publicacion.me_gusta || []).some(
        like => like.usuario_id === user.id
      )

      if (yaMeGusta) {
        await quitarMeGusta(publicacion.id, user.id)
      } else {
        await darMeGusta(publicacion.id, user.id)
      }

      await cargarPublicaciones()
    } catch (error) {
      setMensaje(error.message)
    } finally {
      setOcupado(false)
    }
  }

  async function manejarEliminar(publicacionId) {
    const confirmar = window.confirm(
      '¿Seguro que quieres eliminar esta publicación?'
    )

    if (!confirmar) return

    try {
      await eliminarPublicacion(publicacionId)
      await cargarPublicaciones()
    } catch (error) {
      setMensaje(error.message)
    }
  }

  const personaje = perfil?.personajes

  return (
    <div className="container py-4" style={{ maxWidth: 800 }}>
      <div className="mb-4">
        <h1> Inicio de BOOKWARTS</h1>
        <p className="text-muted">
          Comparte con estudiantes de todas las casas de Hogwarts.
        </p>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5>
            ¿Qué estás pensando,{' '}
            {personaje?.nombre || perfil?.nombre || 'estudiante'}?
          </h5>

          <form onSubmit={publicar}>
            <textarea
              className="form-control mb-3"
              rows="3"
              maxLength={2000}
              placeholder="Comparte algo con el mundo mágico..."
              value={contenido}
              onChange={e => setContenido(e.target.value)}
              required
            />

            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">
                {contenido.length}/2000 caracteres
              </small>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={publicando || !contenido.trim()}
              >
                {publicando ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {mensaje && (
        <div className="alert alert-danger">{mensaje}</div>
      )}

      <h4 className="mb-3">Publicaciones recientes</h4>

      {cargando ? (
        <p>Cargando publicaciones...</p>
      ) : publicaciones.length === 0 ? (
        <div className="alert alert-info">
          Todavía no hay publicaciones.
          ¡Sé el primero en compartir algo!
        </div>
      ) : (
        publicaciones.map(publicacion => (
          <PublicacionCard
            key={publicacion.id}
            publicacion={publicacion}
            usuarioId={user.id}
            onLike={manejarLike}
            onEliminar={manejarEliminar}
          />
        ))
      )}
    </div>
  )
}
