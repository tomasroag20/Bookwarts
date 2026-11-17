
import { supabase } from '../supabase'

// ESTADÍSTICAS
export async function obtenerEstadisticas() {
  const tablas = [
    'perfiles',
    'casas',
    'personajes',
    'publicaciones'
  ]

  const resultados = await Promise.all(
    tablas.map(tabla =>
      supabase
        .from(tabla)
        .select('*', { count: 'exact', head: true })
    )
  )

  resultados.forEach(r => {
    if (r.error) throw r.error
  })

  return Object.fromEntries(
    tablas.map((tabla, i) => [
      tabla,
      resultados[i].count ?? 0
    ])
  )
}

// CASAS
export async function listarCasas() {
  const { data, error } = await supabase
    .from('casas')
    .select('*')
    .order('id')

  if (error) throw error
  return data || []
}

export async function guardarCasa(casa) {
  const datos = {
    nombre: casa.nombre.trim(),
    descripcion: casa.descripcion?.trim() || null,
    imagen: casa.imagen?.trim() || null
  }

  if (!datos.nombre) {
    throw new Error('El nombre de la casa es obligatorio')
  }

  const consulta = casa.id
    ? supabase.from('casas').update(datos).eq('id', casa.id)
    : supabase.from('casas').insert(datos)

  const { data, error } = await consulta
    .select()
    .single()

  if (error) throw error
  return data
}

export async function eliminarCasa(id) {
  const { data, error } = await supabase
    .from('casas')
    .delete()
    .eq('id', id)
    .select('id')

  if (error) throw error
  if (!data?.length) throw new Error('No se pudo eliminar la casa')
}

// PERSONAJES
export async function listarPersonajes() {
  const { data, error } = await supabase
    .from('personajes')
    .select('*, casas(nombre)')
    .order('nombre')

  if (error) throw error
  return data || []
}

export async function guardarPersonaje(personaje) {
  const datos = {
    nombre: personaje.nombre.trim(),
    actor: personaje.actor?.trim() || null,
    descripcion: personaje.descripcion?.trim() || null,
    imagen: personaje.imagen?.trim() || null,
    casa_id: personaje.casa_id
      ? Number(personaje.casa_id)
      : null
  }

  if (!datos.nombre) {
    throw new Error('El nombre del personaje es obligatorio')
  }

  const consulta = personaje.id
    ? supabase.from('personajes')
        .update(datos).eq('id', personaje.id)
    : supabase.from('personajes').insert(datos)

  const { data, error } = await consulta
    .select()
    .single()

  if (error) throw error
  return data
}

export async function eliminarPersonaje(id) {
  const { data, error } = await supabase
    .from('personajes')
    .delete()
    .eq('id', id)
    .select('id')

  if (error) throw error
  if (!data?.length) throw new Error('No se pudo eliminar el personaje')
}

// USUARIOS
export async function listarUsuarios() {
  const { data, error } = await supabase
    .from('perfiles')
    .select(`
      id,
      nombre,
      rol,
      creado_en,
      personajes (
        nombre,
        casas(nombre)
      )
    `)
    .order('creado_en', { ascending: false })

  if (error) throw error
  return data || []
}

export async function cambiarRol(usuarioId, rol) {
  const { error } = await supabase.rpc(
    'cambiar_rol_usuario',
    {
      usuario_objetivo: usuarioId,
      nuevo_rol: rol
    }
  )

  if (error) throw error
}

// PUBLICACIONES
export async function listarPublicacionesAdmin() {
  const { data, error } = await supabase
    .from('publicaciones')
    .select(`
      id,
      contenido,
      fecha,
      usuario_id,
      perfiles (
        nombre,
        personajes(nombre)
      )
    `)
    .order('fecha', { ascending: false })

  if (error) throw error
  return data || []
}

export async function moderarPublicacion(id) {
  const { data, error } = await supabase
    .from('publicaciones')
    .delete()
    .eq('id', id)
    .select('id')

  if (error) throw error
  if (!data?.length) {
    throw new Error('No se pudo eliminar la publicación')
  }
}
