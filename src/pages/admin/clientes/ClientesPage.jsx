import { useEffect, useState, useCallback } from 'react'
import { getClientes, buscarClientes, eliminarCliente } from '../../../api/clientesApi'
import { leerMensajeError } from '../../../api/manejarError'
import useToast from '../../../hooks/useToast'
import Toast from '../../../components/ui/Toast'
import Paginacion from '../../../components/ui/Paginacion'
import FiltrosClientes from '../../../components/ui/FiltrosClientes'
import ClienteFormModal from './ClienteFormModal'
import EliminarModal from '../vehiculos/EliminarModal'
import ClienteDetalleModal from './ClienteDetalleModal'
import styles from './ClientesPage.module.css'

const TAMANO_PAGINA = 10

function ClientesPage() {
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalRegistros, setTotalRegistros] = useState(0)
  const [filtrosActivos, setFiltrosActivos] = useState(false)
  const [filtrosActuales, setFiltrosActuales] = useState(null)
  const [modalForm, setModalForm] = useState({ abierto: false, cliente: null })
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, cliente: null })
  const [modalVer, setModalVer] = useState({ abierto: false, cliente: null })
  const { toast, mostrarToast, cerrarToast } = useToast()

  const cargarClientes = useCallback(async (pagina = 1) => {
    try {
      setCargando(true)
      setError('')
      const resultado = await getClientes(pagina, TAMANO_PAGINA)
      setClientes(resultado.items)
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

  useEffect(() => { cargarClientes(1) }, [cargarClientes])

  async function handleBuscar(payload) {
    try {
      setCargando(true)
      setError('')
      const resultado = await buscarClientes(payload)
      setClientes(resultado.items)
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
      cargarClientes(nuevaPagina)
    }
  }

  function abrirCrear() { setModalForm({ abierto: true, cliente: null }) }
  function abrirEditar(c) { setModalForm({ abierto: true, cliente: c }) }
  function abrirEliminar(c) { setModalEliminar({ abierto: true, cliente: c }) }
  function abrirVer(c) { setModalVer({ abierto: true, cliente: c }) }

  function cerrarModales() {
    setModalForm({ abierto: false, cliente: null })
    setModalEliminar({ abierto: false, cliente: null })
    setModalVer({ abierto: false, cliente: null })
  }

  async function handleEliminar(motivo) {
    try {
      await eliminarCliente(modalEliminar.cliente.id_cliente, motivo)
      cerrarModales()
      cargarClientes(paginaActual)
      mostrarToast('Cliente eliminado correctamente.')
    } catch (err) {
      cerrarModales()
      mostrarToast(leerMensajeError(err), 'error')
    }
  }

  function handleGuardado(esEdicion) {
    cerrarModales()
    cargarClientes(esEdicion ? paginaActual : 1)
    mostrarToast(esEdicion ? 'Cliente actualizado correctamente.' : 'Cliente creado correctamente.')
  }

  function estadoBadge(estado) {
    if (estado === 'ACT') return <span className={`${styles.badge} ${styles.activo}`}>Activo</span>
    return <span className={`${styles.badge} ${styles.inactivo}`}>Inactivo</span>
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.titulo}>Clientes</h1>
          <p className={styles.subtitulo}>
            Gestión del registro de clientes
            {filtrosActivos
              ? <span className={styles.filtroActivo}> · Mostrando resultados filtrados</span>
              : totalRegistros > 0 && <span> · {totalRegistros} registros</span>
            }
          </p>
        </div>
        <button className={styles.btnPrimario} onClick={abrirCrear}>
          + Nuevo cliente
        </button>
      </div>

      <FiltrosClientes
        onBuscar={handleBuscar}
        onLimpiar={() => cargarClientes(1)}
      />

      {error && <div className={styles.error}>{error}</div>}

      {cargando ? (
        <div className={styles.cargando}>Cargando clientes...</div>
      ) : clientes.length === 0 ? (
        <div className={styles.cargando}>
          {filtrosActivos
            ? 'No se encontraron clientes con los filtros aplicados.'
            : 'No hay clientes registrados.'}
        </div>
      ) : (
        <>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Identificación</th>
                  <th>Nombres</th>
                  <th>Apellidos</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.id_cliente}>
                    <td>{c.numero_identificacion}</td>
                    <td>{c.nombres}</td>
                    <td>{c.apellidos}</td>
                    <td>{c.correo}</td>
                    <td>{c.telefono || '—'}</td>
                    <td>{estadoBadge(c.estado)}</td>
                    <td>
                      <div className={styles.acciones}>
                        <button className={styles.btnVer} onClick={() => abrirVer(c)}>Ver</button>
                        <button
                          className={styles.btnEditar}
                          onClick={() => abrirEditar(c)}
                          disabled={c.estado !== 'ACT'}
                        >Editar</button>
                        <button
                          className={styles.btnEliminar}
                          onClick={() => abrirEliminar(c)}
                          disabled={c.estado !== 'ACT'}
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
        <ClienteFormModal
          cliente={modalForm.cliente}
          onCerrar={cerrarModales}
          onGuardado={handleGuardado}
        />
      )}

      {modalEliminar.abierto && (
        <EliminarModal
          nombre={`${modalEliminar.cliente.nombres} ${modalEliminar.cliente.apellidos}`}
          onCerrar={cerrarModales}
          onConfirmar={handleEliminar}
        />
      )}

      {modalVer.abierto && (
        <ClienteDetalleModal
          cliente={modalVer.cliente}
          onCerrar={cerrarModales}
        />
      )}

      {toast && (
        <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrarToast} />
      )}
    </div>
  )
}

export default ClientesPage