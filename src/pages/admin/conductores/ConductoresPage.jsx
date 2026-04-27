import { useEffect, useState, useCallback } from 'react'
import { getConductores, buscarConductores, eliminarConductor } from '../../../api/conductoresApi'
import { leerMensajeError } from '../../../api/manejarError'
import useToast from '../../../hooks/useToast'
import Toast from '../../../components/ui/Toast'
import Paginacion from '../../../components/ui/Paginacion'
import FiltrosConductores from '../../../components/ui/FiltrosConductores'
import ConductorFormModal from './ConductorFormModal'
import EliminarModal from '../vehiculos/EliminarModal'
import ConductorDetalleModal from './ConductorDetalleModal'
import styles from './ConductoresPage.module.css'

const TAMANO_PAGINA = 10

function ConductoresPage() {
  const [conductores, setConductores] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalRegistros, setTotalRegistros] = useState(0)
  const [filtrosActivos, setFiltrosActivos] = useState(false)
  const [filtrosActuales, setFiltrosActuales] = useState(null)
  const [modalForm, setModalForm] = useState({ abierto: false, conductor: null })
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, conductor: null })
  const [modalVer, setModalVer] = useState({ abierto: false, conductor: null })
  const { toast, mostrarToast, cerrarToast } = useToast()

  const cargarConductores = useCallback(async (pagina = 1) => {
    try {
      setCargando(true)
      setError('')
      const resultado = await getConductores(pagina, TAMANO_PAGINA)
      setConductores(resultado.items)
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

  useEffect(() => { cargarConductores(1) }, [cargarConductores])

  async function handleBuscar(payload) {
    try {
      setCargando(true)
      setError('')
      const resultado = await buscarConductores(payload)
      setConductores(resultado.items)
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
      cargarConductores(nuevaPagina)
    }
  }

  function abrirCrear() { setModalForm({ abierto: true, conductor: null }) }
  function abrirEditar(c) { setModalForm({ abierto: true, conductor: c }) }
  function abrirEliminar(c) { setModalEliminar({ abierto: true, conductor: c }) }
  function abrirVer(c) { setModalVer({ abierto: true, conductor: c }) }

  function cerrarModales() {
    setModalForm({ abierto: false, conductor: null })
    setModalEliminar({ abierto: false, conductor: null })
    setModalVer({ abierto: false, conductor: null })
  }

  async function handleEliminar(motivo) {
    try {
      await eliminarConductor(modalEliminar.conductor.id_conductor, motivo)
      cerrarModales()
      cargarConductores(paginaActual)
      mostrarToast('Conductor eliminado correctamente.')
    } catch (err) {
      cerrarModales()
      mostrarToast(leerMensajeError(err), 'error')
    }
  }

  function handleGuardado(esEdicion) {
    cerrarModales()
    cargarConductores(esEdicion ? paginaActual : 1)
    mostrarToast(esEdicion ? 'Conductor actualizado correctamente.' : 'Conductor creado correctamente.')
  }

  function estadoBadge(estado) {
    if (estado === 'ACT') return <span className={`${styles.badge} ${styles.activo}`}>Activo</span>
    return <span className={`${styles.badge} ${styles.inactivo}`}>Inactivo</span>
  }

  function licenciaVencida(fecha) {
    if (!fecha) return false
    return new Date(fecha) < new Date()
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.titulo}>Conductores</h1>
          <p className={styles.subtitulo}>
            Gestión del registro de conductores
            {filtrosActivos
              ? <span className={styles.filtroActivo}> · Mostrando resultados filtrados</span>
              : totalRegistros > 0 && <span> · {totalRegistros} registros</span>
            }
          </p>
        </div>
        <button className={styles.btnPrimario} onClick={abrirCrear}>
          + Nuevo conductor
        </button>
      </div>

      <FiltrosConductores
        onBuscar={handleBuscar}
        onLimpiar={() => cargarConductores(1)}
      />

      {error && <div className={styles.error}>{error}</div>}

      {cargando ? (
        <div className={styles.cargando}>Cargando conductores...</div>
      ) : conductores.length === 0 ? (
        <div className={styles.cargando}>
          {filtrosActivos
            ? 'No se encontraron conductores con los filtros aplicados.'
            : 'No hay conductores registrados.'}
        </div>
      ) : (
        <>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombres</th>
                  <th>Apellidos</th>
                  <th>Identificación</th>
                  <th>Licencia</th>
                  <th>Vence</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {conductores.map((c) => (
                  <tr key={c.id_conductor}>
                    <td>{c.codigo_conductor}</td>
                    <td>{c.con_nombre1} {c.con_nombre2}</td>
                    <td>{c.con_apellido1} {c.con_apellido2}</td>
                    <td>{c.numero_identificacion}</td>
                    <td>{c.numero_licencia}</td>
                    <td>
                      <span className={licenciaVencida(c.fecha_vencimiento_licencia) ? styles.vencida : ''}>
                        {c.fecha_vencimiento_licencia
                          ? new Date(c.fecha_vencimiento_licencia).toLocaleDateString('es-EC')
                          : '—'}
                      </span>
                    </td>
                    <td>{estadoBadge(c.estado_conductor)}</td>
                    <td>
                      <div className={styles.acciones}>
                        <button className={styles.btnVer} onClick={() => abrirVer(c)}>Ver</button>
                        <button
                          className={styles.btnEditar}
                          onClick={() => abrirEditar(c)}
                          disabled={c.estado_conductor !== 'ACT'}
                        >Editar</button>
                        <button
                          className={styles.btnEliminar}
                          onClick={() => abrirEliminar(c)}
                          disabled={c.estado_conductor !== 'ACT'}
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
        <ConductorFormModal
          conductor={modalForm.conductor}
          onCerrar={cerrarModales}
          onGuardado={handleGuardado}
        />
      )}

      {modalEliminar.abierto && (
        <EliminarModal
          nombre={`${modalEliminar.conductor.con_nombre1} ${modalEliminar.conductor.con_apellido1}`}
          onCerrar={cerrarModales}
          onConfirmar={handleEliminar}
        />
      )}

      {modalVer.abierto && (
        <ConductorDetalleModal
          conductor={modalVer.conductor}
          onCerrar={cerrarModales}
        />
      )}

      {toast && (
        <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrarToast} />
      )}
    </div>
  )
}

export default ConductoresPage