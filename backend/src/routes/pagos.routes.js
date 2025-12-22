import express from "express";
import { preferenceClient } from "../mercadopago.js";
import axios from "axios";
import pool from "../db.js";
import { enviarMailTurno } from "../email.js";

const router = express.Router();

router.post("/crear-preferencia", async (req, res) => {
  try {
    const { turno } = req.body;

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
          success: "https://www.mercadopago.com.ar",
          failure: "https://www.mercadopago.com.ar",
        },
        auto_return: "approved",
        metadata: {
          turno,
        },
      },
    });

    res.json({
      init_point: preference.init_point,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creando pago" });
  }
});

router.post("/webhook", async (req, res) => {
  try {
    const { type, data } = req.body;

    // 1️⃣ Solo nos interesa pagos
    if (type !== "payment") {
      return res.sendStatus(200);
    }

    const paymentId = data.id;

    // 2️⃣ Consultar pago real a Mercado Pago
    const mpResponse = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      }
    );

    const payment = mpResponse.data;

    // 3️⃣ Solo pagos aprobados
    if (payment.status !== "approved") {
      return res.sendStatus(200);
    }

    // 4️⃣ Verificar si ya procesamos este pago
    const pagoExistente = await pool.query(
      "SELECT 1 FROM pagos WHERE payment_id = $1",
      [paymentId]
    );

    if (pagoExistente.rowCount > 0) {
      return res.sendStatus(200);
    }

    // 5️⃣ Guardar pago (lock)
    await pool.query("INSERT INTO pagos (payment_id, status) VALUES ($1, $2)", [
      paymentId,
      payment.status,
    ]);

    // 6️⃣ Obtener turno desde metadata
    const turno = payment.metadata.turno;

    // 7️⃣ Guardar turno en DB
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
        turno.precio,
        turno.duracion,
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

    // 8️⃣ Enviar mail al admin
    await enviarMailTurno(resultado.rows[0]);

    // 9️⃣ OK
    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error.message);
    res.sendStatus(500);
  }
});

export default router;
