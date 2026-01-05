import express from "express";
import { preferenceClient } from "../mercadopago.js";
import axios from "axios";
import pool from "../db.js";
import { enviarMailTurno } from "../email.js";

const router = express.Router();

router.post("/crear-preferencia", async (req, res) => {
  try {
    console.log("📥 Request recibido:", req.body);

    const { turno } = req.body;

    if (!turno) {
      console.log("❌ No se recibió el objeto turno");
      return res.status(400).json({ error: "Faltan datos del turno" });
    }

    console.log("📝 Creando preferencia para:", turno.servicio);

    const preference = await preferenceClient.create({
      body: {
        items: [
          {
            title: `Seña - ${turno.servicio}`,
            quantity: 1,
            unit_price: turno.precio / 2,
          },
        ],
        back_urls: {
          success: "https://brianbanchero.github.io/KuramaNails/exito.html",
          failure: "https://brianbanchero.github.io/KuramaNails/error.html",
          pending: "https://brianbanchero.github.io/KuramaNails/pendiente.html",
        },
        auto_return: "approved",
        notification_url: process.env.MP_WEBHOOK_URL,
        // 🆕 CAMBIO IMPORTANTE: Enviar metadata como pares clave-valor
        metadata: {
          servicio: turno.servicio,
          precio: turno.precio.toString(),
          duracion: turno.duracion.toString(),
          profesional: turno.profesional,
          fecha: turno.fecha,
          hora: turno.hora,
          nombre: turno.nombre,
          apellido: turno.apellido,
          email: turno.email,
          telefono: turno.telefono,
          dni: turno.dni,
          observaciones: turno.observaciones || "",
        },
      },
    });

    console.log("✅ Preferencia creada:", preference.id);
    console.log("🔔 Webhook URL:", process.env.MP_WEBHOOK_URL);

    res.json({
      init_point: preference.init_point,
    });
  } catch (error) {
    console.error("❌ Error en crear-preferencia:", error.message);
    console.error("Detalle completo:", error);
    res.status(500).json({
      error: "Error creando pago",
      detalle: error.message,
    });
  }
});

router.post("/webhook", async (req, res) => {
  try {
    console.log("📩 WEBHOOK RAW BODY:", JSON.stringify(req.body));
    console.log("📩 WEBHOOK QUERY:", req.query);

    const paymentId = req.body?.data?.id || req.query?.id || req.body?.id;

    if (!paymentId) {
      console.log("⚠️ No se recibió paymentId");
      return res.sendStatus(200);
    }

    // Consultar pago real
    let payment;
    try {
      const mpResponse = await axios.get(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          },
        }
      );

      payment = mpResponse.data;
      console.log("💳 Pago consultado:", payment.status);
      console.log("📦 Metadata recibido:", payment.metadata); // 🆕 Ver qué metadata llega
    } catch (err) {
      console.log("⏳ Pago aún no disponible, reintentando:", paymentId);
      return res.sendStatus(500);
    }

    if (payment.status !== "approved") {
      console.log("❌ Pago no aprobado:", payment.status);
      return res.sendStatus(200);
    }

    // evitar duplicados
    const existe = await pool.query(
      "SELECT 1 FROM pagos WHERE payment_id = $1",
      [paymentId]
    );

    if (existe.rowCount > 0) {
      console.log("🔁 Pago ya procesado");
      return res.sendStatus(200);
    }

    await pool.query("INSERT INTO pagos (payment_id, status) VALUES ($1, $2)", [
      paymentId,
      payment.status,
    ]);

    // 🆕 Los datos ahora vienen directamente en metadata, no en metadata.turno
    const turno = payment.metadata;

    // 🆕 Validar que los datos existan
    if (!turno.servicio || !turno.fecha || !turno.hora) {
      console.error("❌ Metadata incompleto:", turno);
      return res.sendStatus(500);
    }

    console.log("💾 Guardando turno:", turno);

    const resultado = await pool.query(
      `
      INSERT INTO turnos (
        servicio, precio, duracion, profesional,
        fecha, hora, nombre, apellido,
        email, telefono, dni, observaciones
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
      `,
      [
        turno.servicio,
        parseFloat(turno.precio), // 🆕 Convertir de string a número
        parseInt(turno.duracion), // 🆕 Convertir de string a número
        turno.profesional,
        turno.fecha,
        turno.hora,
        turno.nombre,
        turno.apellido,
        turno.email,
        turno.telefono,
        turno.dni,
        turno.observaciones || null,
      ]
    );

    await enviarMailTurno(resultado.rows[0]);

    console.log("✅ Turno guardado y mail enviado");
    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Webhook error:", error);
    res.sendStatus(500);
  }
});

export default router;
