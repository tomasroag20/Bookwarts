
import { supabase } from '../supabase'

// Obtener publicaciones y autores
export async function obtenerPublicaciones() {
  const { data, error } = await supabase
    .from('publicaciones')
    .select(`
      id,
      contenido,
      fecha,
      usuario_id,
      perfiles (
        id,
        nombre,
        personajes (
          nombre,
          imagen,
          casas (
            nombre
          )
        )
      ),
      me_gusta (
        id,
        usuario_id
      )
    `)
    .order('fecha', { ascending: false })

  if (error) throw error

  return data || []
}

// Crear publicación
export async function crearPublicacion(contenido, usuarioId) {
  const texto = contenido.trim()

  if (!texto || texto.length > 2000) {
    throw new Error('La publicación debe tener entre 1 y 2000 caracteres.')
  }

  const { data, error } = await supabase
    .from('publicaciones')
    .insert({
      contenido: texto,
      usuario_id: usuarioId
    })
    .select()
    .single()

  if (error) throw error

  return data
}

// Eliminar publicación
export async function eliminarPublicacion(publicacionId) {
  const { error } = await supabase
    .from('publicaciones')
    .delete()
    .eq('id', publicacionId)

  if (error) throw error
}

// Dar Me gusta
export async function darMeGusta(publicacionId, usuarioId) {
  const { error } = await supabase
    .from('me_gusta')
    .upsert(
      {
        publicacion_id: publicacionId,
        usuario_id: usuarioId
      },
      {
        onConflict: 'publicacion_id,usuario_id',
        ignoreDuplicates: true
      }
    )

  if (error) throw error
}

// Quitar Me gusta
export async function quitarMeGusta(publicacionId, usuarioId) {
  const { error } = await supabase
    .from('me_gusta')
    .delete()
    .eq('publicacion_id', publicacionId)
    .eq('usuario_id', usuarioId)

  if (error) throw error
}
