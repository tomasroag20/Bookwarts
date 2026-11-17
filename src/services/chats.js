
import { supabase } from '../supabase'

// Buscar usuarios que ya tienen personaje
export async function obtenerUsuarios(usuarioActualId) {
  const { data, error } = await supabase
    .from('perfiles')
    .select(`
      id,
      nombre,
      personaje_id,
      personajes (
        id,
        nombre,
        imagen,
        casas (
          nombre
        )
      )
    `)
    .not('personaje_id', 'is', null)
    .neq('id', usuarioActualId)
    .order('nombre')

  if (error) throw error

  return data || []
}

// Crear o recuperar una conversación
export async function iniciarConversacion(destinatarioId) {
  const { data, error } = await supabase.rpc(
    'iniciar_chat',
    {
      destinatario: destinatarioId
    }
  )

  if (error) throw error

  return data
}

// Obtener las conversaciones del usuario
export async function obtenerConversaciones(usuarioId) {
  const { data: propias, error: errorPropias } =
    await supabase
      .from('participantes_chat')
      .select('conversacion_id')
      .eq('usuario_id', usuarioId)

  if (errorPropias) throw errorPropias

  const ids = [
    ...new Set(
      (propias || []).map(p => p.conversacion_id)
    )
  ]

  if (ids.length === 0) return []

  const { data, error } = await supabase
    .from('participantes_chat')
    .select(`
      conversacion_id,
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
      )
    `)
    .in('conversacion_id', ids)

  if (error) throw error

  return ids.map(id => {
    const participantes = (data || []).filter(
      p => p.conversacion_id === id
    )

    const otro = participantes.find(
      p => p.usuario_id !== usuarioId
    )

    return {
      id,
      otroUsuario: otro?.perfiles || null
    }
  }).filter(chat => chat.otroUsuario)
}

// Obtener mensajes de una conversación
export async function obtenerMensajes(conversacionId) {
  const { data, error } = await supabase
    .from('mensajes')
    .select('id, conversacion_id, emisor_id, contenido, fecha')
    .eq('conversacion_id', conversacionId)
    .order('fecha', { ascending: true })

  if (error) throw error

  return data || []
}

// Enviar mensaje
export async function enviarMensaje(
  conversacionId,
  usuarioId,
  contenido
) {
  const texto = contenido.trim()

  if (!texto || texto.length > 4000) {
    throw new Error(
      'El mensaje debe tener entre 1 y 4000 caracteres.'
    )
  }

  const { data, error } = await supabase
    .from('mensajes')
    .insert({
      conversacion_id: conversacionId,
      emisor_id: usuarioId,
      contenido: texto
    })
    .select('id, conversacion_id, emisor_id, contenido, fecha')
    .single()

  if (error) throw error

  return data
}
