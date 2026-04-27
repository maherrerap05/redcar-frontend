import { useEffect, useState, useCallback } from 'react'
import { getMarcas, buscarMarcas, eliminarMarca } from '../../../api/marcasVehiculoApi'
import { leerMensajeError } from '../../../api/manejarError'
import useToast from '../../../hooks/useToast'
import Toast from '../../../components/ui/Toast'
import Paginacion from '../../../components/ui/Paginacion'
import FiltrosMarcas from '../../../components/ui/FiltrosMarcas'
import MarcaFormModal from './MarcaFormModal'
import EliminarModal from '../vehiculos/EliminarModal'
import MarcaDetalleModal from './MarcaDetalleModal'
import styles from './MarcasPage.module.css'

const TAMANO_PAGINA = 10

function MarcasPage() {
  const [marcas, setMarcas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalRegistros, setTotalRegistros] = useState(0)
  const [filtrosActivos, setFiltrosActivos] = useState(false)
  const [filtrosActuales, setFiltrosActuales] = useState(null)
  const [modalForm, setModalForm] = useState({ abierto: false, marca: null })
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, marca: null })
  const [modalVer, setModalVer] = useState({ abierto: false, marca: null })
  const { toast, mostrarToast, cerrarToast } = useToast()

  const cargarMarcas = useCallback(async (pagina = 1) => {
    try {
      setCargando(true)
      setError('')
      const resultado = await getMarcas(pagina, TAMANO_PAGINA)
      setMarcas(resultado.items)
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

  useEffect(() => { cargarMarcas(1) }, [cargarMarcas])

  async function handleBuscar(payload) {
    try {
      setCargando(true)
      setError('')
      const resultado = await buscarMarcas(payload)
      setMarcas(resultado.items)
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
      cargarMarcas(nuevaPagina)
    }
  }

  function abrirCrear() { setModalForm({ abierto: true, marca: null }) }
  function abrirEditar(m) { setModalForm({ abierto: true, marca: m }) }
  function abrirEliminar(m) { setModalEliminar({ abierto: true, marca: m }) }
  function abrirVer(m) { setModalVer({ abierto: true, marca: m }) }

  function cerrarModales() {
    setModalForm({ abierto: false, marca: null })
    setModalEliminar({ abierto: false, marca: null })
    setModalVer({ abierto: false, marca: null })
  }

  async function handleEliminar(motivo) {
    try {
      await eliminarMarca(modalEliminar.marca.id_marca_vehiculo, motivo)
      cerrarModales()
      cargarMarcas(paginaActual)
      mostrarToast('Marca eliminada correctamente.')
    } catch (err) {
      cerrarModales()
      mostrarToast(leerMensajeError(err), 'error')
    }
  }

  function handleGuardado(esEdicion) {
    cerrarModales()
    cargarMarcas(esEdicion ? paginaActual : 1)
    mostrarToast(esEdicion ? 'Marca actualizada correctamente.' : 'Marca creada correctamente.')
  }

  function estadoBadge(estado) {
    if (estado === 'ACT') return <span className={`${styles.badge} ${styles.activo}`}>Activo</span>
    return <span className={`${styles.badge} ${styles.inactivo}`}>Inactivo</span>
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.titulo}>Marcas de vehículo</h1>
          <p className={styles.subtitulo}>
            Gestión de marcas del catálogo
            {filtrosActivos
              ? <span className={styles.filtroActivo}> · Mostrando resultados filtrados</span>
              : totalRegistros > 0 && <span> · {totalRegistros} registros</span>
            }
          </p>
        </div>
        <button className={styles.btnPrimario} onClick={abrirCrear}>
          + Nueva marca
        </button>
      </div>

      <FiltrosMarcas
        onBuscar={handleBuscar}
        onLimpiar={() => cargarMarcas(1)}
      />

      {error && <div className={styles.error}>{error}</div>}

      {cargando ? (
        <div className={styles.cargando}>Cargando marcas...</div>
      ) : marcas.length === 0 ? (
        <div className={styles.cargando}>
          {filtrosActivos
            ? 'No se encontraron marcas con los filtros aplicados.'
            : 'No hay marcas registradas.'}
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
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {marcas.map((m) => (
                  <tr key={m.id_marca_vehiculo}>
                    <td>{m.codigo_marca_vehiculo}</td>
                    <td>{m.nombre_marca_vehiculo}</td>
                    <td>{m.descripcion_marca_vehiculo || '—'}</td>
                    <td>{estadoBadge(m.estado_marca_vehiculo)}</td>
                    <td>
                      <div className={styles.acciones}>
                        <button className={styles.btnVer} onClick={() => abrirVer(m)}>Ver</button>
                        <button
                          className={styles.btnEditar}
                          onClick={() => abrirEditar(m)}
                          disabled={m.estado_marca_vehiculo !== 'ACT'}
                        >Editar</button>
                        <button
                          className={styles.btnEliminar}
                          onClick={() => abrirEliminar(m)}
                          disabled={m.estado_marca_vehiculo !== 'ACT'}
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
        <MarcaFormModal
          marca={modalForm.marca}
          onCerrar={cerrarModales}
          onGuardado={handleGuardado}
        />
      )}

      {modalEliminar.abierto && (
        <EliminarModal
          nombre={`${modalEliminar.marca.codigo_marca_vehiculo} - ${modalEliminar.marca.nombre_marca_vehiculo}`}
          onCerrar={cerrarModales}
          onConfirmar={handleEliminar}
        />
      )}

      {modalVer.abierto && (
        <MarcaDetalleModal
          marca={modalVer.marca}
          onCerrar={cerrarModales}
        />
      )}

      {toast && (
        <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrarToast} />
      )}
    </div>
  )
}

export default MarcasPage