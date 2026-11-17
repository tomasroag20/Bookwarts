
export default function Dashboard() {
  return (
    <div className="container py-4">
      <h1>⚙️ Dashboard administrativo</h1>

      <div className="row mt-4">
        {['Usuarios', 'Casas', 'Personajes', 'Publicaciones'].map(
          modulo => (
            <div className="col-md-3 mb-3" key={modulo}>
              <div className="card p-4 text-center h-100">
                <h5>{modulo}</h5>
                <p className="text-muted">
                  Administración de {modulo.toLowerCase()}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}
