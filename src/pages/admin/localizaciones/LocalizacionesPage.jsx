import { useEffect, useState, useCallback } from 'react'
import { getLocalizaciones, buscarLocalizaciones, eliminarLocalizacion } from '../../../api/localizacionesAdminApi'
import { leerMensajeError } from '../../../api/manejarError'
import useToast from '../../../hooks/useToast'
import Toast from '../../../components/ui/Toast'
import Paginacion from '../../../components/ui/Paginacion'
import FiltrosLocalizaciones from '../../../components/ui/FiltrosLocalizaciones'
import LocalizacionFormModal from './LocalizacionFormModal'
import EliminarModal from '../vehiculos/EliminarModal'
import LocalizacionDetalleModal from './LocalizacionDetalleModal'
import { getNombreCiudad } from '../../../constants/ciudades'
import styles from './LocalizacionesPage.module.css'

const TAMANO_PAGINA = 10

function LocalizacionesPage() {
  const [localizaciones, setLocalizaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalRegistros, setTotalRegistros] = useState(0)
  const [filtrosActivos, setFiltrosActivos] = useState(false)
  const [filtrosActuales, setFiltrosActuales] = useState(null)
  const [modalForm, setModalForm] = useState({ abierto: false, localizacion: null })
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, localizacion: null })
  const [modalVer, setModalVer] = useState({ abierto: false, localizacion: null })
  const { toast, mostrarToast, cerrarToast } = useToast()

  const cargarLocalizaciones = useCallback(async (pagina = 1) => {
    try {
      setCargando(true)
      setError('')
      const resultado = await getLocalizaciones(pagina, TAMANO_PAGINA)
      setLocalizaciones(resultado.items)
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

  useEffect(() => { cargarLocalizaciones(1) }, [cargarLocalizaciones])

  async function handleBuscar(payload) {
    try {
      setCargando(true)
      setError('')
      const resultado = await buscarLocalizaciones(payload)
      setLocalizaciones(resultado.items)
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
      cargarLocalizaciones(nuevaPagina)
    }
  }

  function abrirCrear() { setModalForm({ abierto: true, localizacion: null }) }
  function abrirEditar(l) { setModalForm({ abierto: true, localizacion: l }) }
  function abrirEliminar(l) { setModalEliminar({ abierto: true, localizacion: l }) }
  function abrirVer(l) { setModalVer({ abierto: true, localizacion: l }) }

  function cerrarModales() {
    setModalForm({ abierto: false, localizacion: null })
    setModalEliminar({ abierto: false, localizacion: null })
    setModalVer({ abierto: false, localizacion: null })
  }

  async function handleEliminar(motivo) {
    try {
      await eliminarLocalizacion(modalEliminar.localizacion.id_localizacion, motivo)
      cerrarModales()
      cargarLocalizaciones(paginaActual)
      mostrarToast('Localización eliminada correctamente.')
    } catch (err) {
      cerrarModales()
      mostrarToast(leerMensajeError(err), 'error')
    }
  }

  function handleGuardado(esEdicion) {
    cerrarModales()
    cargarLocalizaciones(esEdicion ? paginaActual : 1)
    mostrarToast(esEdicion ? 'Localización actualizada correctamente.' : 'Localización creada correctamente.')
  }

  function estadoBadge(estado) {
    if (estado === 'ACT') return <span className={`${styles.badge} ${styles.activo}`}>Activo</span>
    return <span className={`${styles.badge} ${styles.inactivo}`}>Inactivo</span>
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.titulo}>Localizaciones</h1>
          <p className={styles.subtitulo}>
            Gestión de sucursales y puntos de entrega
            {filtrosActivos
              ? <span className={styles.filtroActivo}> · Mostrando resultados filtrados</span>
              : totalRegistros > 0 && <span> · {totalRegistros} registros</span>
            }
          </p>
        </div>
        <button className={styles.btnPrimario} onClick={abrirCrear}>
          + Nueva localización
        </button>
      </div>

      <FiltrosLocalizaciones
        onBuscar={handleBuscar}
        onLimpiar={() => cargarLocalizaciones(1)}
      />

      {error && <div className={styles.error}>{error}</div>}

      {cargando ? (
        <div className={styles.cargando}>Cargando localizaciones...</div>
      ) : localizaciones.length === 0 ? (
        <div className={styles.cargando}>
          {filtrosActivos
            ? 'No se encontraron localizaciones con los filtros aplicados.'
            : 'No hay localizaciones registradas.'}
        </div>
      ) : (
        <>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Ciudad</th>
                  <th>Teléfono</th>
                  <th>Horario</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {localizaciones.map((l) => (
                  <tr key={l.id_localizacion}>
                    <td>{l.codigo_localizacion}</td>
                    <td>{l.nombre_localizacion}</td>
                    <td>{getNombreCiudad(l.id_ciudad)}</td>
                    <td>{l.telefono_contacto || '—'}</td>
                    <td>{l.horario_atencion || '—'}</td>
                    <td>{estadoBadge(l.estado_localizacion)}</td>
                    <td>
                      <div className={styles.acciones}>
                        <button className={styles.btnVer} onClick={() => abrirVer(l)}>Ver</button>
                        <button
                          className={styles.btnEditar}
                          onClick={() => abrirEditar(l)}
                          disabled={l.estado_localizacion !== 'ACT'}
                        >Editar</button>
                        <button
                          className={styles.btnEliminar}
                          onClick={() => abrirEliminar(l)}
                          disabled={l.estado_localizacion !== 'ACT'}
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
        <LocalizacionFormModal
          localizacion={modalForm.localizacion}
          onCerrar={cerrarModales}
          onGuardado={handleGuardado}
        />
      )}

      {modalEliminar.abierto && (
        <EliminarModal
          nombre={`${modalEliminar.localizacion.codigo_localizacion} - ${modalEliminar.localizacion.nombre_localizacion}`}
          onCerrar={cerrarModales}
          onConfirmar={handleEliminar}
        />
      )}

      {modalVer.abierto && (
        <LocalizacionDetalleModal
          localizacion={modalVer.localizacion}
          onCerrar={cerrarModales}
        />
      )}

      {toast && (
        <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrarToast} />
      )}
    </div>
  )
}

export default LocalizacionesPage