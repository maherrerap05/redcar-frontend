import { useEffect, useState, useCallback } from 'react'
import { getFacturas, buscarFacturas, aprobarFactura, eliminarFactura } from '../../../api/facturasApi'
import { leerMensajeError } from '../../../api/manejarError'
import useAuthStore from '../../../store/useAuthStore'
import useToast from '../../../hooks/useToast'
import Toast from '../../../components/ui/Toast'
import Paginacion from '../../../components/ui/Paginacion'
import FiltrosFacturas from '../../../components/ui/FiltrosFacturas'
import FacturaDetalleModal from './FacturaDetalleModal'
import FacturaFormModal from './FacturaFormModal'
import AprobarFacturaModal from './AprobarFacturaModal'
import EliminarModal from '../vehiculos/EliminarModal'
import styles from './FacturasPage.module.css'

const TAMANO_PAGINA = 10

function FacturasPage() {
  const { usuario } = useAuthStore()
  const [facturas, setFacturas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalRegistros, setTotalRegistros] = useState(0)
  const [filtrosActivos, setFiltrosActivos] = useState(false)
  const [filtrosActuales, setFiltrosActuales] = useState(null)
  const [modalVer, setModalVer] = useState({ abierto: false, factura: null })
  const [modalForm, setModalForm] = useState({ abierto: false, factura: null })
  const [modalAprobar, setModalAprobar] = useState({ abierto: false, factura: null })
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, factura: null })
  const { toast, mostrarToast, cerrarToast } = useToast()

  const cargarFacturas = useCallback(async (pagina = 1) => {
    try {
      setCargando(true)
      setError('')
      const resultado = await getFacturas(pagina, TAMANO_PAGINA)
      setFacturas(resultado.items)
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

  useEffect(() => { cargarFacturas(1) }, [cargarFacturas])

  async function handleBuscar(payload) {
    try {
      setCargando(true)
      setError('')
      const resultado = await buscarFacturas(payload)
      setFacturas(resultado.items)
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
      cargarFacturas(nuevaPagina)
    }
  }

  function abrirVer(f) { setModalVer({ abierto: true, factura: f }) }
  function abrirEditar(f) { setModalForm({ abierto: true, factura: f }) }
  function abrirAprobar(f) { setModalAprobar({ abierto: true, factura: f }) }
  function abrirEliminar(f) { setModalEliminar({ abierto: true, factura: f }) }

  function cerrarModales() {
    setModalVer({ abierto: false, factura: null })
    setModalForm({ abierto: false, factura: null })
    setModalAprobar({ abierto: false, factura: null })
    setModalEliminar({ abierto: false, factura: null })
  }

  async function handleAprobar(factura) {
    try {
      await aprobarFactura(factura.id_factura)
      cerrarModales()
      cargarFacturas(paginaActual)
      mostrarToast('Factura aprobada correctamente.')
    } catch (err) {
      cerrarModales()
      mostrarToast(leerMensajeError(err), 'error')
    }
  }

  async function handleEliminar(motivo) {
    try {
      await eliminarFactura(modalEliminar.factura.id_factura, motivo)
      cerrarModales()
      cargarFacturas(paginaActual)
      mostrarToast('Factura eliminada correctamente.')
    } catch (err) {
      cerrarModales()
      mostrarToast(leerMensajeError(err), 'error')
    }
  }

  function handleGuardado() {
    cerrarModales()
    cargarFacturas(paginaActual)
    mostrarToast('Factura actualizada correctamente.')
  }

  function estadoBadge(estado) {
    const map = {
      ABI: { label: 'Abierta',   clase: styles.abierta },
      APR: { label: 'Aprobada',  clase: styles.aprobada },
      INA: { label: 'Eliminada', clase: styles.eliminada },
    }
    const { label, clase } = map[estado] || { label: estado, clase: '' }
    return <span className={`${styles.badge} ${clase}`}>{label}</span>
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.titulo}>Facturas</h1>
          <p className={styles.subtitulo}>
            Gestión de facturas del sistema
            {filtrosActivos
              ? <span className={styles.filtroActivo}> · Mostrando resultados filtrados</span>
              : totalRegistros > 0 && <span> · {totalRegistros} registros</span>
            }
          </p>
        </div>
      </div>

      <FiltrosFacturas
        onBuscar={handleBuscar}
        onLimpiar={() => cargarFacturas(1)}
      />

      {error && <div className={styles.error}>{error}</div>}

      {cargando ? (
        <div className={styles.cargando}>Cargando facturas...</div>
      ) : facturas.length === 0 ? (
        <div className={styles.cargando}>
          {filtrosActivos
            ? 'No se encontraron facturas con los filtros aplicados.'
            : 'No hay facturas registradas.'}
        </div>
      ) : (
        <>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Número</th>
                  <th>ID Reserva</th>
                  <th>Fecha emisión</th>
                  <th>Subtotal</th>
                  <th>IVA</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {facturas.map((f) => (
                  <tr key={f.id_factura}>
                    <td>{f.numero_factura}</td>
                    <td>{f.id_reserva}</td>
                    <td>{f.fecha_emision
                      ? new Date(f.fecha_emision).toLocaleDateString('es-EC')
                      : '—'}</td>
                    <td>${f.subtotal?.toFixed(2) || '0.00'}</td>
                    <td>${f.valor_iva?.toFixed(2) || '0.00'}</td>
                    <td>${f.total?.toFixed(2) || '0.00'}</td>
                    <td>{estadoBadge(f.estado)}</td>
                    <td>
                      <div className={styles.acciones}>
                        <button className={styles.btnVer}
                          onClick={() => abrirVer(f)}>Ver</button>
                        <button
                          className={styles.btnEditar}
                          onClick={() => abrirEditar(f)}
                          disabled={f.estado !== 'ABI'}
                        >Editar</button>
                        <button
                          className={styles.btnAprobar}
                          onClick={() => abrirAprobar(f)}
                          disabled={f.estado !== 'ABI'}
                        >Aprobar</button>
                        <button
                          className={styles.btnEliminar}
                          onClick={() => abrirEliminar(f)}
                          disabled={f.estado !== 'ABI'}
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

      {modalVer.abierto && (
        <FacturaDetalleModal
          factura={modalVer.factura}
          onCerrar={cerrarModales}
        />
      )}

      {modalForm.abierto && (
        <FacturaFormModal
          factura={modalForm.factura}
          onCerrar={cerrarModales}
          onGuardado={handleGuardado}
        />
      )}

      {modalAprobar.abierto && (
        <AprobarFacturaModal
          factura={modalAprobar.factura}
          onCerrar={cerrarModales}
          onAprobar={handleAprobar}
        />
      )}

      {modalEliminar.abierto && (
        <EliminarModal
          nombre={`Factura ${modalEliminar.factura.numero_factura}`}
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

export default FacturasPage