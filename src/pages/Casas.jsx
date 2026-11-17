
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function Casas() {
  const [casas, setCasas] = useState([])
  const [personajes, setPersonajes] = useState([])

  useEffect(() => {
    async function cargar() {
      const [respuestaCasas, respuestaPersonajes] =
        await Promise.all([
          supabase.from('casas').select('*').order('id'),
          supabase.from('personajes').select('*').order('nombre')
        ])

      setCasas(respuestaCasas.data || [])
      setPersonajes(respuestaPersonajes.data || [])
    }

    cargar()
  }, [])

  return (
    <div className="container py-4">
      <h1>🏰 Casas de Hogwarts</h1>

      <div className="row">
        {casas.map(casa => (
          <div className="col-md-6 mb-4" key={casa.id}>
            <div className="card h-100 p-3">
              <h3>{casa.nombre}</h3>
              <p>{casa.descripcion}</p>

              <h5>Personajes</h5>

              <ul>
                {personajes
                  .filter(p => p.casa_id === casa.id)
                  .map(p => (
                    <li key={p.id}>{p.nombre}</li>
                  ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
