import { useEffect, useState, useCallback } from 'react'
import { getExtras, buscarExtras, eliminarExtra } from '../../../api/extrasApi'
import { leerMensajeError } from '../../../api/manejarError'
import useAuthStore from '../../../store/useAuthStore'
import useToast from '../../../hooks/useToast'
import Toast from '../../../components/ui/Toast'
import Paginacion from '../../../components/ui/Paginacion'
import FiltrosExtras from '../../../components/ui/FiltrosExtras'
import ExtraFormModal from './ExtraFormModal'
import EliminarModal from '../vehiculos/EliminarModal'
import ExtraDetalleModal from './ExtraDetalleModal'
import styles from './ExtrasPage.module.css'

const TAMANO_PAGINA = 10

function ExtrasPage() {
  const { usuario } = useAuthStore()
  const [extras, setExtras] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalRegistros, setTotalRegistros] = useState(0)
  const [filtrosActivos, setFiltrosActivos] = useState(false)
  const [filtrosActuales, setFiltrosActuales] = useState(null)
  const [modalForm, setModalForm] = useState({ abierto: false, extra: null })
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, extra: null })
  const [modalVer, setModalVer] = useState({ abierto: false, extra: null })
  const { toast, mostrarToast, cerrarToast } = useToast()

  const cargarExtras = useCallback(async (pagina = 1) => {
    try {
      setCargando(true)
      setError('')
      const resultado = await getExtras(pagina, TAMANO_PAGINA)
      setExtras(resultado.items)
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

  useEffect(() => { cargarExtras(1) }, [cargarExtras])

  async function handleBuscar(payload) {
    try {
      setCargando(true)
      setError('')
      const resultado = await buscarExtras(payload)
      setExtras(resultado.items)
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
      await cargarExtras(nuevaPagina)
    }
  }

  function abrirCrear() { setModalForm({ abierto: true, extra: null }) }
  function abrirEditar(e) { setModalForm({ abierto: true, extra: e }) }
  function abrirEliminar(e) { setModalEliminar({ abierto: true, extra: e }) }
  function abrirVer(e) { setModalVer({ abierto: true, extra: e }) }

  function cerrarModales() {
    setModalForm({ abierto: false, extra: null })
    setModalEliminar({ abierto: false, extra: null })
    setModalVer({ abierto: false, extra: null })
  }

  async function handleEliminar(motivo) {
    try {
      await eliminarExtra(modalEliminar.extra.id_extra, motivo)
      cerrarModales()
      cargarExtras(paginaActual)
      mostrarToast('Extra eliminado correctamente.')
    } catch (err) {
      cerrarModales()
      mostrarToast(leerMensajeError(err), 'error')
    }
  }

  function handleGuardado(esEdicion) {
    cerrarModales()
    cargarExtras(esEdicion ? paginaActual : 1)
    mostrarToast(esEdicion ? 'Extra actualizado correctamente.' : 'Extra creado correctamente.')
  }

  function estadoBadge(estado) {
    if (estado === 'ACT') return <span className={`${styles.badge} ${styles.activo}`}>Activo</span>
    return <span className={`${styles.badge} ${styles.inactivo}`}>Inactivo</span>
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.titulo}>Extras</h1>
          <p className={styles.subtitulo}>
            Gestión de extras disponibles para reservas
            {filtrosActivos
              ? <span className={styles.filtroActivo}> · Mostrando resultados filtrados</span>
              : totalRegistros > 0 && <span> · {totalRegistros} registros</span>
            }
          </p>
        </div>
        <button className={styles.btnPrimario} onClick={abrirCrear}>
          + Nuevo extra
        </button>
      </div>

      <FiltrosExtras
        onBuscar={handleBuscar}
        onLimpiar={() => cargarExtras(1)}
      />

      {error && <div className={styles.error}>{error}</div>}

      {cargando ? (
        <div className={styles.cargando}>Cargando extras...</div>
      ) : extras.length === 0 ? (
        <div className={styles.cargando}>
          {filtrosActivos
            ? 'No se encontraron extras con los filtros aplicados.'
            : 'No hay extras registrados.'}
        </div>
      ) : (
        <>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Valor fijo ($)</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {extras.map((e) => (
                  <tr key={e.id_extra}>
                    <td>{e.codigo_extra}</td>
                    <td>{e.nombre_extra}</td>
                    <td>{e.descripcion_extra || '—'}</td>
                    <td>${e.valor_fijo}</td>
                    <td>{estadoBadge(e.estado_extra)}</td>
                    <td>
                      <div className={styles.acciones}>
                        <button className={styles.btnVer} onClick={() => abrirVer(e)}>Ver</button>
                        <button
                          className={styles.btnEditar}
                          onClick={() => abrirEditar(e)}
                          disabled={e.estado_extra !== 'ACT'}
                        >Editar</button>
                        <button
                          className={styles.btnEliminar}
                          onClick={() => abrirEliminar(e)}
                          disabled={e.estado_extra !== 'ACT'}
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
        <ExtraFormModal
          extra={modalForm.extra}
          onCerrar={cerrarModales}
          onGuardado={handleGuardado}
        />
      )}

      {modalEliminar.abierto && (
        <EliminarModal
          nombre={`${modalEliminar.extra.codigo_extra} - ${modalEliminar.extra.nombre_extra}`}
          onCerrar={cerrarModales}
          onConfirmar={handleEliminar}
        />
      )}

      {modalVer.abierto && (
        <ExtraDetalleModal
          extra={modalVer.extra}
          onCerrar={cerrarModales}
        />
      )}

      {toast && (
        <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrarToast} />
      )}
    </div>
  )
}

export default ExtrasPage