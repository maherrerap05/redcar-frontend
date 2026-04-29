import axios from 'axios'

// Instancia pública: NO adjunta token de admin, NO redirige a /login en 401
const bookingApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Vehículos ────────────────────────────────────────────────────────────────

export async function buscarVehiculosDisponibles({ idLocalizacionRecogida, fechaRecogida, fechaDevolucion }) {
  // El controller espera: id_localizacion_recogida, fecha_hora_recogida, fecha_hora_devolucion
  const response = await bookingApi.get('/marketplace/vehiculos', {
    params: {
      id_localizacion_recogida: idLocalizacionRecogida,
      fecha_hora_recogida: fechaRecogida,
      fecha_hora_devolucion: fechaDevolucion,
    },
  })
  return response.data.data
}

export async function getVehiculoDetalle(vehiculoId) {
  const response = await bookingApi.get(`/marketplace/vehiculos/${vehiculoId}`)
  return response.data.data
}

export async function verificarDisponibilidad(vehiculoId, { fechaRecogida, fechaDevolucion }) {
  // El controller espera: fecha_hora_recogida, fecha_hora_devolucion
  const response = await bookingApi.get(`/marketplace/vehiculos/${vehiculoId}/disponible`, {
    params: {
      fecha_hora_recogida: fechaRecogida,
      fecha_hora_devolucion: fechaDevolucion,
    },
  })
  return response.data.data
}

// ─── Localizaciones ───────────────────────────────────────────────────────────

export async function getLocalizaciones() {
  const response = await bookingApi.get('/marketplace/localizaciones')
  const data = response.data.data
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') return Object.values(data)
  return []
}

// ─── Categorías ───────────────────────────────────────────────────────────────
// Las categorías siguen en el controller Internal con [Authorize].
// Se usan como filtro opcional — si falla silencia el error, no bloquea el buscador.

export async function getCategorias() {
  try {
    const response = await bookingApi.get('/marketplace/categorias-vehiculo')
    const data = response.data.data
    if (Array.isArray(data)) return data
    if (data && typeof data === 'object') return Object.values(data)
    return []
  } catch {
    return []
  }
}

// ─── Extras ───────────────────────────────────────────────────────────────────

export async function getExtras() {
  const response = await bookingApi.get('/marketplace/extras')
  const data = response.data.data
  // El backend puede devolver array directo o un objeto con índices numéricos
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') return Object.values(data)
  return []
}

// ─── Clientes ─────────────────────────────────────────────────────────────────

export async function getClientePorCorreo(correo) {
  const response = await bookingApi.get(`/marketplace/clientes/correo/${encodeURIComponent(correo)}`)
  return response.data.data
}

export async function crearClientePublico(datos) {
  // El validator exige estos campos aunque el controller los sobreescriba
  const payload = {
    ...datos,
    estado: datos.estado || 'ACT',
    creado_por_usuario: 'BOOKING_WEB',
    modificacion_ip: '0.0.0.0',
    servicio_origen: 'WEB',
  }
  const response = await bookingApi.post('/marketplace/clientes', payload)
  return response.data
}

// ─── Conductores ──────────────────────────────────────────────────────────────

export async function getConductorPorLicencia(numeroLicencia) {
  const response = await bookingApi.get(`/marketplace/conductores/licencia/${encodeURIComponent(numeroLicencia)}`)
  return response.data.data
}

// DESPUÉS
export async function crearConductorPublico(datos) {
  const payload = {
    ...datos,
    // En Ecuador numero_licencia = numero_identificacion
    numero_licencia: datos.numero_licencia || datos.numero_identificacion,
    codigo_conductor: datos.codigo_conductor || `CW-${Date.now().toString().slice(-8)}`,
    creado_por_usuario: 'BOOKING_WEB',
    modificado_desde_ip: '0.0.0.0',
    origen_registro: 'WEB',
    estado_conductor: datos.estado_conductor || 'ACT',
  }
  const response = await bookingApi.post('/marketplace/conductores', payload)
  return response.data
}

// ─── Reservas ─────────────────────────────────────────────────────────────────

export async function crearReservaPublica(datos) {
  // La auditoría (creado_por_usuario, servicio_origen, ip) la setea el controller.
  // Solo enviamos los datos de negocio de la reserva.
  const payload = {
    ...datos,
    origen_canal_reserva: 'WEB',
    estado_reserva: 'PEN',
    conductores: (datos.conductores || []).map((item, i) => ({
      ...item,
      tipo_conductor: i === 0 ? 'PRI' : 'ADI',
      es_principal: i === 0,
      estado_reserva_conductor: item.estado_reserva_conductor || 'ACT',
    })),
    extras: (datos.extras || []).map(item => ({
      ...item,
      estado_reserva_extra: item.estado_reserva_extra || 'ACT',
    })),
  }
  const response = await bookingApi.post('/marketplace/reservas', payload)
  return response.data
}

// ─── Confirmar Reserva ───────────────────────────────────────────────────────────

export async function confirmarReservaPublica(idReserva) {
  const response = await bookingApi.post(`/marketplace/reservas/${idReserva}/confirmar`)
  return response.data
}

// ─── Facturas ─────────────────────────────────────────────────────────────────

export async function crearFacturaPublica(datos) {
  const payload = {
    ...datos,
    creado_por_usuario: 'BOOKING_WEB',
    modificacion_ip: '0.0.0.0',
    servicio_origen: 'WEB',
  }
  const response = await bookingApi.post('/marketplace/facturas', payload)
  return response.data
}