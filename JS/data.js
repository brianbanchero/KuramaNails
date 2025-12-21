const STORAGE_KEY = "turnos";

/* Obtener todos los turnos */
export function obtenerTurnos() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

/* Guardar lista completa */
function guardarTurnos(turnos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(turnos));
}

/* Crear nuevo turno */
export function crearTurno(turno) {
  const turnos = obtenerTurnos();
  turnos.push(turno);
  guardarTurnos(turnos);
}

/* Eliminar turno (admin) */
export function eliminarTurno(id) {
  let turnos = obtenerTurnos();
  turnos = turnos.filter(t => t.id !== id);
  guardarTurnos(turnos);
}
