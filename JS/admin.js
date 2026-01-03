const API_URL = "https://kuramanails-production.up.railway.app/";

async function cargarTurnos() {
  const container = document.getElementById("turnos-container");
  container.innerHTML = '<div class="loading">Cargando turnos...</div>';

  try {
    const fecha = document.getElementById("filtro-fecha").value;
    const servicio = document.getElementById("filtro-servicio").value;

    let url = `${API_URL}/turnos`;
    const params = new URLSearchParams();
    if (fecha) params.append("fecha", fecha);
    if (servicio) params.append("servicio", servicio);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url);
    const turnos = await response.json();

    if (turnos.length === 0) {
      container.innerHTML =
        '<div class="empty">No hay turnos registrados</div>';
      return;
    }

    container.innerHTML = turnos
      .map(
        (turno) => `
          <div class="turno-card">
            <div class="turno-info">
              <h3>${turno.servicio}</h3>
              <p><strong>📅 Fecha:</strong> ${new Date(
                turno.fecha
              ).toLocaleDateString("es-AR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}</p>
              <p><strong>🕐 Hora:</strong> ${turno.hora}</p>
              <p><strong>⏱️ Duración:</strong> ${turno.duracion} min</p>
              <p><strong>💰 Precio:</strong> $${turno.precio.toLocaleString(
                "es-AR"
              )}</p>
            </div>

            <div class="turno-cliente">
              <p><strong>Cliente:</strong> ${turno.nombre} ${turno.apellido}</p>
              <p><strong>Email:</strong> ${turno.email}</p>
              <p><strong>Tel:</strong> ${turno.telefono}</p>
              <p><strong>DNI:</strong> ${turno.dni}</p>
              ${
                turno.observaciones
                  ? `<p><strong>Obs:</strong> ${turno.observaciones}</p>`
                  : ""
              }
            </div>

            <div class="turno-actions">
              <button class="btn-delete" onclick="eliminarTurno(${turno.id})">
                🗑️ Eliminar
              </button>
            </div>
          </div>
        `
      )
      .join("");

    calcularEstadisticas(turnos);
  } catch (error) {
    console.error("Error cargando turnos:", error);
    container.innerHTML = '<div class="empty">Error al cargar turnos</div>';
  }
}

function calcularEstadisticas(turnos) {
  document.getElementById("total-turnos").textContent = turnos.length;

  const hoy = new Date().toISOString().split("T")[0];
  const turnosHoy = turnos.filter((t) => t.fecha.startsWith(hoy)).length;
  document.getElementById("turnos-hoy").textContent = turnosHoy;

  const mesActual = new Date().getMonth();
  const ingresosMes = turnos
    .filter((t) => new Date(t.fecha).getMonth() === mesActual)
    .reduce((sum, t) => sum + parseFloat(t.precio), 0);
  document.getElementById(
    "ingresos-mes"
  ).textContent = `$${ingresosMes.toLocaleString("es-AR")}`;
}

async function eliminarTurno(id) {
  if (!confirm("¿Estás seguro de eliminar este turno?")) return;

  try {
    const response = await fetch(`${API_URL}/turnos/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("Turno eliminado correctamente");
      cargarTurnos();
    } else {
      alert("Error al eliminar el turno");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error al eliminar el turno");
  }
}

function limpiarFiltros() {
  document.getElementById("filtro-fecha").value = "";
  document.getElementById("filtro-servicio").value = "";
  cargarTurnos();
}

// Cargar turnos al inicio
cargarTurnos();

// Recargar cada 30 segundos
setInterval(cargarTurnos, 30000);
