import { useState, useEffect } from 'react'
import { crearReserva, actualizarReserva, getReservaPorId } from '../../../api/reservasApi'
import { leerMensajeError } from '../../../api/manejarError'
import { getExtras } from '../../../api/extrasApi'
import { buscarConductores, getConductorPorId } from '../../../api/conductoresApi'
import { getLocalizaciones } from '../../../api/localizacionesApi'
import { getVehiculoPorId } from '../../../api/vehiculosApi'
import { buscarClientes } from '../../../api/clientesApi'
import useAuthStore from '../../../store/useAuthStore'
import BuscadorCliente from '../../../components/ui/BuscadorCliente'
import BuscadorVehiculo from '../../../components/ui/BuscadorVehiculo'
import styles from './ReservaFormModal.module.css'

const BLOQUEAR_LETRAS = (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()

const ESTADO_INICIAL = {
  codigo_reserva: '',
  id_localizacion_recogida: '',
  id_localizacion_devolucion: '',
  fecha_recogida: '',
  hora_recogida: '08:00',
  fecha_devolucion: '',
  hora_devolucion: '08:00',
  observaciones_reserva: '',
  origen_canal_reserva: 'ADMIN',
  estado_reserva: 'PEN',
}

function ReservaFormModal({ reserva, onCerrar, onGuardado }) {
  const { usuario } = useAuthStore()
  const [form, setForm] = useState(ESTADO_INICIAL)
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null)
  const [conductores, setConductores] = useState([{
    id_conductor: '', tipo_conductor: 'PRI', es_principal: true,
    busqueda: '', resultados: [], abierto: false
  }])
  const [extras, setExtras] = useState([{ id_extra: '', cantidad: 1 }])
  const [extrasDisponibles, setExtrasDisponibles] = useState([])
  const [localizaciones, setLocalizaciones] = useState([])
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [cargandoOpciones, setCargandoOpciones] = useState(true)
  const esEdicion = !!reserva

  useEffect(() => {
    async function cargarOpciones() {
      try {
        const [extrasRes, locsRes] = await Promise.all([
          getExtras(1, 100),
          getLocalizaciones(),
        ])
        setExtrasDisponibles(extrasRes.items.filter(e => e.estado_extra === 'ACT' && !e.es_eliminado))
        setLocalizaciones(Array.isArray(locsRes) ? locsRes.filter(l => l.estado_localizacion === 'ACT') : [])
      } catch {
        setError('Error al cargar opciones del formulario.')
      } finally {
        setCargandoOpciones(false)
      }
    }
    cargarOpciones()
  }, [])

  useEffect(() => {
    if (!reserva) return

    async function cargarReservaCompleta() {
      try {
        const [reservaCompleta, vehiculoRes, clienteRes] = await Promise.all([
          getReservaPorId(reserva.id_reserva),
          getVehiculoPorId(reserva.id_vehiculo).catch(() => null),
          buscarClientes({ page_number: 1, page_size: 100 }),
        ])

        setForm({
          codigo_reserva: reservaCompleta.codigo_reserva || '',
          id_localizacion_recogida: reservaCompleta.id_localizacion_recogida || '',
          id_localizacion_devolucion: reservaCompleta.id_localizacion_devolucion || '',
          fecha_recogida: reservaCompleta.fecha_recogida
            ? reservaCompleta.fecha_recogida.split('T')[0] : '',
          hora_recogida: reservaCompleta.hora_recogida || '08:00',
          fecha_devolucion: reservaCompleta.fecha_devolucion
            ? reservaCompleta.fecha_devolucion.split('T')[0] : '',
          hora_devolucion: reservaCompleta.hora_devolucion || '08:00',
          observaciones_reserva: reservaCompleta.observaciones_reserva || '',
          origen_canal_reserva: reservaCompleta.origen_canal_reserva || 'ADMIN',
          estado_reserva: reservaCompleta.estado_reserva || 'PEN',
        })

        if (vehiculoRes) setVehiculoSeleccionado(vehiculoRes)

        const cliente = clienteRes.items?.find(c => c.id_cliente === reservaCompleta.id_cliente)
        if (cliente) setClienteSeleccionado(cliente)

        if (reservaCompleta.conductores?.length > 0) {
          const conductoresConNombres = await Promise.all(
            reservaCompleta.conductores.map(async c => {
              const conductor = await getConductorPorId(c.id_conductor).catch(() => null)
              return {
                id_conductor: c.id_conductor,
                tipo_conductor: c.tipo_conductor || 'ADI',
                es_principal: c.es_principal || false,
                busqueda: conductor
                  ? `${conductor.con_nombre1} ${conductor.con_apellido1} — ${conductor.numero_identificacion}`
                  : `Conductor ID: ${c.id_conductor}`,
                resultados: [],
                abierto: false,
              }
            })
          )
          setConductores(conductoresConNombres)
        }

        if (reservaCompleta.extras?.length > 0) {
          setExtras(reservaCompleta.extras.map(e => ({
            id_extra: String(e.id_extra),
            cantidad: e.cantidad || 1,
          })))
        } else {
          setExtras([])
        }

      } catch {
        setError('Error al cargar los datos de la reserva.')
      }
    }

    cargarReservaCompleta()
  }, [reserva])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function calcularTotales() {
    const precioVehiculo = vehiculoSeleccionado?.precio_base_dia || 0

    let dias = 0
    if (form.fecha_recogida && form.fecha_devolucion) {
      const inicio = new Date(form.fecha_recogida)
      const fin = new Date(form.fecha_devolucion)
      const diff = fin - inicio
      dias = Math.ceil(diff / (1000 * 60 * 60 * 24))
      if (dias < 0) dias = 0
    }

    const subtotalVehiculo = precioVehiculo * dias
    const subtotalExtras = extras.reduce((acc, e) => {
      if (!e.id_extra) return acc
      const extra = extrasDisponibles.find(ex => ex.id_extra === parseInt(e.id_extra))
      const valorExtra = extra?.valor_fijo || 0
      const cantidad = parseInt(e.cantidad) || 0
      return acc + (valorExtra * cantidad)
    }, 0)

    const subtotal = subtotalVehiculo + subtotalExtras
    const iva = subtotal * 0.15
    const total = subtotal + iva

    return { dias, subtotalVehiculo, subtotalExtras, subtotal, iva, total }
  }

  const { dias, subtotalVehiculo, subtotal, iva, total } = calcularTotales()

  function agregarConductor() {
    setConductores(prev => [...prev, {
      id_conductor: '', tipo_conductor: 'ADI', es_principal: false,
      busqueda: '', resultados: [], abierto: false,
    }])
  }

  function eliminarConductor(index) {
    setConductores(prev => prev.filter((_, i) => i !== index))
  }

  async function buscarConductor(index, valor) {
    const nuevos = [...conductores]
    nuevos[index].busqueda = valor
    nuevos[index].id_conductor = ''
    setConductores(nuevos)

    if (valor.length < 2) {
      nuevos[index].resultados = []
      nuevos[index].abierto = false
      setConductores([...nuevos])
      return
    }

    try {
      const res = await buscarConductores({
        con_nombre1: valor,
        estado_conductor: 'ACT',
        page_number: 1,
        page_size: 8,
      })
      nuevos[index].resultados = res.items
      nuevos[index].abierto = true
      setConductores([...nuevos])
    } catch {
      nuevos[index].resultados = []
      setConductores([...nuevos])
    }
  }

  function seleccionarConductor(index, conductor) {
    const nuevos = [...conductores]
    nuevos[index].id_conductor = conductor.id_conductor
    nuevos[index].busqueda = `${conductor.con_nombre1} ${conductor.con_apellido1} — ${conductor.numero_identificacion}`
    nuevos[index].resultados = []
    nuevos[index].abierto = false
    setConductores(nuevos)
  }

  function cambiarTipoConductor(index, tipo) {
    const nuevos = [...conductores]
    nuevos[index].tipo_conductor = tipo
    nuevos[index].es_principal = tipo === 'PRI'
    setConductores(nuevos)
  }

  function agregarExtra() {
    setExtras(prev => [...prev, { id_extra: '', cantidad: 1 }])
  }

  function eliminarExtra(index) {
    setExtras(prev => prev.filter((_, i) => i !== index))
  }

  function cambiarExtra(index, campo, valor) {
    const nuevos = [...extras]
    nuevos[index][campo] = valor
    setExtras(nuevos)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!clienteSeleccionado && !esEdicion) {
      setError('Debes seleccionar un cliente.')
      return
    }
    if (!vehiculoSeleccionado && !esEdicion) {
      setError('Debes seleccionar un vehículo.')
      return
    }
    if (form.fecha_devolucion < form.fecha_recogida) {
      setError('La fecha de devolución no puede ser anterior a la fecha de recogida.')
      return
    }
    if (form.fecha_devolucion === form.fecha_recogida && form.hora_devolucion <= form.hora_recogida) {
      setError('La hora de devolución debe ser posterior a la hora de recogida cuando es el mismo día.')
      return
    }
    if (conductores.some(c => !c.id_conductor)) {
      setError('Todos los conductores deben estar seleccionados.')
      return
    }
    if (extras.length > 0 && extras.some(e => !e.id_extra)) {
      setError('Todos los extras agregados deben tener un tipo seleccionado.')
      return
    }

    setGuardando(true)
    try {
      const datos = {
        ...form,
        id_cliente: clienteSeleccionado?.id_cliente || reserva?.id_cliente,
        id_vehiculo: vehiculoSeleccionado?.id_vehiculo || reserva?.id_vehiculo,
        id_localizacion_recogida: parseInt(form.id_localizacion_recogida),
        id_localizacion_devolucion: parseInt(form.id_localizacion_devolucion),
        fecha_recogida: new Date(form.fecha_recogida).toISOString(),
        fecha_devolucion: new Date(form.fecha_devolucion).toISOString(),
        conductores: conductores.map(c => ({
          id_conductor: parseInt(c.id_conductor),
          tipo_conductor: c.tipo_conductor,
          es_principal: c.es_principal,
          estado_reserva_conductor: 'ACT',
        })),
        extras: extras.filter(e => e.id_extra).map(e => ({
          id_extra: parseInt(e.id_extra),
          cantidad: parseInt(e.cantidad),
          estado_reserva_extra: 'ACT',
        })),
      }

      if (esEdicion) {
        await actualizarReserva(reserva.id_reserva, datos, usuario)
      } else {
        await crearReserva(datos, usuario)
      }
      onGuardado(esEdicion)
    } catch (err) {
      setError(leerMensajeError(err))
    } finally {
      setGuardando(false)
    }
  }

  if (cargandoOpciones) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.cargando}>Cargando formulario...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitulo}>
            {esEdicion ? 'Editar reserva' : 'Nueva reserva'}
          </h2>
          <button className={styles.btnCerrar} onClick={onCerrar}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <p className={styles.seccion}>Datos principales</p>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>Código reserva</label>
              <input className={styles.input} name="codigo_reserva"
                value={form.codigo_reserva} onChange={handleChange}
                placeholder="RES-0001" required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Canal de reserva</label>
              <select className={styles.input} name="origen_canal_reserva"
                value={form.origen_canal_reserva} onChange={handleChange}>
                <option value="ADMIN">Administrativo</option>
                <option value="WEB">Web</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Estado</label>
              <select className={styles.input} name="estado_reserva"
                value={form.estado_reserva} onChange={handleChange}>
                <option value="PEN">Pendiente</option>
                <option value="CON">Confirmada</option>
                <option value="CAN">Cancelada</option>
              </select>
            </div>
          </div>

          <p className={styles.seccion}>Cliente</p>
          <div className={styles.field}>
            <label className={styles.label}>Buscar cliente</label>
            <BuscadorCliente
              onSeleccionar={setClienteSeleccionado}
              clienteSeleccionado={clienteSeleccionado}
            />
          </div>

          <p className={styles.seccion}>Vehículo</p>
          <div className={styles.field}>
            <label className={styles.label}>Buscar vehículo</label>
            <BuscadorVehiculo
              onSeleccionar={setVehiculoSeleccionado}
              vehiculoSeleccionado={vehiculoSeleccionado}
            />
          </div>

          <p className={styles.seccion}>Fechas y localizaciones</p>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>Fecha recogida</label>
              <input className={styles.input} type="date" name="fecha_recogida"
                value={form.fecha_recogida} onChange={handleChange}
                min={new Date().toISOString().split('T')[0]} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Hora recogida</label>
              <input className={styles.input} type="time" name="hora_recogida"
                value={form.hora_recogida} onChange={handleChange} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Fecha devolución</label>
              <input className={styles.input} type="date" name="fecha_devolucion"
                value={form.fecha_devolucion} onChange={handleChange}
                min={form.fecha_recogida || new Date().toISOString().split('T')[0]} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Hora devolución</label>
              <input className={styles.input} type="time" name="hora_devolucion"
                value={form.hora_devolucion} onChange={handleChange} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Localización recogida</label>
              <select className={styles.input} name="id_localizacion_recogida"
                value={form.id_localizacion_recogida} onChange={handleChange} required>
                <option value="">— Selecciona —</option>
                {localizaciones.map(l => (
                  <option key={l.id_localizacion} value={l.id_localizacion}>
                    {l.nombre_localizacion}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Localización devolución</label>
              <select className={styles.input} name="id_localizacion_devolucion"
                value={form.id_localizacion_devolucion} onChange={handleChange} required>
                <option value="">— Selecciona —</option>
                {localizaciones.map(l => (
                  <option key={l.id_localizacion} value={l.id_localizacion}>
                    {l.nombre_localizacion}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className={styles.seccion}>
            Conductores
            <button type="button" className={styles.btnAgregar} onClick={agregarConductor}>+ Agregar</button>
          </p>
          {conductores.map((c, index) => (
            <div key={index} className={styles.filaDetalle}>
              <div className={styles.fieldFlex}>
                <label className={styles.label}>Conductor {index + 1}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className={styles.input}
                    value={c.busqueda}
                    onChange={(e) => buscarConductor(index, e.target.value)}
                    placeholder="Buscar por nombre..."
                  />
                  {c.abierto && c.resultados.length > 0 && (
                    <ul className={styles.dropdown}>
                      {c.resultados.map(cond => (
                        <li key={cond.id_conductor} className={styles.dropdownItem}
                          onClick={() => seleccionarConductor(index, cond)}>
                          <span className={styles.itemNombre}>{cond.con_nombre1} {cond.con_apellido1}</span>
                          <span className={styles.itemDetalle}>{cond.numero_identificacion} · Lic: {cond.numero_licencia}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div className={styles.fieldChico}>
                <label className={styles.label}>Tipo</label>
                <select className={styles.input} value={c.tipo_conductor}
                  onChange={(e) => cambiarTipoConductor(index, e.target.value)}>
                  <option value="PRI">Principal</option>
                  <option value="ADI">Adicional</option>
                </select>
              </div>
              {conductores.length > 1 && (
                <button type="button" className={styles.btnEliminarFila}
                  onClick={() => eliminarConductor(index)}>✕</button>
              )}
            </div>
          ))}

          <p className={styles.seccion}>
            Extras
            <button type="button" className={styles.btnAgregar} onClick={agregarExtra}>+ Agregar</button>
          </p>

          {extras.length === 0 ? (
            <p className={styles.sinExtras}>
              Sin extras asignados. Haz clic en "+ Agregar" para añadir uno.
            </p>
          ) : (
            extras.map((e, index) => (
              <div key={index} className={styles.filaDetalle}>
                <div className={styles.fieldFlex}>
                  <label className={styles.label}>Extra {index + 1}</label>
                  <select className={styles.input} value={e.id_extra}
                    onChange={(ev) => cambiarExtra(index, 'id_extra', ev.target.value)}>
                    <option value="">— Selecciona un extra —</option>
                    {extrasDisponibles.map(ex => (
                      <option key={ex.id_extra} value={ex.id_extra}>
                        {ex.nombre_extra} — ${ex.valor_fijo}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.fieldChico}>
                  <label className={styles.label}>Cantidad</label>
                  <input className={styles.input} type="number" min="1" max="10"
                    value={e.cantidad}
                    onChange={(ev) => cambiarExtra(index, 'cantidad', ev.target.value)}
                    onKeyDown={BLOQUEAR_LETRAS} />
                </div>
                <button type="button" className={styles.btnEliminarFila}
                  onClick={() => eliminarExtra(index)}>✕</button>
              </div>
            ))
          )}

          <p className={styles.seccion}>Resumen de costos</p>
          <div className={styles.resumenCostos}>
            <div className={styles.resumenFila}>
              <span className={styles.resumenLabel}>
                Vehículo ({dias} {dias === 1 ? 'día' : 'días'} × ${(vehiculoSeleccionado?.precio_base_dia || 0).toFixed(2)})
              </span>
              <span className={styles.resumenValor}>${subtotalVehiculo.toFixed(2)}</span>
            </div>

            {extras.filter(e => e.id_extra).map((e, index) => {
              const extra = extrasDisponibles.find(ex => ex.id_extra === parseInt(e.id_extra))
              if (!extra) return null
              const cantidad = parseInt(e.cantidad) || 0
              return (
                <div key={index} className={styles.resumenFila}>
                  <span className={styles.resumenLabel}>
                    {extra.nombre_extra} ({cantidad} × ${extra.valor_fijo?.toFixed(2)})
                  </span>
                  <span className={styles.resumenValor}>
                    ${(extra.valor_fijo * cantidad).toFixed(2)}
                  </span>
                </div>
              )
            })}

            <div className={styles.resumenDivider} />

            <div className={styles.resumenFila}>
              <span className={styles.resumenLabel}>Subtotal</span>
              <span className={styles.resumenValor}>${subtotal.toFixed(2)}</span>
            </div>
            <div className={styles.resumenFila}>
              <span className={styles.resumenLabel}>IVA (15%)</span>
              <span className={styles.resumenValor}>${iva.toFixed(2)}</span>
            </div>
            <div className={`${styles.resumenFila} ${styles.resumenTotal}`}>
              <span>Total estimado</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Observaciones</label>
            <textarea className={styles.input} name="observaciones_reserva"
              value={form.observaciones_reserva} onChange={handleChange} rows={3} />
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnCancelar} onClick={onCerrar}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnGuardar} disabled={guardando}>
              {guardando ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Crear reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReservaFormModal