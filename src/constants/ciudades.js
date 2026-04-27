export const CIUDADES = [
  { id_ciudad: 1,  nombre: 'Quito',          id_pais: 1 },
  { id_ciudad: 2,  nombre: 'Bogotá',         id_pais: 2 },
  { id_ciudad: 3,  nombre: 'Lima',           id_pais: 3 },
  { id_ciudad: 4,  nombre: 'Santiago',       id_pais: 4 },
  { id_ciudad: 5,  nombre: 'Ciudad de México', id_pais: 5 },
  { id_ciudad: 6,  nombre: 'Quito',          id_pais: 1 },
  { id_ciudad: 7,  nombre: 'Bogotá',         id_pais: 2 },
  { id_ciudad: 8,  nombre: 'Lima',           id_pais: 3 },
  { id_ciudad: 9,  nombre: 'Santiago',       id_pais: 4 },
  { id_ciudad: 10, nombre: 'Ciudad de México', id_pais: 5 },
]

export function getNombreCiudad(id_ciudad) {
  const ciudad = CIUDADES.find(c => c.id_ciudad === id_ciudad)
  return ciudad ? ciudad.nombre : `Ciudad ${id_ciudad}`
}