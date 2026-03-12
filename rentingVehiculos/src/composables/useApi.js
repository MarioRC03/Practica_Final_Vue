const BASE_URL = 'http://localhost:3000'

export function useApi() {

  async function getAll(recurso) {
    const res = await fetch(`${BASE_URL}/${recurso}`)
    if (!res.ok) throw new Error(`Error al obtener ${recurso}`)
    return await res.json()
  }

  async function getById(recurso, id) {
    const res = await fetch(`${BASE_URL}/${recurso}/${id}`)
    if (!res.ok) throw new Error(`Error al obtener ${recurso}/${id}`)
    return await res.json()
  }

  async function post(recurso, datos) {
    const res = await fetch(`${BASE_URL}/${recurso}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    })
    if (!res.ok) throw new Error(`Error al crear ${recurso}`)
    return await res.json()
  }

  async function put(recurso, id, datos) {
    const res = await fetch(`${BASE_URL}/${recurso}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    })
    if (!res.ok) throw new Error(`Error al actualizar ${recurso}`)
    return await res.json()
  }

  async function patch(recurso, id, datos) {
    const res = await fetch(`${BASE_URL}/${recurso}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    })
    if (!res.ok) throw new Error(`Error al modificar ${recurso}`)
    return await res.json()
  }

  async function eliminar(recurso, id) {
    const res = await fetch(`${BASE_URL}/${recurso}/${id}`, {
      method: 'DELETE'
    })
    if (!res.ok) throw new Error(`Error al eliminar ${recurso}`)
    return true
  }

  return { getAll, getById, post, put, patch, eliminar }
}
