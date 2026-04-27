import api from './axiosInstance'

export async function getExtras(pagina = 1, tamano = 10) {
  const response = await api.post('/extras/buscar', {
    page_number: pagina,
    page_size: tamano,
  })
  const data = response.data.data
  return {
    items: data.items || [],
    totalPaginas: data.totalPages || 1,
    totalRegistros: data.totalRecords || 0,
    paginaActual: data.pageNumber || 1,
  }
}

export async function crearExtra(datos, usuario) {
  const payload = {
    ...datos,
    creado_por_usuario: usuario,
    modificado_desde_ip: '127.0.0.1',
    origen_registro: 'WEB',
  }
  const response = await api.post('/extras', payload)
  return response.data
}

export async function actualizarExtra(id, datos, usuario) {
  const payload = {
    ...datos,
    id_extra: id,
    modificado_por_usuario: usuario,
    modificado_desde_ip: '127.0.0.1',
    origen_registro: 'WEB',
    motivo_inhabilitacion: datos.motivo_inhabilitacion || '',
  }
  const response = await api.put(`/extras/${id}`, payload)
  return response.data
}

export async function eliminarExtra(id, motivo, usuario) {
  const response = await api.delete(`/extras/${id}`, {
    params: {
      motivo: motivo,
    }
  })
  return response.data
}

export async function buscarExtras(filtros) {
  const response = await api.post('/extras/buscar', filtros)
  const data = response.data.data
  return {
    items: data.items || [],
    totalPaginas: data.totalPages || 1,
    totalRegistros: data.totalRecords || 0,
    paginaActual: data.pageNumber || 1,
  }
}