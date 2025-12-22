const overlay = document.getElementById("overlay");
const modal = document.getElementById("modalReserva");
const btnCerrar = document.getElementById("cerrarModal");
const diasScroll = document.getElementById("diasScroll");
const mesActual = document.getElementById("mesActual");
const horasGrid = document.getElementById("horasGrid");
const sinHoras = document.getElementById("sinHoras");
const tabsHora = document.querySelectorAll(".tab-hora");
const btnContinuar = document.querySelector(".btn-continuar");
const pasoContinuar = document.getElementById("pasoContinuar");
const btnVolver = document.getElementById("btnVolver");

let fechaBase = new Date();
fechaBase.setDate(1);

function closeModal() {
  if (overlay) overlay.classList.add("oculto");
  if (modal) modal.classList.add("oculto");

  resetModal();
}

window.abrirModalReserva = async function (servicio) {
  if (!overlay || !modal) {
    console.error("Overlay o modal no encontrado");
    return;
  }

  const precio = servicio.precio || 0;
  const senia = precio / 2;

  document.getElementById("modalServicioNombre").textContent = servicio.nombre;
  document.getElementById(
    "modalServicioPrecio"
  ).textContent = `$${precio.toLocaleString("es-AR")}`;

  document.getElementById(
    "modalServicioSenia"
  ).textContent = `- $${senia.toLocaleString("es-AR")} a abonar en línea`;

  // Rellenar resumen del servicio si existe la sección
  const resumen = modal.querySelector(".servicio-resumen");
  if (resumen) {
    const titulo = resumen.querySelector("h4");
    const precio = resumen.querySelector("p");
    if (titulo) titulo.textContent = servicio.nombre || "Servicio";
    if (precio)
      precio.textContent = servicio.precio
        ? `$${servicio.precio.toLocaleString("es-AR")}`
        : "";
  }

  overlay.classList.remove("oculto");
  modal.classList.remove("oculto");

  window.servicioSeleccionado = servicio;
  await generarDias();

  resetModal();
};

if (btnCerrar) btnCerrar.addEventListener("click", closeModal);

if (overlay) {
  overlay.addEventListener("click", (e) => {
    // Cerrar solo si se clickea fuera del modal (en el overlay)
    if (e.target === overlay) closeModal();
  });
}

function mostrarFechaHora(fechaTexto) {
  const contenedor = document.getElementById("modalFechaHora");
  const texto = document.getElementById("modalFechaTexto");

  texto.textContent = fechaTexto;
  contenedor.classList.remove("oculto");
}

async function generarDias() {
  diasScroll.innerHTML = "";

  const year = fechaBase.getFullYear();
  const month = fechaBase.getMonth();

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

  const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  mesActual.textContent = `${nombresMes[month]} ${year}`;

  const totalDias = new Date(year, month + 1, 0).getDate();

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  for (let d = 1; d <= totalDias; d++) {
    const fecha = new Date(year, month, d);
    const diaSemana = fecha.getDay();

    const btn = document.createElement("button");
    btn.classList.add("dia-btn");

    btn.innerHTML = `
      <span>${diasSemana[diaSemana]}</span>
      <strong>${d}</strong>
    `;

    let bloqueado = false;

    // 🔒 1. Días pasados
    if (fecha < hoy) {
      bloqueado = true;
    }

    // 🔒 2. Domingos
    if (diaSemana === 0) {
      bloqueado = true;
    }

    // 🔒 3. Feriados (si ya lo tenés implementado)
    if (typeof esFeriado === "function" && esFeriado(fecha)) {
      bloqueado = true;
    }

    // 🔒 4. Día completo (solo si no está bloqueado antes)
    if (!bloqueado) {
      const disponible = await diaTieneHorasDisponibles(fecha);
      if (!disponible) {
        bloqueado = true;
      }
    }

    if (bloqueado) {
      btn.classList.add("inactivo");
      btn.disabled = true;
      btn.title = "No hay horarios disponibles este día";
    } else {
      btn.addEventListener("click", async () => {
        document
          .querySelectorAll(".dia-btn.activo")
          .forEach((b) => b.classList.remove("activo"));

        btn.classList.add("activo");

        window.fechaSeleccionada = fecha;
        window.horaSeleccionada = null;

        horasGrid.innerHTML = "";

        await generarHoras("manana");
        actualizarResumenFechaHora();
      });
    }

    diasScroll.appendChild(btn);
  }
}

document.getElementById("prevMes").addEventListener("click", () => {
  diasScroll.scrollTo({ left: 0, behavior: "smooth" });

  fechaBase.setMonth(fechaBase.getMonth() - 1);
  generarDias();
});

document.getElementById("nextMes").addEventListener("click", () => {
  diasScroll.scrollTo({ left: 0, behavior: "smooth" });

  fechaBase.setMonth(fechaBase.getMonth() + 1);
  generarDias();
});

const horariosBase = {
  manana: ["09:00", "10:30", "12:00"],
  tarde: ["13:30", "15:00"],
};

function horaEsValida(hora, ultimoTurno) {
  return hora <= ultimoTurno;
}

async function generarHoras(turno) {
  horasGrid.innerHTML = "";
  sinHoras.classList.add("oculto");

  const servicio = window.servicioSeleccionado;
  if (!servicio || !window.fechaSeleccionada) return;

  const fecha = window.fechaSeleccionada.toISOString().split("T")[0];

  const horasOcupadas = await obtenerHorasOcupadas(fecha);

  const horasOcupadasNormalizadas = horasOcupadas.map((h) => h.slice(0, 5));

  const listaBase = horariosBase[turno];
  const horariosFiltrados = listaBase.filter(
    (hora) => hora <= servicio.ultimoTurno
  );

  if (horariosFiltrados.length === 0) {
    sinHoras.classList.remove("oculto");
    return;
  }

  horariosFiltrados.forEach((hora) => {
    const btn = document.createElement("button");
    btn.className = "hora-btn";
    btn.textContent = hora;

    if (horasOcupadasNormalizadas.includes(hora)) {
      btn.classList.add("inactivo");
    }

    btn.addEventListener("click", () => {
      if (btn.classList.contains("inactivo")) {
        return;
      }

      document
        .querySelectorAll(".hora-btn.activo")
        .forEach((b) => b.classList.remove("activo"));

      btn.classList.add("activo");
      window.horaSeleccionada = hora;

      actualizarResumenFechaHora();
    });

    horasGrid.appendChild(btn);
  });
}

// Tabs
tabsHora.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabsHora.forEach((t) => t.classList.remove("activo"));
    tab.classList.add("activo");

    generarHoras(tab.dataset.turno);
  });
});

function formatearFecha(fecha, hora) {
  const dias = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  const meses = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  return `${dias[fecha.getDay()]} ${fecha.getDate()} de ${
    meses[fecha.getMonth()]
  } a las ${hora}`;
}

function actualizarResumenFechaHora() {
  if (!window.fechaSeleccionada || !window.horaSeleccionada) return;

  const texto = formatearFecha(
    window.fechaSeleccionada,
    window.horaSeleccionada
  );

  const contenedor = document.getElementById("modalFechaHora");
  const textoSpan = document.getElementById("modalFechaTexto");

  textoSpan.textContent = texto;
  contenedor.classList.remove("oculto");

  habilitarContinuar();
}

function habilitarContinuar() {
  const btn = document.querySelector(".btn-continuar");
  btn.classList.remove("disabled");
}

function resetModal() {
  // Estado global
  window.fechaSeleccionada = null;
  window.horaSeleccionada = null;

  // Días
  document
    .querySelectorAll(".dia-btn.activo")
    .forEach((b) => b.classList.remove("activo"));

  // Horas
  document
    .querySelectorAll(".hora-btn.activo")
    .forEach((b) => b.classList.remove("activo"));

  // Reset del calendario
  fechaBase = new Date();

  // Tabs hora
  document
    .querySelectorAll(".tab-hora")
    .forEach((t) => t.classList.remove("activo"));

  const tabManana = document.querySelector('.tab-hora[data-turno="manana"]');
  if (tabManana) tabManana.classList.add("activo");

  // Regenerar horas iniciales
  generarHoras("manana");

  // Ocultar fecha/hora resumen
  const resumenFecha = document.getElementById("modalFechaHora");
  if (resumenFecha) resumenFecha.classList.add("oculto");

  // Botón continuar
  const btnContinuar = document.querySelector(".btn-continuar");
  if (btnContinuar) btnContinuar.classList.add("disabled");

  // Ocultar botón volver
  const btnVolver = document.getElementById("btnVolver");
  if (btnVolver) btnVolver.classList.add("oculto");

  // 👉 VOLVER AL PASO 1
  document
    .querySelectorAll(".modal-section")
    .forEach((sec) => (sec.style.display = ""));

  document.querySelector(".modal-footer").style.display = "flex";

  const pasoContinuar = document.getElementById("pasoContinuar");
  if (pasoContinuar) pasoContinuar.classList.add("oculto");

  const resumenInicial = document.querySelector(".modal-servicio");
  if (resumenInicial) resumenInicial.style.display = "";

  // Reset formulario de contacto
  const campos = [
    "nombre",
    "apellido",
    "email",
    "telefono",
    "dni",
    "observaciones",
  ];
  campos.forEach((id) => {
    const input = document.getElementById(id);
    if (input) input.value = "";
  });

  // Deshabilitar botón pagar
  const btnPagar = document.getElementById("btnPagar");
  if (btnPagar) btnPagar.classList.add("disabled");

  // Reset card superior (resumen inicial)
  const resumenServicio = document.getElementById("resumenServicio");
  const resumenPrecio = document.getElementById("resumenPrecio");
  const resumenProfesional = document.getElementById("resumenProfesional");
  const resumenFechaHora = document.getElementById("resumenFechaHora");

  if (resumenServicio) resumenServicio.textContent = "";
  if (resumenPrecio) resumenPrecio.textContent = "";
  if (resumenProfesional) resumenProfesional.textContent = "";
  if (resumenFechaHora) resumenFechaHora.textContent = "";
}

if (btnVolver) {
  btnVolver.addEventListener("click", () => {
    // Ocultamos paso continuar
    document.getElementById("pasoContinuar").classList.add("oculto");

    // Ocultamos botón volver
    btnVolver.classList.add("oculto");

    // Mostramos paso 1
    document
      .querySelectorAll(".modal-section")
      .forEach((sec) => (sec.style.display = ""));

    document.querySelector(".modal-footer").style.display = "flex";

    const resumenInicial = document.querySelector(".modal-servicio");
    if (resumenInicial) resumenInicial.style.display = "";
  });
}

if (btnContinuar) {
  btnContinuar.addEventListener("click", () => {
    // Ocultamos las secciones del paso 1
    document
      .querySelectorAll(".modal-section")
      .forEach((sec) => (sec.style.display = "none"));

    document.querySelector(".modal-footer").style.display = "none";

    // Ocultamos el resumen inicial
    const resumenInicial = document.querySelector(".modal-servicio");
    if (resumenInicial) resumenInicial.style.display = "none";

    // Mostramos el paso continuar
    const pasoContinuar = document.getElementById("pasoContinuar");
    if (pasoContinuar) pasoContinuar.classList.remove("oculto");

    document.getElementById("btnVolver").classList.remove("oculto");

    // Cargamos el resumen final
    cargarResumenFinal();
  });
}

function cargarResumenFinal() {
  const servicio = window.servicioSeleccionado;
  const fechaTexto = document.getElementById("modalFechaTexto").textContent;

  document.getElementById("resumenServicio").textContent = servicio.nombre;

  document.getElementById(
    "resumenPrecio"
  ).textContent = `$${servicio.precio.toLocaleString("es-AR")} - $${(
    servicio.precio / 2
  ).toLocaleString("es-AR")} a abonar en línea`;

  document.getElementById("resumenProfesional").textContent =
    "Profesional: Cielo";

  document.getElementById("resumenFechaHora").textContent = fechaTexto;

  const footer = document.getElementById("footerResumen");
  footer.innerHTML = `
    <span>Servicios (1)</span>
    <strong>$${servicio.precio.toLocaleString("es-AR")}</strong>
    <span>Duración total</span>
    <strong>${servicio.duracion} min</strong>
  `;
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function telefonoValido(numero) {
  return /^[0-9]{8,15}$/.test(numero);
}

const inputsObligatorios = ["nombre", "apellido", "email", "telefono", "dni"];

inputsObligatorios.forEach((id) => {
  document.getElementById(id).addEventListener("input", validarFormulario);
});

function validarFormulario() {
  const nombre = document.getElementById("nombre").value.trim();
  const apellido = document.getElementById("apellido").value.trim();
  const email = document.getElementById("email").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const dni = document.getElementById("dni").value.trim();

  const valido =
    nombre && apellido && dni && emailValido(email) && telefonoValido(telefono);

  const btnPagar = document.getElementById("btnPagar");
  if (valido) btnPagar.classList.remove("disabled");
  else btnPagar.classList.add("disabled");
}

async function obtenerHorasOcupadas(fecha) {
  const profesional = "Cielo";

  console.log("Consultando horas ocupadas para:", fecha);

  try {
    const response = await fetch(
      `http://localhost:3000/turnos/ocupados?fecha=${fecha}&profesional=${profesional}`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    console.log("Horas ocupadas recibidas:", data);

    return data;
  } catch (error) {
    console.error("Error al obtener horas ocupadas", error);
    return [];
  }
}

async function diaTieneHorasDisponibles(fecha) {
  const servicio = window.servicioSeleccionado;

  // 🟢 Si todavía no hay servicio elegido,
  // NO bloqueamos el día
  if (!servicio) return true;

  const fechaISO = fecha.toISOString().split("T")[0];

  const horasOcupadas = await obtenerHorasOcupadas(fechaISO);
  const horasOcupadasNormalizadas = horasOcupadas.map((h) => h.slice(0, 5));

  const horasManana = horariosBase.manana.filter(
    (h) => h <= servicio.ultimoTurno
  );
  const horasTarde = horariosBase.tarde.filter(
    (h) => h <= servicio.ultimoTurno
  );

  const todasLasHoras = [...horasManana, ...horasTarde];

  return todasLasHoras.some(
    (hora) => !horasOcupadasNormalizadas.includes(hora)
  );
}

if (btnPagar) {
  btnPagar.addEventListener("click", () => {
    const turno = construirTurnoDesdeFormulario();
    pagarTurno(turno);
  });
}

async function pagarTurno(turno) {
  const res = await fetch("http://localhost:3000/pagos/crear-preferencia", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ turno }),
  });

  const data = await res.json();

  window.location.href = data.init_point;
}

function construirTurnoDesdeFormulario() {
  return {
    servicio: window.servicioSeleccionado.nombre,
    precio: window.servicioSeleccionado.precio,
    duracion: window.servicioSeleccionado.duracion,
    profesional: window.profesionalSeleccionado,
    fecha: window.fechaSeleccionada.toISOString().split("T")[0],
    hora: window.horaSeleccionada,
    nombre: document.getElementById("nombre").value,
    apellido: document.getElementById("apellido").value,
    email: document.getElementById("email").value,
    telefono: document.getElementById("telefono").value,
    dni: document.getElementById("dni").value,
    observaciones: document.getElementById("observaciones")?.value || "",
  };
}

function mostrarExito() {
  alert("Turno reservado con éxito 🎉");

  closeModal();
}

// Inicial
generarHoras("manana");

// Inicial
generarDias();
