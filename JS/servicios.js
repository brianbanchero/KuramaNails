const serviciosBackend = [
  {
    id: 1,
    nombre: "Soft Gel",
    precio: 19000,
    duracion: 90,
    ultimoTurno: "13:30",
    imagen: "../assets/img/soft-gel.jpeg",
  },
  {
    id: 2,
    nombre: "Capping",
    precio: 100,
    duracion: 90,
    ultimoTurno: "15:00",
    imagen: "../assets/img/capping.jpeg",
  },
  {
    id: 3,
    nombre: "Esmaltado Semipermanente",
    precio: 23000,
    duracion: 90,
    ultimoTurno: "15:00",
    imagen: "../assets/img/semipermanentes.jpeg",
  },
];

const serviciosLista = document.getElementById("serviciosLista");

// Variables compartidas en `window` para que otros scripts puedan acceder
window.servicioSeleccionado = null;
// fechaSeleccionada y horaSeleccionada se exponen desde `date.js` mediante `window`

function renderServicios() {
  serviciosLista.innerHTML = "";

  serviciosBackend.forEach((servicio) => {
    const article = document.createElement("article");
    article.className = "servicio-item";
    article.dataset.id = servicio.id;

    article.innerHTML = `
      <img src="${servicio.imagen}" alt="${servicio.nombre}" />

      <div class="servicio-info">
        <h3>${servicio.nombre}</h3>
        <p class="descripcion">Servicio profesional de ${servicio.nombre}</p>
      </div>

      <div class="servicio-meta">
        <div class="precio">$${servicio.precio.toLocaleString("es-AR")}</div>
        <div class="duracion">${servicio.duracion} min</div>
        <span class="check"></span>
      </div>
    `;

    article.addEventListener("click", () =>
      seleccionarServicio(servicio, article)
    );
    serviciosLista.appendChild(article);
  });
}

function seleccionarServicio(servicio, articleEl) {
  // Visual: quitar clase activo de anteriores y añadir a la actual
  document
    .querySelectorAll(".servicio-item.activo")
    .forEach((c) => c.classList.remove("activo"));
  if (articleEl && articleEl.classList) articleEl.classList.add("activo");

  // Guardar como global (objeto) para que `resumen.js` y `date.js` puedan leerlo
  window.servicioSeleccionado = servicio;

  // Actualizar duración global usada por el calendario
  window.duracionServicio = servicio.duracion;

  document.getElementById("paso-fecha").classList.remove("step-hidden");

  resetearCalendario();

  renderCalendar(servicio);

  document
    .getElementById("paso-fecha")
    .scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetearCalendario() {
  if (!calendarDays || !timeSlots || !monthLabel) return;

  calendarDays.innerHTML = "";
  timeSlots.innerHTML = "";
  monthLabel.textContent = "";
}

renderServicios();
