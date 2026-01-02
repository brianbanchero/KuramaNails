function calcularHoraFin(horaInicio, duracionMinutos) {
  if (!horaInicio) return "";

  const [hh, mm] = horaInicio.split(":").map((n) => parseInt(n, 10));
  if (isNaN(hh) || isNaN(mm) || typeof duracionMinutos !== "number") return "";

  const inicio = new Date();
  inicio.setHours(hh, mm, 0, 0);
  const fin = new Date(inicio.getTime() + duracionMinutos * 60 * 1000);

  const hhF = String(fin.getHours()).padStart(2, "0");
  const mmF = String(fin.getMinutes()).padStart(2, "0");
  return `${hhF}:${mmF}`;
}

function renderResumen() {
  // Intentar leer los globals usados en el flujo principal
  const servicio =
    typeof servicioSeleccionado !== "undefined"
      ? servicioSeleccionado
      : window.servicioSeleccionado;
  const fecha =
    typeof fechaSeleccionada !== "undefined"
      ? fechaSeleccionada
      : window.fechaSeleccionada;
  const hora =
    typeof horaSeleccionada !== "undefined"
      ? horaSeleccionada
      : window.horaSeleccionada;

  const elServicio = document.getElementById("summary-service");
  const elFecha = document.getElementById("summary-date");
  const elHora = document.getElementById("summary-time");
  const elTotal = document.getElementById("summary-total");
  const elSenia = document.getElementById("summary-deposit");
  const elRemainingAmount = document.getElementById("remaining-amount");
  const btnConfirmar = document.getElementById("btn-confirmar");

  if (!elServicio || !elFecha || !elHora || !elTotal || !elSenia) return;

  if (!servicio) {
    elServicio.textContent = "-";
    elTotal.textContent = "-";
    elSenia.textContent = "-";
    if (elRemainingAmount) elRemainingAmount.textContent = "-";
    if (btnConfirmar) btnConfirmar.textContent = "Pagar depósito 🔒";
  } else {
    elServicio.textContent = servicio.nombre || "-";
    const precio = Number(servicio.precio) || 0;
    const deposito = precio / 2;

    elTotal.textContent = `$${precio.toLocaleString("es-AR")}`;
    elSenia.textContent = `$${deposito.toLocaleString("es-AR")}`;

    // Actualizar el monto restante
    if (elRemainingAmount) {
      elRemainingAmount.textContent = `$${deposito.toLocaleString("es-AR")}`;
    }

    // Actualizar el texto del botón con el monto correcto
    if (btnConfirmar) {
      btnConfirmar.textContent = `Pagar $${deposito.toLocaleString(
        "es-AR"
      )} de depósito 🔒`;
    }
  }

  if (fecha instanceof Date) {
    elFecha.textContent = fecha.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  } else if (typeof fecha === "string" && fecha) {
    // intentar parsear ISO
    const d = new Date(fecha);
    if (!isNaN(d)) {
      elFecha.textContent = d.toLocaleDateString("es-AR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
    } else {
      elFecha.textContent = "-";
    }
  } else {
    elFecha.textContent = "-";
  }

  if (hora) {
    const dur =
      servicio && typeof servicio.duracion === "number" ? servicio.duracion : 0;
    const fin = calcularHoraFin(hora, dur);
    elHora.textContent = `${hora} - ${fin}`;
  } else {
    elHora.textContent = "-";
  }
}
