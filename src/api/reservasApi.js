import api from './axiosInstance'

export async function getReservas(pagina = 1, tamano = 10) {
  const response = await api.post('/reservas/buscar', {
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

export async function buscarReservas(filtros) {
  const response = await api.post('/reservas/buscar', filtros)
  const data = response.data.data
  return {
    items: data.items || [],
    totalPaginas: data.totalPages || 1,
    totalRegistros: data.totalRecords || 0,
    paginaActual: data.pageNumber || 1,
  }
}

export async function getReservaPorId(id) {
  const response = await api.get(`/reservas/${id}`)
  return response.data.data
}

export async function crearReserva(datos, usuario) {
  const payload = {
    ...datos,
    creado_por_usuario: usuario,
    modificacion_ip: '127.0.0.1',
    servicio_origen: 'WEB',
    conductores: datos.conductores.map(c => ({
      ...c,
      creado_por_usuario: usuario,
      modificado_por_usuario: usuario,
      modificado_desde_ip: '127.0.0.1',
      origen_registro: 'WEB',
    })),
    extras: datos.extras.map(e => ({
      ...e,
      creado_por_usuario: usuario,
      modificado_por_usuario: usuario,
      modificado_desde_ip: '127.0.0.1',
      origen_registro: 'WEB',
    })),
  }
  const response = await api.post('/reservas', payload)
  return response.data
}

export async function actualizarReserva(id, datos, usuario) {
  const payload = {
    ...datos,
    id_reserva: id,
    modificado_por_usuario: usuario,
    modificacion_ip: '127.0.0.1',
    servicio_origen: 'WEB',
    conductores: datos.conductores.map(c => ({
      ...c,
      creado_por_usuario: usuario,
      modificado_por_usuario: usuario,
      modificado_desde_ip: '127.0.0.1',
      origen_registro: 'WEB',
    })),
    extras: datos.extras.map(e => ({
      ...e,
      creado_por_usuario: usuario,
      modificado_por_usuario: usuario,
      modificado_desde_ip: '127.0.0.1',
      origen_registro: 'WEB',
    })),
  }
  const response = await api.put(`/reservas/${id}`, payload)
  return response.data
}

export async function confirmarReserva(id) {
  const response = await api.post(`/reservas/${id}/confirmar`)
  return response.data
}

export async function eliminarReserva(id, motivo) {
  const response = await api.delete(`/reservas/${id}`, {
    params: { motivo }
  })
  return response.data
}