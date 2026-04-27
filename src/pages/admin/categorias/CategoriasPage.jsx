import { useEffect, useState, useCallback } from 'react'
import { getCategorias, buscarCategorias, eliminarCategoria } from '../../../api/categoriasVehiculoApi'
import { leerMensajeError } from '../../../api/manejarError'
import useAuthStore from '../../../store/useAuthStore'
import useToast from '../../../hooks/useToast'
import Toast from '../../../components/ui/Toast'
import Paginacion from '../../../components/ui/Paginacion'
import CategoriaFormModal from './CategoriaFormModal'
import EliminarModal from '../vehiculos/EliminarModal'
import CategoriaDetalleModal from './CategoriaDetalleModal'
import styles from './CategoriasPage.module.css'
import FiltrosCategorias from '../../../components/ui/FiltrosCategorias'

const TAMANO_PAGINA = 10

function CategoriasPage() {
  const { usuario } = useAuthStore()
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalRegistros, setTotalRegistros] = useState(0)
  const [filtrosActivos, setFiltrosActivos] = useState(false)
  const [filtrosActuales, setFiltrosActuales] = useState(null)
  const [modalForm, setModalForm] = useState({ abierto: false, categoria: null })
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, categoria: null })
  const [modalVer, setModalVer] = useState({ abierto: false, categoria: null })
  const { toast, mostrarToast, cerrarToast } = useToast()

  const cargarCategorias = useCallback(async (pagina = 1) => {
    try {
      setCargando(true)
      setError('')
      const resultado = await getCategorias(pagina, TAMANO_PAGINA)
      setCategorias(resultado.items)
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

  useEffect(() => { cargarCategorias(1) }, [cargarCategorias])

  async function handleBuscar(payload) {
    try {
      setCargando(true)
      setError('')
      const resultado = await buscarCategorias(payload)
      setCategorias(resultado.items)
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
      cargarCategorias(nuevaPagina)
    }
  }

  function abrirCrear() { setModalForm({ abierto: true, categoria: null }) }
  function abrirEditar(c) { setModalForm({ abierto: true, categoria: c }) }
  function abrirEliminar(c) { setModalEliminar({ abierto: true, categoria: c }) }
  function abrirVer(c) { setModalVer({ abierto: true, categoria: c }) }

  function cerrarModales() {
    setModalForm({ abierto: false, categoria: null })
    setModalEliminar({ abierto: false, categoria: null })
    setModalVer({ abierto: false, categoria: null })
  }

  async function handleEliminar(motivo) {
    try {
      await eliminarCategoria(modalEliminar.categoria.id_categoria_vehiculo, motivo)
      cerrarModales()
      cargarCategorias(paginaActual)
      mostrarToast('Categoría eliminada correctamente.')
    } catch (err) {
      cerrarModales()
      mostrarToast(leerMensajeError(err), 'error')
    }
  }

  function handleGuardado(esEdicion) {
    cerrarModales()
    cargarCategorias(esEdicion ? paginaActual : 1)
    mostrarToast(esEdicion ? 'Categoría actualizada correctamente.' : 'Categoría creada correctamente.')
  }

  function estadoBadge(estado) {
    if (estado === 'ACT') return <span className={`${styles.badge} ${styles.activo}`}>Activo</span>
    return <span className={`${styles.badge} ${styles.inactivo}`}>Inactivo</span>
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.titulo}>Categorías de vehículo</h1>
          <p className={styles.subtitulo}>
            Gestión de categorías del catálogo
            {filtrosActivos
              ? <span className={styles.filtroActivo}> · Mostrando resultados filtrados</span>
              : totalRegistros > 0 && <span> · {totalRegistros} registros</span>
            }
          </p>
        </div>
        <button className={styles.btnPrimario} onClick={abrirCrear}>
          + Nueva categoría
        </button>
      </div>


      <FiltrosCategorias
        onBuscar={handleBuscar}
        onLimpiar={() => cargarCategorias(1)}
      />

      {error && <div className={styles.error}>{error}</div>}

      {cargando ? (
        <div className={styles.cargando}>Cargando categorías...</div>
      ) : categorias.length === 0 ? (
        <div className={styles.cargando}>
          {filtrosActivos
            ? 'No se encontraron categorías con los filtros aplicados.'
            : 'No hay categorías registradas.'}
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
                {categorias.map((c) => (
                  <tr key={c.id_categoria_vehiculo}>
                    <td>{c.codigo_categoria_vehiculo}</td>
                    <td>{c.nombre_categoria_vehiculo}</td>
                    <td>{c.descripcion_categoria_vehiculo || '—'}</td>
                    <td>{estadoBadge(c.estado_categoria_vehiculo)}</td>
                    <td>
                      <div className={styles.acciones}>
                        <button className={styles.btnVer} onClick={() => abrirVer(c)}>Ver</button>
                        <button
                          className={styles.btnEditar}
                          onClick={() => abrirEditar(c)}
                          disabled={c.estado_categoria_vehiculo !== 'ACT'}
                        >Editar</button>
                        <button
                          className={styles.btnEliminar}
                          onClick={() => abrirEliminar(c)}
                          disabled={c.estado_categoria_vehiculo !== 'ACT'}
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
        <CategoriaFormModal
          categoria={modalForm.categoria}
          onCerrar={cerrarModales}
          onGuardado={handleGuardado}
        />
      )}

      {modalEliminar.abierto && (
        <EliminarModal
          nombre={`${modalEliminar.categoria.codigo_categoria_vehiculo} - ${modalEliminar.categoria.nombre_categoria_vehiculo}`}
          onCerrar={cerrarModales}
          onConfirmar={handleEliminar}
        />
      )}

      {modalVer.abierto && (
        <CategoriaDetalleModal
          categoria={modalVer.categoria}
          onCerrar={cerrarModales}
        />
      )}

      {toast && (
        <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrarToast} />
      )}
    </div>
  )
}

export default CategoriasPage