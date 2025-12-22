import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "OK" : "UNDEFINED");

export async function enviarMailTurno(turno) {
  const mailOptions = {
    from: `"Kurama Nails" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_ADMIN,
    subject: "📅 Nuevo turno confirmado",
    html: `
      <h2>Nuevo turno confirmado 💅</h2>
      <p><strong>Servicio:</strong> ${turno.servicio}</p>
      <p><strong>Precio:</strong> $${turno.precio}</p>
      <p><strong>Duración:</strong> ${turno.duracion} min</p>
      <p><strong>Profesional:</strong> ${turno.profesional}</p>
      <hr/>
      <p><strong>Fecha:</strong> ${turno.fecha}</p>
      <p><strong>Hora:</strong> ${turno.hora}</p>
      <hr/>
      <p><strong>Cliente:</strong> ${turno.nombre} ${turno.apellido}</p>
      <p><strong>Email:</strong> ${turno.email}</p>
      <p><strong>Teléfono:</strong> ${turno.telefono}</p>
      <p><strong>DNI:</strong> ${turno.dni}</p>
      <p><strong>Observaciones:</strong> ${turno.observaciones || "-"}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}
