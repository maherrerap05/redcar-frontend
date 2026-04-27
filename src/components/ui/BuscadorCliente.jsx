import { useState, useEffect, useRef } from 'react'
import { buscarClientes } from '../../api/clientesApi'
import styles from './BuscadorCliente.module.css'

function BuscadorCliente({ onSeleccionar, clienteSeleccionado }) {
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState([])
  const [cargando, setCargando] = useState(false)
  const [abierto, setAbierto] = useState(false)
  const timeoutRef = useRef(null)
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (clienteSeleccionado) {
      setBusqueda(`${clienteSeleccionado.nombres} ${clienteSeleccionado.apellidos} — ${clienteSeleccionado.numero_identificacion}`)
    }
  }, [clienteSeleccionado])

  useEffect(() => {
    function handleClickFuera(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setAbierto(false)
      }
    }
    document.addEventListener('mousedown', handleClickFuera)
    return () => document.removeEventListener('mousedown', handleClickFuera)
  }, [])

  async function handleBusqueda(e) {
    const valor = e.target.value
    setBusqueda(valor)
    onSeleccionar(null)

    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    if (valor.length < 2) {
      setResultados([])
      setAbierto(false)
      return
    }

    timeoutRef.current = setTimeout(async () => {
      setCargando(true)
      try {
        const resultado = await buscarClientes({
          nombres: valor,
          estado: 'ACT',
          page_number: 1,
          page_size: 10,
        })
        if (resultado.items.length === 0) {
          const porId = await buscarClientes({
            numero_identificacion: valor,
            estado: 'ACT',
            page_number: 1,
            page_size: 10,
          })
          setResultados(porId.items)
        } else {
          setResultados(resultado.items)
        }
        setAbierto(true)
      } catch {
        setResultados([])
      } finally {
        setCargando(false)
      }
    }, 400)
  }

  function handleSeleccionar(cliente) {
    setBusqueda(`${cliente.nombres} ${cliente.apellidos} — ${cliente.numero_identificacion}`)
    onSeleccionar(cliente)
    setAbierto(false)
    setResultados([])
  }

  function handleLimpiar() {
    setBusqueda('')
    onSeleccionar(null)
    setResultados([])
    setAbierto(false)
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.inputWrapper}>
        <input
          className={styles.input}
          value={busqueda}
          onChange={handleBusqueda}
          placeholder="Buscar por nombre o identificación..."
        />
        {(busqueda || clienteSeleccionado) && (
          <button type="button" className={styles.btnLimpiar} onClick={handleLimpiar}>✕</button>
        )}
      </div>

      {cargando && <div className={styles.cargando}>Buscando...</div>}

      {abierto && resultados.length > 0 && (
        <ul className={styles.lista}>
          {resultados.map(c => (
            <li
              key={c.id_cliente}
              className={styles.item}
              onClick={() => handleSeleccionar(c)}
            >
              <span className={styles.itemNombre}>{c.nombres} {c.apellidos}</span>
              <span className={styles.itemDetalle}>{c.tipo_identificacion}: {c.numero_identificacion} · {c.correo}</span>
            </li>
          ))}
        </ul>
      )}

      {abierto && !cargando && resultados.length === 0 && busqueda.length >= 2 && (
        <div className={styles.sinResultados}>No se encontraron clientes.</div>
      )}

      {clienteSeleccionado && (
        <div className={styles.seleccionado}>
          <span className={styles.seleccionadoLabel}>Cliente seleccionado:</span>
          <span>{clienteSeleccionado.nombres} {clienteSeleccionado.apellidos}</span>
          <span className={styles.seleccionadoId}>ID: {clienteSeleccionado.id_cliente}</span>
        </div>
      )}
    </div>
  )
}

export default BuscadorCliente