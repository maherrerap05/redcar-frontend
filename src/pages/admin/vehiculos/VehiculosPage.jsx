import { useEffect, useState, useCallback } from 'react'
import { getVehiculos, eliminarVehiculo, buscarVehiculos } from '../../../api/vehiculosApi'
import { leerMensajeError } from '../../../api/manejarError'
import useAuthStore from '../../../store/useAuthStore'
import useToast from '../../../hooks/useToast'
import Toast from '../../../components/ui/Toast'
import Paginacion from '../../../components/ui/Paginacion'
import FiltrosVehiculos from '../../../components/ui/FiltrosVehiculos'
import VehiculoFormModal from './VehiculoFormModal'
import EliminarModal from './EliminarModal'
import VehiculoDetalleModal from './VehiculoDetalleModal'
import styles from './VehiculosPage.module.css'

const TAMANO_PAGINA = 10

function VehiculosPage() {
  const { usuario } = useAuthStore()
  const [vehiculos, setVehiculos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalRegistros, setTotalRegistros] = useState(0)
  const [filtrosActivos, setFiltrosActivos] = useState(false)
  const [filtrosActuales, setFiltrosActuales] = useState(null)
  const [modalForm, setModalForm] = useState({ abierto: false, vehiculo: null })
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, vehiculo: null })
  const [modalVer, setModalVer] = useState({ abierto: false, vehiculo: null })
  const { toast, mostrarToast, cerrarToast } = useToast()

  const cargarVehiculos = useCallback(async (pagina = 1) => {
    try {
      setCargando(true)
      setError('')
      const resultado = await getVehiculos(pagina, TAMANO_PAGINA)
      setVehiculos(resultado.items)
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

  useEffect(() => { cargarVehiculos(1) }, [cargarVehiculos])

  async function handleBuscar(payload) {
    try {
      setCargando(true)
      setError('')
      const resultado = await buscarVehiculos({ ...payload, page_number: 1, page_size: TAMANO_PAGINA })
      setVehiculos(resultado.items)
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
      const payload = { ...filtrosActuales, page_number: nuevaPagina, page_size: TAMANO_PAGINA }
      try {
        setCargando(true)
        const resultado = await buscarVehiculos(payload)
        setVehiculos(resultado.items)
        setTotalPaginas(resultado.totalPaginas)
        setPaginaActual(resultado.paginaActual)
      } catch (err) {
        setError(leerMensajeError(err))
      } finally {
        setCargando(false)
      }
    } else {
      cargarVehiculos(nuevaPagina)
    }
  }

  function abrirCrear() { setModalForm({ abierto: true, vehiculo: null }) }
  function abrirEditar(v) { setModalForm({ abierto: true, vehiculo: v }) }
  function abrirEliminar(v) { setModalEliminar({ abierto: true, vehiculo: v }) }
  function abrirVer(v) { setModalVer({ abierto: true, vehiculo: v }) }

  function cerrarModales() {
    setModalForm({ abierto: false, vehiculo: null })
    setModalEliminar({ abierto: false, vehiculo: null })
    setModalVer({ abierto: false, vehiculo: null })
  }

  async function handleEliminar(motivo) {
    try {
      await eliminarVehiculo(modalEliminar.vehiculo.id_vehiculo, motivo, usuario)
      cerrarModales()
      cargarVehiculos(paginaActual)
      mostrarToast('Vehículo eliminado correctamente.')
    } catch (err) {
      cerrarModales()
      mostrarToast(leerMensajeError(err), 'error')
    }
  }

  function handleGuardado(esEdicion) {
    cerrarModales()
    cargarVehiculos(esEdicion ? paginaActual : 1)
    mostrarToast(esEdicion ? 'Vehículo actualizado correctamente.' : 'Vehículo creado correctamente.')
  }

  function estadoBadge(estado) {
    if (estado === 'ACT') return <span className={`${styles.badge} ${styles.activo}`}>Activo</span>
    return <span className={`${styles.badge} ${styles.inactivo}`}>Inactivo</span>
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.titulo}>Vehículos</h1>
          <p className={styles.subtitulo}>
            Gestión del catálogo de vehículos
            {filtrosActivos
              ? <span className={styles.filtroActivo}> · Mostrando resultados filtrados</span>
              : totalRegistros > 0 && <span> · {totalRegistros} registros</span>
            }
          </p>
        </div>
        <button className={styles.btnPrimario} onClick={abrirCrear}>
          + Nuevo vehículo
        </button>
      </div>

      <FiltrosVehiculos
        onBuscar={handleBuscar}
        onLimpiar={() => cargarVehiculos(1)}
      />

      {error && <div className={styles.error}>{error}</div>}

      {cargando ? (
        <div className={styles.cargando}>Cargando vehículos...</div>
      ) : vehiculos.length === 0 ? (
        <div className={styles.cargando}>
          {filtrosActivos
            ? 'No se encontraron vehículos con los filtros aplicados.'
            : 'No hay vehículos registrados.'}
        </div>
      ) : (
        <>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Placa</th>
                  <th>Modelo</th>
                  <th>Año</th>
                  <th>Transmisión</th>
                  <th>Combustible</th>
                  <th>Precio/día</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {vehiculos.map((v) => (
                  <tr key={v.id_vehiculo}>
                    <td>{v.codigo_interno_vehiculo}</td>
                    <td>{v.placa_vehiculo}</td>
                    <td>{v.modelo_vehiculo}</td>
                    <td>{v.anio_fabricacion}</td>
                    <td>{v.tipo_transmision}</td>
                    <td>{v.tipo_combustible}</td>
                    <td>${v.precio_base_dia}</td>
                    <td>{estadoBadge(v.estado_vehiculo)}</td>
                    <td>
                      <div className={styles.acciones}>
                        <button className={styles.btnVer} onClick={() => abrirVer(v)}>Ver</button>
                        <button
                          className={styles.btnEditar}
                          onClick={() => abrirEditar(v)}
                          disabled={v.estado_vehiculo !== 'ACT'}
                        >Editar</button>
                        <button
                          className={styles.btnEliminar}
                          onClick={() => abrirEliminar(v)}
                          disabled={v.estado_vehiculo !== 'ACT'}
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
        <VehiculoFormModal
          vehiculo={modalForm.vehiculo}
          onCerrar={cerrarModales}
          onGuardado={handleGuardado}
        />
      )}

      {modalEliminar.abierto && (
        <EliminarModal
          nombre={`${modalEliminar.vehiculo.codigo_interno_vehiculo} - ${modalEliminar.vehiculo.modelo_vehiculo}`}
          onCerrar={cerrarModales}
          onConfirmar={handleEliminar}
        />
      )}

      {modalVer.abierto && (
        <VehiculoDetalleModal
          vehiculo={modalVer.vehiculo}
          onCerrar={cerrarModales}
        />
      )}

      {toast && (
        <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrarToast} />
      )}
    </div>
  )
}

export default VehiculosPage