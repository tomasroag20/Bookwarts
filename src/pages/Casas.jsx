
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

const estilos = {
  gryffindor: {
    emoji: '🦁',
    clase: 'casa-gryffindor'
  },
  slytherin: {
    emoji: '🐍',
    clase: 'casa-slytherin'
  },
  ravenclaw: {
    emoji: '🦅',
    clase: 'casa-ravenclaw'
  },
  hufflepuff: {
    emoji: '🦡',
    clase: 'casa-hufflepuff'
  }
}

export default function Casas() {
  const [casas, setCasas] = useState([])
  const [personajes, setPersonajes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true

    async function cargar() {
      try {
        const [respuestaCasas, respuestaPersonajes] =
          await Promise.all([
            supabase.from('casas').select('*').order('id'),
            supabase.from('personajes')
              .select('*')
              .order('nombre')
          ])

        if (respuestaCasas.error) {
          throw respuestaCasas.error
        }

        if (respuestaPersonajes.error) {
          throw respuestaPersonajes.error
        }

        if (!activo) return

        setCasas(respuestaCasas.data || [])
        setPersonajes(respuestaPersonajes.data || [])
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
  }, [])

  return (
    <div className="container py-4">
      <div className="text-center mb-5">
        <h1>🏰 Las casas de Hogwarts</h1>
        <p className="text-muted">
          Cuatro casas, una sola comunidad mágica.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {cargando && <p>Cargando casas...</p>}

      <div className="row g-4">
        {casas.map(casa => {
          const estilo = estilos[casa.nombre.toLowerCase()] || {
            emoji: '✨',
            clase: ''
          }

          const integrantes = personajes.filter(
            personaje => personaje.casa_id === casa.id
          )

          return (
            <div
              className="col-12 col-md-6"
              key={casa.id}
            >
              <div
                className={
                  `card casa-card h-100 ${estilo.clase}`
                }
              >
                {casa.imagen && (
                  <img
                    src={casa.imagen}
                    alt={casa.nombre}
                    className="card-img-top"
                    style={{
                      height: 180,
                      objectFit: 'cover'
                    }}
                  />
                )}

                <div className="card-body p-4">
                  <div className="display-5 mb-2">
                    {estilo.emoji}
                  </div>

                  <h3>{casa.nombre}</h3>
                  <p className="text-muted">
                    {casa.descripcion}
                  </p>

                  <hr />

                  <h5>Personajes</h5>

                  {integrantes.length === 0 ? (
                    <p className="text-muted">
                      No hay personajes registrados.
                    </p>
                  ) : (
                    <div className="d-flex flex-wrap gap-2">
                      {integrantes.map(personaje => (
                        <span
                          key={personaje.id}
                          className="badge text-bg-secondary p-2"
                        >
                          {personaje.nombre}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
