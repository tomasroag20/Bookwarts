
import {
  useEffect,
  useRef,
  useState
} from 'react'

import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import MensajeBurbuja from '../components/MensajeBurbuja'

import {
  obtenerUsuarios,
  obtenerConversaciones,
  iniciarConversacion,
  obtenerMensajes,
  enviarMensaje
} from '../services/chats'

export default function Chats() {
  const { user, perfil } = useAuth()

  const [usuarios, setUsuarios] = useState([])
  const [conversaciones, setConversaciones] = useState([])
  const [chatActivo, setChatActivo] = useState(null)
  const [mensajes, setMensajes] = useState([])
  const [texto, setTexto] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)

  const finalChat = useRef(null)
  const chatActualRef = useRef(null)

  useEffect(() => {
    chatActualRef.current = chatActivo?.id ?? null
  }, [chatActivo])

  // Cargar usuarios y conversaciones
  useEffect(() => {
    if (!user?.id) return

    let activo = true

    async function cargar() {
      try {
        const [listaUsuarios, listaChats] =
          await Promise.all([
            obtenerUsuarios(user.id),
            obtenerConversaciones(user.id)
          ])

        if (!activo) return

        setUsuarios(listaUsuarios)
        setConversaciones(listaChats)
      } catch (err) {
        if (activo) setError(err.message)
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargar()

    return () => {
      activo = false
    }
  }, [user?.id])

  // Consultar mensajes al abrir un chat
  useEffect(() => {
    if (!chatActivo?.id) {
      setMensajes([])
      return
    }

    let activo = true
    const id = chatActivo.id

    async function cargar() {
      try {
        const datos = await obtenerMensajes(id)

        if (activo) {
          setMensajes(datos)
        }
      } catch (err) {
        if (activo) setError(err.message)
      }
    }

    setMensajes([])
    cargar()

    // Escuchar mensajes nuevos en tiempo real
    const canal = supabase
      .channel(`chat-bookwarts-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes',
          filter: `conversacion_id=eq.${id}`
        },
        payload => {
          if (!activo) return

          setMensajes(anteriores => {
            const existe = anteriores.some(
              m => m.id === payload.new.id
            )

            if (existe) return anteriores

            return [...anteriores, payload.new].sort(
              (a, b) =>
                new Date(a.fecha) - new Date(b.fecha) ||
                a.id - b.id
            )
          })
        }
      )
      .subscribe()

    return () => {
      activo = false
      supabase.removeChannel(canal)
    }
  }, [chatActivo?.id])

  // Desplazar al último mensaje
  useEffect(() => {
    finalChat.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end'
    })
  }, [mensajes])

  async function abrirChat(usuarioDestino) {
    try {
      setError('')

      const id = await iniciarConversacion(
        usuarioDestino.id
      )

      const nuevoChat = {
        id,
        otroUsuario: usuarioDestino
      }

      setConversaciones(anteriores => {
        if (anteriores.some(c => c.id === id)) {
          return anteriores
        }

        return [nuevoChat, ...anteriores]
      })

      setChatActivo(nuevoChat)
      setBusqueda('')
    } catch (err) {
      setError(err.message)
    }
  }

  async function enviar(e) {
    e.preventDefault()

    if (!texto.trim() || !chatActivo || enviando) {
      return
    }

    setEnviando(true)
    setError('')

    const contenido = texto
    const id = chatActivo.id

    try {
      const nuevoMensaje = await enviarMensaje(
        id,
        user.id,
        contenido
      )

      setTexto('')

      // Agregar inmediatamente sin esperar Realtime
      if (chatActualRef.current === id) {
        setMensajes(anteriores => {
          if (anteriores.some(
            m => m.id === nuevoMensaje.id
          )) {
            return anteriores
          }

          return [...anteriores, nuevoMensaje].sort(
            (a, b) =>
              new Date(a.fecha) - new Date(b.fecha) ||
              a.id - b.id
          )
        })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const usuariosFiltrados = usuarios.filter(u => {
    const nombre = (
      u.personajes?.nombre || u.nombre
    ).toLowerCase()

    const casa = (
      u.personajes?.casas?.nombre || ''
    ).toLowerCase()

    const termino = busqueda.toLowerCase()

    return nombre.includes(termino) ||
           casa.includes(termino)
  })

  const nombreChat =
    chatActivo?.otroUsuario?.personajes?.nombre ||
    chatActivo?.otroUsuario?.nombre ||
    'Estudiante'

  return (
    <div className="container-fluid py-4">
      <h1 className="mb-3">💬 Chats mágicos</h1>

      <p className="text-muted">
        Conversa con estudiantes de cualquier casa.
      </p>

      {error && (
        <div className="alert alert-danger">
          {error}
          <button
            className="btn-close float-end"
            onClick={() => setError('')}
            aria-label="Cerrar"
          />
        </div>
      )}

      {!perfil?.personaje_id && (
        <div className="alert alert-warning">
          Recuerda elegir tu personaje en Perfil.
        </div>
      )}

      <div className="row g-3">
        {/* PANEL IZQUIERDO */}
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5>Buscar personajes</h5>

              <input
                className="form-control mb-3"
                placeholder="Nombre o casa..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />

              <div
                style={{
                  maxHeight: 240,
                  overflowY: 'auto'
                }}
              >
                {cargando && <p>Cargando...</p>}

                {!cargando &&
                  usuariosFiltrados.length === 0 && (
                    <p className="text-muted">
                      No hay personajes disponibles.
                    </p>
                  )}

                {usuariosFiltrados.map(u => (
                  <button
                    key={u.id}
                    className="list-group-item list-group-item-action
                               border rounded mb-2 p-2 w-100 text-start"
                    onClick={() => abrirChat(u)}
                  >
                    <strong>
                      {u.personajes?.nombre || u.nombre}
                    </strong>

                    <div className="text-muted small">
                      {u.personajes?.casas?.nombre ||
                        'Sin casa'}
                    </div>
                  </button>
                ))}
              </div>

              <hr />

              <h5>Mis conversaciones</h5>

              {conversaciones.length === 0 && (
                <p className="text-muted small">
                  Todavía no tienes conversaciones.
                </p>
              )}

              {conversaciones.map(chat => (
                <button
                  key={chat.id}
                  className={
                    'list-group-item list-group-item-action ' +
                    'border rounded mb-2 p-2 w-100 text-start ' +
                    (chatActivo?.id === chat.id
                      ? 'active'
                      : '')
                  }
                  onClick={() => setChatActivo(chat)}
                >
                  <strong>
                    {chat.otroUsuario?.personajes?.nombre ||
                      chat.otroUsuario?.nombre}
                  </strong>

                  <div className="small">
                    {chat.otroUsuario?.personajes?.casas?.nombre ||
                      'Hogwarts'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="col-lg-8">
          <div className="card shadow-sm">
            {!chatActivo ? (
              <div
                className="card-body d-flex align-items-center
                           justify-content-center text-center"
                style={{ minHeight: 450 }}
              >
                <div>
                  <h3>🪄 Bienvenido a los chats</h3>
                  <p className="text-muted">
                    Selecciona un personaje para comenzar
                    una conversación.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="card-header bg-dark text-white">
                  <h5 className="mb-0">{nombreChat}</h5>
                  <small>
                    {chatActivo.otroUsuario?.personajes
                      ?.casas?.nombre || 'Hogwarts'}
                  </small>
                </div>

                <div
                  className="card-body"
                  style={{
                    height: 400,
                    overflowY: 'auto',
                    backgroundColor: '#f8f9fa'
                  }}
                >
                  {mensajes.length === 0 && (
                    <p className="text-center text-muted">
                      Todavía no hay mensajes.
                      ¡Comienza la conversación!
                    </p>
                  )}

                  {mensajes.map(mensaje => (
                    <MensajeBurbuja
                      key={mensaje.id}
                      mensaje={mensaje}
                      usuarioId={user.id}
                    />
                  ))}

                  <div ref={finalChat} />
                </div>

                <div className="card-footer">
                  <form
                    onSubmit={enviar}
                    className="d-flex gap-2"
                  >
                    <input
                      className="form-control"
                      placeholder="Escribe un mensaje mágico..."
                      value={texto}
                      onChange={e => setTexto(e.target.value)}
                      maxLength={4000}
                      required
                    />

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={enviando || !texto.trim()}
                    >
                      {enviando ? '...' : 'Enviar'}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
