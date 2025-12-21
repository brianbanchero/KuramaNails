const serviciosBackend = [
  {
    id: 1,
    nombre: "Soft Gel",
    precio: 19000,
    duracion: 90,
    ultimoTurno: "13:30",
    imagen: "/assets/img/soft-gel.jpeg"
  },
  {
    id: 2,
    nombre: "Capping",
    precio: 16000,
    duracion: 90,
    ultimoTurno: "15:00",
    imagen: "/assets/img/capping.jpeg"
  },
  {
    id: 3,
    nombre: "Esmaltado Semipermanente",
    precio: 23000,
    duracion: 90,
    ultimoTurno: "15:00",
    imagen: "/assets/img/semipermanentes.jpeg"
  }
];


const serviciosContainer = document.getElementById("serviciosContainer");

serviciosBackend.forEach(servicio => {
  const card = document.createElement("div");
  card.classList.add("servicio-card");

  card.innerHTML = `
  <img src="${servicio.imagen}" alt="${servicio.nombre}">

  <div class="servicio-info">
    <div>
      <h3>${servicio.nombre}</h3>
      <p>$${servicio.precio.toLocaleString("es-AR")}</p>
    </div>

    <button>Reservar</button>
  </div>
`;

  card.querySelector("button").addEventListener("click", () => {
  abrirModalReserva(servicio);
});

  serviciosContainer.appendChild(card);
});
