// Inicializaciones de la UI
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("botonComenzar");
  if (btn) {
    btn.addEventListener("click", () => {
      const paso = document.getElementById("paso-servicio");
      if (paso) paso.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
});
