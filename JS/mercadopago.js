// Manejar el botón de pago
document
  .getElementById("btn-confirmar")
  ?.addEventListener("click", async () => {
    const btnConfirmar = document.getElementById("btn-confirmar");

    // Validar que tengamos todos los datos necesarios
    if (!window.servicioSeleccionado) {
      alert("Por favor selecciona un servicio");
      return;
    }

    if (!window.fechaSeleccionada) {
      alert("Por favor selecciona una fecha");
      return;
    }

    if (!window.horaSeleccionada) {
      alert("Por favor selecciona un horario");
      return;
    }

    if (!window.datosCliente) {
      alert("Por favor completa tus datos");
      return;
    }

    // Deshabilitar botón mientras se procesa
    btnConfirmar.disabled = true;
    btnConfirmar.textContent = "Procesando...";

    try {
      // Formatear fecha como YYYY-MM-DD
      const fechaFormateada = window.fechaSeleccionada
        .toISOString()
        .split("T")[0];

      // Preparar datos del turno
      const turnoData = {
        servicio: window.servicioSeleccionado.nombre,
        precio: window.servicioSeleccionado.precio,
        duracion: window.servicioSeleccionado.duracion,
        profesional: "Kurama Nails",
        fecha: fechaFormateada,
        hora: window.horaSeleccionada,
        nombre: window.datosCliente.nombre,
        apellido: window.datosCliente.apellido,
        email: window.datosCliente.email,
        telefono: window.datosCliente.telefono,
        dni: window.datosCliente.dni,
        observaciones: window.datosCliente.observaciones || "",
      };

      console.log("Creando preferencia de pago con:", turnoData);

      // Llamar al backend para crear la preferencia de Mercado Pago
      const response = await fetch(
        "http://localhost:3000/pagos/crear-preferencia",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ turno: turnoData }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al crear la preferencia de pago");
      }

      const data = await response.json();

      console.log("Preferencia creada:", data);

      // Redirigir a Mercado Pago
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error("No se recibió el link de pago");
      }
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      alert("Hubo un error al procesar tu pago. Por favor intenta nuevamente.");

      // Rehabilitar botón
      btnConfirmar.disabled = false;
      btnConfirmar.textContent = `Pagar $${(
        window.servicioSeleccionado.precio / 2
      ).toLocaleString("es-AR")} de depósito 🔒`;
    }
  });
