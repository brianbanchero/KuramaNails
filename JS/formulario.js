// Datos del cliente
window.datosCliente = null;

// Manejar envío del formulario
document
  .getElementById("form-cliente")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Recopilar datos del formulario
    const formData = new FormData(e.target);
    window.datosCliente = {
      nombre: formData.get("nombre"),
      apellido: formData.get("apellido"),
      email: formData.get("email"),
      telefono: formData.get("telefono"),
      dni: formData.get("dni"),
      observaciones: formData.get("observaciones") || "",
    };

    console.log("Datos del cliente:", window.datosCliente);

    // Mostrar paso de resumen
    document.getElementById("paso-resumen").classList.remove("step-hidden");

    // Actualizar resumen con datos del cliente
    actualizarResumenCompleto();

    // Scroll al resumen
    document
      .getElementById("paso-resumen")
      .scrollIntoView({ behavior: "smooth", block: "start" });
  });

function actualizarResumenCompleto() {
  // Llamar a la función existente de resumen
  if (typeof renderResumen === "function") {
    renderResumen();
  }

  // Agregar datos del cliente al resumen
  const summaryCliente = document.getElementById("summary-cliente");
  const summaryEmail = document.getElementById("summary-email");

  if (window.datosCliente) {
    if (summaryCliente) {
      summaryCliente.textContent = `${window.datosCliente.nombre} ${window.datosCliente.apellido}`;
    }
    if (summaryEmail) {
      summaryEmail.textContent = window.datosCliente.email;
    }
  }
}
