
import { Heart, Trash2 } from 'lucide-react'

export default function PublicacionCard({
  publicacion,
  usuarioId,
  onLike,
  onEliminar
}) {
  const perfil = publicacion.perfiles
  const personaje = perfil?.personajes

  const nombre = personaje?.nombre || perfil?.nombre || 'Estudiante'
  const casa = personaje?.casas?.nombre || 'Hogwarts'
  const imagen = personaje?.imagen

  const likes = publicacion.me_gusta || []

  const yaMeGusta = likes.some(
    like => like.usuario_id === usuarioId
  )

  const esMia = publicacion.usuario_id === usuarioId

  const fecha = new Date(publicacion.fecha).toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })

  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body">
        <div className="d-flex align-items-center mb-3">
          {imagen ? (
            <img
              src={imagen}
              alt={nombre}
              className="rounded-circle me-3"
              style={{
                width: 52,
                height: 52,
                objectFit: 'cover'
              }}
            />
          ) : (
            <div
              className="rounded-circle bg-secondary text-white
                         d-flex align-items-center
                         justify-content-center me-3"
              style={{ width: 52, height: 52 }}
            >
              {nombre.charAt(0)}
            </div>
          )}

          <div className="flex-grow-1">
            <h5 className="mb-0">{nombre}</h5>
            <small className="text-muted">
              {casa} · {fecha}
            </small>
          </div>

          {esMia && (
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => onEliminar(publicacion.id)}
              title="Eliminar publicación"
            >
              <Trash2 size={17} />
            </button>
          )}
        </div>

        <p style={{ whiteSpace: 'pre-wrap' }}>
          {publicacion.contenido}
        </p>

        <hr />

        <div className="d-flex align-items-center gap-3">
          <button
            className={
              yaMeGusta
                ? 'btn btn-danger btn-sm'
                : 'btn btn-outline-danger btn-sm'
            }
            onClick={() => onLike(publicacion)}
          >
            <Heart
              size={17}
              fill={yaMeGusta ? 'currentColor' : 'none'}
              className="me-1"
            />
            {yaMeGusta ? 'Te gusta' : 'Me gusta'}
          </button>

          <span className="text-muted">
            {likes.length} Me gusta
          </span>
        </div>
      </div>
    </div>
  )
}
