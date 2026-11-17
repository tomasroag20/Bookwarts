
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  obtenerEstadisticas,
  listarCasas,
  guardarCasa,
  eliminarCasa,
  listarPersonajes,
  guardarPersonaje,
  eliminarPersonaje,
  listarUsuarios,
  cambiarRol,
  listarPublicacionesAdmin,
  moderarPublicacion
} from '../services/admin'

const casaVacia = {
  nombre: '',
  descripcion: '',
  imagen: ''
}

const personajeVacio = {
  nombre: '',
  actor: '',
  descripcion: '',
  imagen: '',
  casa_id: ''
}

export default function Dashboard() {
  const { user, perfil } = useAuth()

  const [seccion, setSeccion] = useState('resumen')
  const [estadisticas, setEstadisticas] = useState({})
  const [casas, setCasas] = useState([])
  const [personajes, setPersonajes] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [publicaciones, setPublicaciones] = useState([])

  const [casaForm, setCasaForm] = useState(casaVacia)
  const [personajeForm, setPersonajeForm] =
    useState(personajeVacio)

  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const cargarDatos = useCallback(async () => {
    setCargando(true)
    setError('')

    try {
      const [
        stats,
        listaCasas,
        listaPersonajes,
        listaUsuarios,
        listaPublicaciones
      ] = await Promise.all([
        obtenerEstadisticas(),
        listarCasas(),
        listarPersonajes(),
        listarUsuarios(),
        listarPublicacionesAdmin()
      ])

      setEstadisticas(stats)
      setCasas(listaCasas)
      setPersonajes(listaPersonajes)
      setUsuarios(listaUsuarios)
      setPublicaciones(listaPublicaciones)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    if (perfil?.rol === 'admin') {
      cargarDatos()
    }
  }, [perfil?.rol, cargarDatos])

  async function ejecutar(operacion, mensajeExito) {
    setGuardando(true)
    setError('')
    setMensaje('')

    try {
      await operacion()
      await cargarDatos()
      setMensaje(mensajeExito)
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setGuardando(false)
    }
  }

  async function enviarCasa(e) {
    e.preventDefault()

    const correcto = await ejecutar(
      () => guardarCasa(casaForm),
      casaForm.id
        ? 'Casa actualizada correctamente'
        : 'Casa creada correctamente'
    )

    if (correcto) setCasaForm(casaVacia)
  }

  async function borrarCasa(casa) {
    if (!window.confirm(
      `¿Eliminar ${casa.nombre}? Sus personajes quedarán sin casa.`
    )) return

    await ejecutar(
      () => eliminarCasa(casa.id),
      'Casa eliminada correctamente'
    )
  }

  async function enviarPersonaje(e) {
    e.preventDefault()

    const correcto = await ejecutar(
      () => guardarPersonaje(personajeForm),
      personajeForm.id
        ? 'Personaje actualizado'
        : 'Personaje creado'
    )

    if (correcto) setPersonajeForm(personajeVacio)
  }

  async function borrarPersonaje(personaje) {
    if (!window.confirm(
      `¿Eliminar a ${personaje.nombre}? Los perfiles que lo representan quedarán sin personaje.`
    )) return

    await ejecutar(
      () => eliminarPersonaje(personaje.id),
      'Personaje eliminado'
    )
  }

  async function actualizarRol(usuario) {
    const nuevoRol =
      usuario.rol === 'admin' ? 'usuario' : 'admin'

    if (!window.confirm(
      `¿Cambiar el rol de ${usuario.nombre} a ${nuevoRol}?`
    )) return

    await ejecutar(
      () => cambiarRol(usuario.id, nuevoRol),
      'Rol actualizado correctamente'
    )
  }

  async function eliminarPost(post) {
    if (!window.confirm(
      '¿Eliminar permanentemente esta publicación?'
    )) return

    await ejecutar(
      () => moderarPublicacion(post.id),
      'Publicación eliminada'
    )
  }

  if (perfil?.rol !== 'admin') {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          Acceso denegado. Solo administradores.
        </div>
      </div>
    )
  }

  const botones = [
    ['resumen', '📊 Resumen'],
    ['casas', '🏰 Casas'],
    ['personajes', '🪄 Personajes'],
    ['usuarios', '👥 Usuarios'],
    ['publicaciones', '📝 Publicaciones']
  ]

  return (
    <div className="container-fluid py-4 px-lg-5">
      <div className="d-flex flex-wrap justify-content-between
                      align-items-center gap-2 mb-4">
        <div>
          <h1>⚙️ Dashboard administrativo</h1>
          <p className="text-muted mb-0">
            Administración de BOOKWARTS
          </p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={cargarDatos}
          disabled={cargando || guardando}
        >
          Actualizar datos
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {mensaje && (
        <div className="alert alert-success">{mensaje}</div>
      )}

      <div className="d-flex flex-wrap gap-2 mb-4">
        {botones.map(([id, texto]) => (
          <button
            key={id}
            className={
              seccion === id
                ? 'btn btn-dark'
                : 'btn btn-outline-dark'
            }
            onClick={() => {
              setSeccion(id)
              setError('')
              setMensaje('')
            }}
          >
            {texto}
          </button>
        ))}
      </div>

      {cargando && <p>Cargando información...</p>}

      {/* RESUMEN */}
      {seccion === 'resumen' && (
        <div className="row g-3">
          {[
            ['Usuarios', estadisticas.perfiles],
            ['Casas', estadisticas.casas],
            ['Personajes', estadisticas.personajes],
            ['Publicaciones', estadisticas.publicaciones]
          ].map(([titulo, cantidad]) => (
            <div className="col-md-6 col-xl-3" key={titulo}>
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h6 className="text-muted">{titulo}</h6>
                  <h2>{cantidad ?? 0}</h2>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CASAS */}
      {seccion === 'casas' && (
        <div className="row g-4">
          <div className="col-lg-5">
            <div className="card p-3 shadow-sm">
              <h4>
                {casaForm.id ? 'Editar casa' : 'Crear casa'}
              </h4>

              <form onSubmit={enviarCasa}>
                <label className="form-label">Nombre</label>
                <input
                  className="form-control mb-3"
                  value={casaForm.nombre}
                  onChange={e => setCasaForm({
                    ...casaForm,
                    nombre: e.target.value
                  })}
                  required
                />

                <label className="form-label">Descripción</label>
                <textarea
                  className="form-control mb-3"
                  rows="3"
                  value={casaForm.descripcion || ''}
                  onChange={e => setCasaForm({
                    ...casaForm,
                    descripcion: e.target.value
                  })}
                />

                <label className="form-label">URL de imagen</label>
                <input
                  className="form-control mb-3"
                  type="url"
                  value={casaForm.imagen || ''}
                  onChange={e => setCasaForm({
                    ...casaForm,
                    imagen: e.target.value
                  })}
                />

                <button
                  className="btn btn-success me-2"
                  disabled={guardando}
                >
                  {guardando ? 'Guardando...' : 'Guardar casa'}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCasaForm(casaVacia)}
                >
                  Cancelar
                </button>
              </form>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="card p-3 shadow-sm">
              <h4>Casas registradas</h4>

              {casas.map(casa => (
                <div
                  key={casa.id}
                  className="border-bottom py-3"
                >
                  <h5>{casa.nombre}</h5>
                  <p>{casa.descripcion}</p>

                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => setCasaForm(casa)}
                  >
                    Editar
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    disabled={guardando}
                    onClick={() => borrarCasa(casa)}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PERSONAJES */}
      {seccion === 'personajes' && (
        <div className="row g-4">
          <div className="col-lg-5">
            <div className="card p-3 shadow-sm">
              <h4>
                {personajeForm.id
                  ? 'Editar personaje'
                  : 'Crear personaje'}
              </h4>

              <form onSubmit={enviarPersonaje}>
                <label className="form-label">Nombre</label>
                <input
                  className="form-control mb-3"
                  value={personajeForm.nombre}
                  onChange={e => setPersonajeForm({
                    ...personajeForm,
                    nombre: e.target.value
                  })}
                  required
                />

                <label className="form-label">Actor</label>
                <input
                  className="form-control mb-3"
                  value={personajeForm.actor || ''}
                  onChange={e => setPersonajeForm({
                    ...personajeForm,
                    actor: e.target.value
                  })}
                />

                <label className="form-label">Descripción</label>
                <textarea
                  className="form-control mb-3"
                  value={personajeForm.descripcion || ''}
                  onChange={e => setPersonajeForm({
                    ...personajeForm,
                    descripcion: e.target.value
                  })}
                />

                <label className="form-label">Imagen (URL)</label>
                <input
                  type="url"
                  className="form-control mb-3"
                  value={personajeForm.imagen || ''}
                  onChange={e => setPersonajeForm({
                    ...personajeForm,
                    imagen: e.target.value
                  })}
                />

                <label className="form-label">Casa</label>
                <select
                  className="form-select mb-3"
                  value={personajeForm.casa_id || ''}
                  onChange={e => setPersonajeForm({
                    ...personajeForm,
                    casa_id: e.target.value
                  })}
                >
                  <option value="">Sin casa</option>

                  {casas.map(casa => (
                    <option key={casa.id} value={casa.id}>
                      {casa.nombre}
                    </option>
                  ))}
                </select>

                <button
                  className="btn btn-success me-2"
                  disabled={guardando}
                >
                  {guardando ? 'Guardando...' : 'Guardar personaje'}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setPersonajeForm(personajeVacio)}
                >
                  Cancelar
                </button>
              </form>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="card p-3 shadow-sm">
              <h4>Personajes registrados</h4>

              {personajes.map(personaje => (
                <div
                  key={personaje.id}
                  className="border-bottom py-3 d-flex gap-3"
                >
                  {personaje.imagen && (
                    <img
                      src={personaje.imagen}
                      alt={personaje.nombre}
                      width="65"
                      height="75"
                      style={{ objectFit: 'cover' }}
                    />
                  )}

                  <div className="flex-grow-1">
                    <h5>{personaje.nombre}</h5>
                    <p className="mb-2">
                      {personaje.casas?.nombre || 'Sin casa'}
                    </p>

                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => setPersonajeForm(personaje)}
                    >
                      Editar
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      disabled={guardando}
                      onClick={() => borrarPersonaje(personaje)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* USUARIOS */}
      {seccion === 'usuarios' && (
        <div className="card p-3 shadow-sm">
          <h4>Usuarios de BOOKWARTS</h4>

          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Personaje</th>
                  <th>Casa</th>
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {usuarios.map(usuario => (
                  <tr key={usuario.id}>
                    <td>{usuario.nombre}</td>
                    <td>
                      {usuario.personajes?.nombre || 'Sin asignar'}
                    </td>
                    <td>
                      {usuario.personajes?.casas?.nombre || '-'}
                    </td>
                    <td>{usuario.rol}</td>
                    <td>
                      <button
                        className="btn btn-outline-primary btn-sm"
                        disabled={
                          usuario.id === user.id || guardando
                        }
                        onClick={() => actualizarRol(usuario)}
                      >
                        {usuario.rol === 'admin'
                          ? 'Quitar admin'
                          : 'Hacer admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PUBLICACIONES */}
      {seccion === 'publicaciones' && (
        <div className="card p-3 shadow-sm">
          <h4>Moderación de publicaciones</h4>

          {publicaciones.length === 0 && (
            <p>No hay publicaciones.</p>
          )}

          {publicaciones.map(post => (
            <div
              key={post.id}
              className="border-bottom py-3"
            >
              <strong>
                {post.perfiles?.personajes?.nombre ||
                  post.perfiles?.nombre ||
                  'Usuario'}
              </strong>

              <small className="d-block text-muted">
                {new Date(post.fecha).toLocaleString('es-CO')}
              </small>

              <p
                className="mt-2"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {post.contenido}
              </p>

              <button
                className="btn btn-danger btn-sm"
                disabled={guardando}
                onClick={() => eliminarPost(post)}
              >
                Eliminar publicación
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
