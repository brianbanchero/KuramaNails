let fechaActual = new Date();
let duracionServicio = 90;
let horariosOcupados = []; // Array para almacenar horarios ocupados

// Si otro script establece la duración, usarla desde `window`
if (
  typeof window !== "undefined" &&
  typeof window.duracionServicio === "number"
) {
  duracionServicio = window.duracionServicio;
}

const monthLabel = document.getElementById("monthLabel");
const calendarDays = document.getElementById("calendarDays");
const timeSlots = document.getElementById("timeSlots");

function renderCalendar() {
  calendarDays.innerHTML = "";

  const year = fechaActual.getFullYear();
  const month = fechaActual.getMonth();

  const nombresMes = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  monthLabel.textContent = `${nombresMes[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay() || 7;
  const totalDays = new Date(year, month + 1, 0).getDate();

  // espacios vacíos
  for (let i = 1; i < firstDay; i++) {
    calendarDays.appendChild(document.createElement("div"));
  }

  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month, d);
    const dayEl = document.createElement("div");
    dayEl.textContent = d;
    dayEl.className = "calendar-day";

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Deshabilitar domingos (día 0)
    if (date.getDay() === 0) {
      dayEl.classList.add("disabled");
      dayEl.title = "Cerrado los domingos";
    } else if (date < hoy) {
      dayEl.classList.add("disabled");
    } else {
      dayEl.onclick = () => seleccionarDia(date, dayEl);
    }

    calendarDays.appendChild(dayEl);
  }
}

async function seleccionarDia(fecha, el) {
  document
    .querySelectorAll(".calendar-day.selected")
    .forEach((d) => d.classList.remove("selected"));

  el.classList.add("selected");
  window.fechaSeleccionada = fecha;

  // Consultar horarios ocupados desde el backend
  await obtenerHorariosOcupados(fecha);

  generarHorarios();
}

// 🆕 NUEVA FUNCIÓN: Consultar horarios ocupados
async function obtenerHorariosOcupados(fecha) {
  try {
    const fechaFormateada = fecha.toISOString().split("T")[0]; // Formato: YYYY-MM-DD
    const profesional = "Kurama Nails"; // Puedes hacerlo dinámico si tienes varios profesionales

    const response = await fetch(
      `http://localhost:3000/turnos/ocupados?fecha=${fechaFormateada}&profesional=${encodeURIComponent(
        profesional
      )}`
    );

    if (!response.ok) {
      console.error("Error consultando horarios ocupados");
      horariosOcupados = [];
      return;
    }

    const data = await response.json();
    // El backend devuelve un array de horas como ["09:00:00", "10:30:00"]
    // Las convertimos a formato HH:MM
    horariosOcupados = data.map((hora) => {
      if (typeof hora === "string" && hora.includes(":")) {
        return hora.substring(0, 5); // "09:00:00" -> "09:00"
      }
      return hora;
    });

    console.log("Horarios ocupados:", horariosOcupados);
  } catch (error) {
    console.error("Error obteniendo horarios ocupados:", error);
    horariosOcupados = [];
  }
}

function generarHorarios() {
  timeSlots.innerHTML = "";

  const inicio = 9 * 60; // 09:00
  const cierre = 15 * 60; // 15:00

  for (
    let min = inicio;
    min + (window.duracionServicio || duracionServicio) <= cierre;
    min += window.duracionServicio || duracionServicio
  ) {
    const h = Math.floor(min / 60)
      .toString()
      .padStart(2, "0");
    const m = (min % 60).toString().padStart(2, "0");
    const horaActual = `${h}:${m}`;

    const btn = document.createElement("div");
    btn.className = "time-slot";
    btn.textContent = horaActual;

    // 🆕 Verificar si el horario está ocupado
    if (horariosOcupados.includes(horaActual)) {
      btn.classList.add("disabled");
      btn.title = "Horario no disponible";
    } else {
      btn.onclick = () => seleccionarHora(btn, horaActual);
    }

    timeSlots.appendChild(btn);
  }

  document.getElementById("duracionServicio").textContent = `${
    window.duracionServicio || duracionServicio
  } min`;
}

function seleccionarHora(el, hora) {
  document
    .querySelectorAll(".time-slot.selected")
    .forEach((s) => s.classList.remove("selected"));

  el.classList.add("selected");
  window.horaSeleccionada = hora;

  document.getElementById("paso-datos").classList.remove("step-hidden");

  document
    .getElementById("paso-datos")
    .scrollIntoView({ behavior: "smooth", block: "start" });
}

document.getElementById("prevMonth").onclick = () => {
  fechaActual.setMonth(fechaActual.getMonth() - 1);
  renderCalendar();
};

document.getElementById("nextMonth").onclick = () => {
  fechaActual.setMonth(fechaActual.getMonth() + 1);
  renderCalendar();
};
