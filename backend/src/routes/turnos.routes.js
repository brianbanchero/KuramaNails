import express from "express";
import pool from "../db.js";
import { enviarMailTurno } from "../email.js";

const router = express.Router();

// Obtener todos los turnos
router.get("/", async (req, res) => {
  try {
    const { fecha, servicio } = req.query;

    let query = "SELECT * FROM turnos WHERE 1=1";
    const params = [];

    if (fecha) {
      params.push(fecha);
      query += ` AND fecha = $${params.length}`;
    }

    if (servicio) {
      params.push(servicio);
      query += ` AND servicio = $${params.length}`;
    }

    query += " ORDER BY fecha DESC, hora DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno" });
  }
});

// Eliminar turno
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM turnos WHERE id = $1", [id]);

    res.json({ mensaje: "Turno eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar turno" });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      servicio,
      precio,
      duracion,
      profesional,
      fecha,
      hora,
      nombre,
      apellido,
      email,
      telefono,
      dni,
      observaciones,
    } = req.body;

    // Validación mínima
    if (
      !servicio ||
      !precio ||
      !duracion ||
      !fecha ||
      !hora ||
      !nombre ||
      !apellido ||
      !email ||
      !telefono ||
      !dni
    ) {
      return res.status(400).json({
        error: "Faltan datos obligatorios",
      });
    }

    const query = `
      INSERT INTO turnos
      (servicio, precio, duracion, profesional, fecha, hora,
       nombre, apellido, email, telefono, dni, observaciones)
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *;
    `;

    const values = [
      servicio,
      precio,
      duracion,
      profesional,
      fecha,
      hora,
      nombre,
      apellido,
      email,
      telefono,
      dni,
      observaciones || null,
    ];

    const resultado = await pool.query(query, values);

    // 📧 enviar mail al admin
    await enviarMailTurno(resultado.rows[0]);

    res.status(201).json({
      mensaje: "Turno guardado correctamente",
      turno: resultado.rows[0],
    });
  } catch (error) {
    // Duplicado de turno
    if (error.code === "23505") {
      return res.status(409).json({
        error: "Ese horario ya está reservado",
      });
    }

    console.error(error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
});

router.get("/ocupados", async (req, res) => {
  try {
    const { fecha, profesional } = req.query;

    if (!fecha || !profesional) {
      return res.status(400).json({
        error: "Faltan parámetros",
      });
    }

    const query = `
      SELECT hora
      FROM turnos
      WHERE fecha = $1
      AND profesional = $2
    `;

    const result = await pool.query(query, [fecha, profesional]);

    res.json(result.rows.map((r) => r.hora));
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error interno",
    });
  }
});

export default router;
