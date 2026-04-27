import { useState, useEffect } from 'react'
import { getReservaPorId } from '../../../api/reservasApi'
import { getVehiculoPorId } from '../../../api/vehiculosApi'
import { getLocalizaciones } from '../../../api/localizacionesApi'
import { buscarClientes } from '../../../api/clientesApi'
import { getExtras } from '../../../api/extrasApi'
import { getConductorPorId } from '../../../api/conductoresApi'
import styles from './ReservaDetalleModal.module.css'

function campo(label, valor) {
  return (
    <div className={styles.campo}>
      <span className={styles.campoLabel}>{label}</span>
      <span className={styles.campoValor}>{valor ?? '—'}</span>
    </div>
  )
}

function formatFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-EC', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}

function estadoBadge(estado) {
  const map = {
    PEN: { label: 'Pendiente', color: '#D68910', bg: '#FDEBD0' },
    CON: { label: 'Confirmada', color: '#1E8449', bg: '#D5F5E3' },
    CAN: { label: 'Cancelada', color: '#C0392B', bg: '#FADBD8' },
  }
  const { label, color, bg } = map[estado] || { label: estado, color: '#666', bg: '#eee' }
  return (
    <span style={{
      background: bg, color, padding: '0.2rem 0.65rem',
      borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600
    }}>{label}</span>
  )
}

function ReservaDetalleModal({ reserva: reservaResumen, onCerrar }) {
  const [r, setR] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [nombreCliente, setNombreCliente] = useState('Cargando...')
  const [nombreVehiculo, setNombreVehiculo] = useState('Cargando...')
  const [nombreLocRecogida, setNombreLocRecogida] = useState('Cargando...')
  const [nombreLocDevolucion, setNombreLocDevolucion] = useState('Cargando...')
  const [nombresExtras, setNombresExtras] = useState({})
  const [nombresConductores, setNombresConductores] = useState({})

  useEffect(() => {
    async function cargarDetalle() {
      try {
        setCargando(true)
        const reservaCompleta = await getReservaPorId(reservaResumen.id_reserva)
        setR(reservaCompleta)

        const [clienteRes, vehiculoRes, locsRes, extrasRes, conductoresArr] = await Promise.all([
          buscarClientes({ page_number: 1, page_size: 100 }),
          getVehiculoPorId(reservaCompleta.id_vehiculo).catch(() => null),
          getLocalizaciones(),
          reservaCompleta.extras?.length > 0
            ? getExtras(1, 100)
            : Promise.resolve({ items: [] }),
          reservaCompleta.conductores?.length > 0
            ? Promise.all(
                reservaCompleta.conductores.map(c =>
                  getConductorPorId(c.id_conductor).catch(() => null)
                )
              )
            : Promise.resolve([]),
        ])

        // Cliente
        const cliente = clienteRes.items?.find(c => c.id_cliente === reservaCompleta.id_cliente)
        setNombreCliente(cliente
          ? `${cliente.nombres} ${cliente.apellidos}`
          : `ID ${reservaCompleta.id_cliente}`)

        // Vehículo
        if (vehiculoRes) {
          setNombreVehiculo(`${vehiculoRes.modelo_vehiculo} — ${vehiculoRes.placa_vehiculo}`)
        } else {
          setNombreVehiculo(`ID ${reservaCompleta.id_vehiculo}`)
        }

        // Localizaciones
        const locs = Array.isArray(locsRes) ? locsRes : []
        const locRecogida = locs.find(l => l.id_localizacion === reservaCompleta.id_localizacion_recogida)
        const locDevolucion = locs.find(l => l.id_localizacion === reservaCompleta.id_localizacion_devolucion)
        setNombreLocRecogida(locRecogida?.nombre_localizacion ?? `ID ${reservaCompleta.id_localizacion_recogida}`)
        setNombreLocDevolucion(locDevolucion?.nombre_localizacion ?? `ID ${reservaCompleta.id_localizacion_devolucion}`)

        // Extras
        if (extrasRes.items?.length > 0 && reservaCompleta.extras?.length > 0) {
          const mapaExtras = {}
          reservaCompleta.extras.forEach(e => {
            const extra = extrasRes.items.find(ex => ex.id_extra === e.id_extra)
            mapaExtras[e.id_extra] = extra?.nombre_extra ?? `ID ${e.id_extra}`
          })
          setNombresExtras(mapaExtras)
        }

        // Conductores — conductoresArr es un array de objetos conductor (uno por cada conductor de la reserva)
        if (conductoresArr.length > 0 && reservaCompleta.conductores?.length > 0) {
          const mapaConductores = {}
          reservaCompleta.conductores.forEach((c, index) => {
            const conductor = conductoresArr[index]
            mapaConductores[c.id_conductor] = conductor
              ? `${conductor.con_nombre1} ${conductor.con_apellido1}`
              : `ID ${c.id_conductor}`
          })
          setNombresConductores(mapaConductores)
        }

      } catch {
        setR(reservaResumen)
        setNombreCliente(`ID ${reservaResumen.id_cliente}`)
        setNombreVehiculo(`ID ${reservaResumen.id_vehiculo}`)
        setNombreLocRecogida(`ID ${reservaResumen.id_localizacion_recogida}`)
        setNombreLocDevolucion(`ID ${reservaResumen.id_localizacion_devolucion}`)
      } finally {
        setCargando(false)
      }
    }

    cargarDetalle()
  }, [reservaResumen])

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.titulo}>Detalle de reserva</h2>
          <button className={styles.btnCerrar} onClick={onCerrar}>✕</button>
        </div>

        <div className={styles.cuerpo}>
          {cargando ? (
            <div className={styles.cargando}>Cargando detalle...</div>
          ) : r && (
            <>
              <p className={styles.seccion}>Identificación</p>
              <div className={styles.grid}>
                {campo('ID', r.id_reserva)}
                {campo('Código', r.codigo_reserva)}
                {campo('GUID', r.guid_reserva)}
                <div className={styles.campo}>
                  <span className={styles.campoLabel}>Estado</span>
                  <span>{estadoBadge(r.estado_reserva)}</span>
                </div>
              </div>

              <p className={styles.seccion}>Relaciones</p>
              <div className={styles.grid}>
                {campo('Cliente', nombreCliente)}
                {campo('Vehículo', nombreVehiculo)}
                {campo('Localización recogida', nombreLocRecogida)}
                {campo('Localización devolución', nombreLocDevolucion)}
              </div>

              <p className={styles.seccion}>Fechas</p>
              <div className={styles.grid}>
                {campo('Fecha reserva', formatFecha(r.fecha_reserva_utc))}
                {campo('Recogida', formatFecha(r.fecha_hora_recogida))}
                {campo('Devolución', formatFecha(r.fecha_hora_devolucion))}
                {campo('Días', r.cantidad_dias_reserva)}
                {r.fecha_confirmacion_utc && campo('Confirmación', formatFecha(r.fecha_confirmacion_utc))}
                {r.fecha_cancelacion_utc && campo('Cancelación', formatFecha(r.fecha_cancelacion_utc))}
              </div>

              <p className={styles.seccion}>Valores</p>
              <div className={styles.grid}>
                {campo('Subtotal', `$${r.subtotal_reserva?.toFixed(2) || '0.00'}`)}
                {campo('IVA', `$${r.valor_iva?.toFixed(2) || '0.00'}`)}
                {campo('Total', `$${r.total_reserva?.toFixed(2) || '0.00'}`)}
                {campo('Canal', r.origen_canal_reserva)}
              </div>

              {r.conductores?.length > 0 && (
                <>
                  <p className={styles.seccion}>Conductores asignados</p>
                  <table className={styles.tablaDetalle}>
                    <thead>
                      <tr>
                        <th>Conductor</th>
                        <th>Tipo</th>
                        <th>Principal</th>
                        <th>Estado</th>
                        <th>Fecha asignación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.conductores.map(c => (
                        <tr key={c.id_reserva_conductor}>
                          <td>{nombresConductores[c.id_conductor] || `ID ${c.id_conductor}`}</td>
                          <td>{c.tipo_conductor === 'PRI' ? 'Principal' : 'Adicional'}</td>
                          <td>{c.es_principal ? 'Sí' : 'No'}</td>
                          <td>{c.estado_reserva_conductor}</td>
                          <td>{formatFecha(c.fecha_asignacion_utc)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {r.extras?.length > 0 && (
                <>
                  <p className={styles.seccion}>Extras incluidos</p>
                  <table className={styles.tablaDetalle}>
                    <thead>
                      <tr>
                        <th>Extra</th>
                        <th>Cantidad</th>
                        <th>Valor unitario</th>
                        <th>Subtotal</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.extras.map(e => (
                        <tr key={e.id_reserva_extra}>
                          <td>{nombresExtras[e.id_extra] || `ID ${e.id_extra}`}</td>
                          <td>{e.cantidad}</td>
                          <td>${e.valor_unitario_extra?.toFixed(2)}</td>
                          <td>${e.subtotal_extra?.toFixed(2)}</td>
                          <td>{e.estado_reserva_extra}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {r.observaciones_reserva && (
                <>
                  <p className={styles.seccion}>Observaciones</p>
                  <p className={styles.observaciones}>{r.observaciones_reserva}</p>
                </>
              )}

              {r.motivo_cancelacion && (
                <>
                  <p className={styles.seccion}>Motivo cancelación</p>
                  <p className={styles.observaciones}>{r.motivo_cancelacion}</p>
                </>
              )}

              <p className={styles.seccion}>Auditoría</p>
              <div className={styles.grid}>
                {campo('Creado por', r.creado_por_usuario)}
                {campo('Fecha registro', formatFecha(r.fecha_registro_utc))}
                {campo('Modificado por', r.modificado_por_usuario)}
                {campo('Fecha modificación', formatFecha(r.fecha_modificacion_utc))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReservaDetalleModal