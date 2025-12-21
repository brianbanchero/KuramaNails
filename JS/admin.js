import { obtenerTurnos, eliminarTurno } from "./data.js";

const lista = document.querySelector("#listaTurnos");

function renderTurnos() {
  lista.innerHTML = "";

  const turnos = obtenerTurnos();

  turnos.forEach(turno => {
    const li = document.createElement("li");

    li.innerHTML = `
      <strong>Fecha: </strong>${turno.fecha}<br>
      <strong>Hora: </strong>${turno.hora}<br>
      <strong>Nombre: </strong>${turno.nombre}<br>
      <strong>Telefono: </strong>${turno.telefono}<br>
      <strong>Servicio: </strong>${turno.servicio}<br>
      <button data-id="${turno.id}" class="btn-eliminar">❌</button>
    `;

    lista.appendChild(li);
  });

  document.querySelectorAll(".btn-eliminar").forEach(btn => {
    btn.addEventListener("click", () => {
      eliminarTurno(Number(btn.dataset.id));
      renderTurnos();
    });
  });
}

renderTurnos();
