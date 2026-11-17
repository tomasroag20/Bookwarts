
export default function MensajeBurbuja({
  mensaje,
  usuarioId
}) {
  const esMio = mensaje.emisor_id === usuarioId

  const hora = new Date(mensaje.fecha).toLocaleTimeString(
    'es-CO',
    {
      hour: '2-digit',
      minute: '2-digit'
    }
  )

  return (
    <div
      className={
        'd-flex mb-3 ' +
        (esMio ? 'justify-content-end' : 'justify-content-start')
      }
    >
      <div
        className={
          'p-3 shadow-sm ' +
          (esMio
            ? 'bg-primary text-white'
            : 'bg-light text-dark')
        }
        style={{
          maxWidth: '80%',
          borderRadius: 16,
          overflowWrap: 'anywhere'
        }}
      >
        <div style={{ whiteSpace: 'pre-wrap' }}>
          {mensaje.contenido}
        </div>

        <small
          className={
            esMio ? 'text-white-50' : 'text-muted'
          }
          style={{
            display: 'block',
            textAlign: 'right',
            marginTop: 5
          }}
        >
          {hora}
        </small>
      </div>
    </div>
  )
}
