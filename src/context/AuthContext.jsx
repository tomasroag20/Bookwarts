
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)

  async function cargarPerfil(usuario) {
    if (!usuario) {
      setPerfil(null)
      return
    }

    const { data, error } = await supabase
      .from('perfiles')
      .select(`
        id,
        nombre,
        rol,
        personaje_id,
        personajes (
          id,
          nombre,
          imagen,
          casas (
            id,
            nombre
          )
        )
      `)
      .eq('id', usuario.id)
      .maybeSingle()

    if (error) {
      console.error(error.message)
      return
    }

    setPerfil(data)
  }

  useEffect(() => {
    let activo = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!activo) return

      const usuario = data.session?.user || null
      setUser(usuario)

      if (usuario) await cargarPerfil(usuario)

      if (activo) setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_evento, session) => {
        const usuario = session?.user || null
        setUser(usuario)

        if (!usuario) {
          setPerfil(null)
        } else {
          setTimeout(() => cargarPerfil(usuario), 0)
        }
      }
    )

    return () => {
      activo = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function cerrarSesion() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setPerfil(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      perfil,
      loading,
      cerrarSesion,
      cargarPerfil
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
