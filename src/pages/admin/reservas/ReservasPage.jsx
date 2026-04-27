import { useEffect, useState, useCallback } from 'react'
import { getReservas, buscarReservas, eliminarReserva, confirmarReserva } from '../../../api/reservasApi'
import { crearFactura } from '../../../api/facturasApi'
import { leerMensajeError } from '../../../api/manejarError'
import useAuthStore from '../../../store/useAuthStore'
import useToast from '../../../hooks/useToast'
import Toast from '../../../components/ui/Toast'
import Paginacion from '../../../components/ui/Paginacion'
import FiltrosReservas from '../../../components/ui/FiltrosReservas'
import ReservaFormModal from './ReservaFormModal'
import ReservaDetalleModal from './ReservaDetalleModal'
import ConfirmarReservaModal from './ConfirmarReservaModal'
import EliminarModal from '../vehiculos/EliminarModal'
import styles from './ReservasPage.module.css'

const TAMANO_PAGINA = 10

function ReservasPage() {
  const { usuario } = useAuthStore()
  const [reservas, setReservas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalRegistros, setTotalRegistros] = useState(0)
  const [filtrosActivos, setFiltrosActivos] = useState(false)
  const [filtrosActuales, setFiltrosActuales] = useState(null)
  const [modalForm, setModalForm] = useState({ abierto: false, reserva: null })
  const [modalVer, setModalVer] = useState({ abierto: false, reserva: null })
  const [modalConfirmar, setModalConfirmar] = useState({ abierto: false, reserva: null })
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, reserva: null })
  const { toast, mostrarToast, cerrarToast } = useToast()

  const cargarReservas = useCallback(async (pagina = 1) => {
    try {
      setCargando(true)
      setError('')
      const resultado = await getReservas(pagina, TAMANO_PAGINA)
      setReservas(resultado.items)
      setTotalPaginas(resultado.totalPaginas)
      setTotalRegistros(resultado.totalRegistros)
      setPaginaActual(resultado.paginaActual)
      setFiltrosActivos(false)
      setFiltrosActuales(null)
    } catch (err) {
      setError(leerMensajeError(err))
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargarReservas(1) }, [cargarReservas])

  async function handleBuscar(payload) {
    try {
      setCargando(true)
      setError('')
      const resultado = await buscarReservas(payload)
      setReservas(resultado.items)
      setTotalPaginas(resultado.totalPaginas)
      setTotalRegistros(resultado.totalRegistros)
      setPaginaActual(resultado.paginaActual)
      setFiltrosActivos(true)
      setFiltrosActuales(payload)
    } catch (err) {
      setError(leerMensajeError(err))
    } finally {
      setCargando(false)
    }
  }

  async function handleCambiarPagina(nuevaPagina) {
    if (filtrosActivos && filtrosActuales) {
      const payload = { ...filtrosActuales, page_number: nuevaPagina }
      await handleBuscar(payload)
    } else {
      cargarReservas(nuevaPagina)
    }
  }

  function abrirCrear() { setModalForm({ abierto: true, reserva: null }) }
  function abrirEditar(r) { setModalForm({ abierto: true, reserva: r }) }
  function abrirVer(r) { setModalVer({ abierto: true, reserva: r }) }
  function abrirConfirmar(r) { setModalConfirmar({ abierto: true, reserva: r }) }
  function abrirEliminar(r) { setModalEliminar({ abierto: true, reserva: r }) }

  function cerrarModales() {
    setModalForm({ abierto: false, reserva: null })
    setModalVer({ abierto: false, reserva: null })
    setModalConfirmar({ abierto: false, reserva: null })
    setModalEliminar({ abierto: false, reserva: null })
  }

  async function handleConfirmar(reserva) {
    try {
      await confirmarReserva(reserva.id_reserva)

      try {
        await crearFactura({
          numero_factura: `FAC-${reserva.codigo_reserva}`,
          id_reserva: reserva.id_reserva,
          observaciones_factura: `Factura generada automáticamente al confirmar reserva ${reserva.codigo_reserva}`,
          origen_canal_factura: 'ADMIN',
          estado: 'ABI',
        }, usuario)
        mostrarToast('Reserva confirmada y factura generada correctamente.')
      } catch {
        mostrarToast('Reserva confirmada. Advertencia: no se pudo generar la factura automáticamente.', 'error')
      }

      cerrarModales()
      cargarReservas(paginaActual)
    } catch (err) {
      cerrarModales()
      mostrarToast(leerMensajeError(err), 'error')
    }
  }

  async function handleEliminar(motivo) {
    try {
      await eliminarReserva(modalEliminar.reserva.id_reserva, motivo)
      cerrarModales()
      cargarReservas(paginaActual)
      mostrarToast('Reserva eliminada correctamente.')
    } catch (err) {
      cerrarModales()
      mostrarToast(leerMensajeError(err), 'error')
    }
  }

  function handleGuardado(esEdicion) {
    cerrarModales()
    cargarReservas(esEdicion ? paginaActual : 1)
    mostrarToast(esEdicion ? 'Reserva actualizada correctamente.' : 'Reserva creada correctamente.')
  }

  function estadoBadge(estado) {
    const map = {
      PEN: { label: 'Pendiente', clase: styles.pendiente },
      CON: { label: 'Confirmada', clase: styles.confirmada },
      CAN: { label: 'Cancelada', clase: styles.cancelada },
    }
    const { label, clase } = map[estado] || { label: estado, clase: '' }
    return <span className={`${styles.badge} ${clase}`}>{label}</span>
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.titulo}>Reservas</h1>
          <p className={styles.subtitulo}>
            Gestión de reservas de vehículos
            {filtrosActivos
              ? <span className={styles.filtroActivo}> · Mostrando resultados filtrados</span>
              : totalRegistros > 0 && <span> · {totalRegistros} registros</span>
            }
          </p>
        </div>
        <button className={styles.btnPrimario} onClick={abrirCrear}>
          + Nueva reserva
        </button>
      </div>

      <FiltrosReservas
        onBuscar={handleBuscar}
        onLimpiar={() => cargarReservas(1)}
      />

      {error && <div className={styles.error}>{error}</div>}

      {cargando ? (
        <div className={styles.cargando}>Cargando reservas...</div>
      ) : reservas.length === 0 ? (
        <div className={styles.cargando}>
          {filtrosActivos
            ? 'No se encontraron reservas con los filtros aplicados.'
            : 'No hay reservas registradas.'}
        </div>
      ) : (
        <>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Cliente ID</th>
                  <th>Vehículo ID</th>
                  <th>Recogida</th>
                  <th>Devolución</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((r) => (
                  <tr key={r.id_reserva}>
                    <td>{r.codigo_reserva}</td>
                    <td>{r.id_cliente}</td>
                    <td>{r.id_vehiculo}</td>
                    <td>{r.fecha_hora_recogida
                      ? new Date(r.fecha_hora_recogida).toLocaleDateString('es-EC')
                      : '—'}</td>
                    <td>{r.fecha_hora_devolucion
                      ? new Date(r.fecha_hora_devolucion).toLocaleDateString('es-EC')
                      : '—'}</td>
                    <td>${r.total_reserva?.toFixed(2) || '0.00'}</td>
                    <td>{estadoBadge(r.estado_reserva)}</td>
                    <td>
                      <div className={styles.acciones}>
                        <button className={styles.btnVer}
                          onClick={() => abrirVer(r)}>Ver</button>
                        {r.estado_reserva === 'PEN' && (
                          <>
                            <button className={styles.btnConfirmar}
                              onClick={() => abrirConfirmar(r)}>Confirmar</button>
                            <button className={styles.btnEditar}
                              onClick={() => abrirEditar(r)}>Editar</button>
                          </>
                        )}
                        <button
                          className={styles.btnEliminar}
                          onClick={() => abrirEliminar(r)}
                          disabled={r.estado_reserva === 'CAN' || r.es_eliminado}
                        >Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Paginacion
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            onCambiar={handleCambiarPagina}
          />
        </>
      )}

      {modalForm.abierto && (
        <ReservaFormModal
          reserva={modalForm.reserva}
          onCerrar={cerrarModales}
          onGuardado={handleGuardado}
        />
      )}

      {modalVer.abierto && (
        <ReservaDetalleModal
          reserva={modalVer.reserva}
          onCerrar={cerrarModales}
        />
      )}

      {modalConfirmar.abierto && (
        <ConfirmarReservaModal
          reserva={modalConfirmar.reserva}
          onCerrar={cerrarModales}
          onConfirmar={handleConfirmar}
        />
      )}

      {modalEliminar.abierto && (
        <EliminarModal
          nombre={`Reserva ${modalEliminar.reserva.codigo_reserva}`}
          onCerrar={cerrarModales}
          onConfirmar={handleEliminar}
        />
      )}

      {toast && (
        <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrarToast} />
      )}
    </div>
  )
}

export default ReservasPage