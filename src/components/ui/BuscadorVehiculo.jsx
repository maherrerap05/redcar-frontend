import { useState, useEffect, useRef } from 'react'
import { buscarVehiculos } from '../../api/vehiculosApi'
import styles from './BuscadorVehiculo.module.css'

function BuscadorVehiculo({ onSeleccionar, vehiculoSeleccionado }) {
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState([])
  const [cargando, setCargando] = useState(false)
  const [abierto, setAbierto] = useState(false)
  const timeoutRef = useRef(null)
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (vehiculoSeleccionado) {
      setBusqueda(`${vehiculoSeleccionado.modelo_vehiculo} — ${vehiculoSeleccionado.placa_vehiculo}`)
    }
  }, [vehiculoSeleccionado])

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
        const [porModelo, porPlaca, porCodigo] = await Promise.all([
          buscarVehiculos({
            modelo_vehiculo: valor,
            estado_vehiculo: 'ACT',
            page_number: 1,
            page_size: 5,
          }),
          buscarVehiculos({
            placa_vehiculo: valor,
            estado_vehiculo: 'ACT',
            page_number: 1,
            page_size: 5,
          }),
          buscarVehiculos({
            codigo_interno_vehiculo: valor,
            estado_vehiculo: 'ACT',
            page_number: 1,
            page_size: 5,
          }),
        ])

        const toArray = (res) => Array.isArray(res) ? res : (res?.items || [])

        const todos = [
          ...toArray(porModelo),
          ...toArray(porPlaca),
          ...toArray(porCodigo),
        ]

        const unicos = todos.filter(
          (v, index, self) => self.findIndex(x => x.id_vehiculo === v.id_vehiculo) === index
        )

        setResultados(unicos)
        setAbierto(unicos.length > 0)
      } catch {
        setResultados([])
      } finally {
        setCargando(false)
      }
    }, 400)
  }

  function handleSeleccionar(vehiculo) {
    setBusqueda(`${vehiculo.modelo_vehiculo} — ${vehiculo.placa_vehiculo}`)
    onSeleccionar(vehiculo)
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
          placeholder="Buscar por modelo, placa o código..."
        />
        {(busqueda || vehiculoSeleccionado) && (
          <button type="button" className={styles.btnLimpiar} onClick={handleLimpiar}>✕</button>
        )}
      </div>

      {cargando && <div className={styles.cargando}>Buscando...</div>}

      {abierto && resultados.length > 0 && (
        <ul className={styles.lista}>
          {resultados.map(v => (
            <li
              key={v.id_vehiculo}
              className={styles.item}
              onClick={() => handleSeleccionar(v)}
            >
              <span className={styles.itemNombre}>{v.modelo_vehiculo} — {v.placa_vehiculo}</span>
              <span className={styles.itemDetalle}>
                {v.tipo_transmision} · {v.tipo_combustible} · ${v.precio_base_dia}/día
              </span>
            </li>
          ))}
        </ul>
      )}

      {abierto && !cargando && resultados.length === 0 && busqueda.length >= 2 && (
        <div className={styles.sinResultados}>No se encontraron vehículos disponibles.</div>
      )}

      {vehiculoSeleccionado && (
        <div className={styles.seleccionado}>
          <span className={styles.seleccionadoLabel}>Vehículo seleccionado:</span>
          <span>{vehiculoSeleccionado.modelo_vehiculo} · {vehiculoSeleccionado.placa_vehiculo}</span>
          <span className={styles.seleccionadoPrecio}>${vehiculoSeleccionado.precio_base_dia}/día</span>
        </div>
      )}
    </div>
  )
}

export default BuscadorVehiculo