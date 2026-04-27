import api from './axiosInstance'

export async function getClientes(pagina = 1, tamano = 10) {
  const response = await api.post('/clientes/buscar', {
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

export async function buscarClientes(filtros) {
  const response = await api.post('/clientes/buscar', filtros)
  const data = response.data.data
  return {
    items: data.items || [],
    totalPaginas: data.totalPages || 1,
    totalRegistros: data.totalRecords || 0,
    paginaActual: data.pageNumber || 1,
  }
}

export async function crearCliente(datos, usuario) {
  const payload = {
    ...datos,
    creado_por_usuario: usuario,
    modificacion_ip: '127.0.0.1',
    servicio_origen: 'WEB',
  }
  const response = await api.post('/clientes', payload)
  return response.data
}

export async function actualizarCliente(id, datos, usuario) {
  const payload = {
    ...datos,
    id_cliente: id,
    modificado_por_usuario: usuario,
    modificacion_ip: '127.0.0.1',
    servicio_origen: 'WEB',
    motivo_inhabilitacion: datos.motivo_inhabilitacion || '',
  }
  const response = await api.put(`/clientes/${id}`, payload)
  return response.data
}

export async function eliminarCliente(id, motivo) {
  const response = await api.delete(`/clientes/${id}`, {
    params: { motivo }
  })
  return response.data
}