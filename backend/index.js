import express from "express";
import cors from "cors";
import turnosRoutes from "./src/routes/turnos.routes.js";
import pagosRoutes from "./src/routes/pagos.routes.js";

const app = express();

// 🆕 CORS - PERMITIR TODO (temporalmente para debug)
app.use(cors());

// 🆕 Agregar headers manualmente también
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Manejar preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());
app.use("/turnos", turnosRoutes);
app.use("/pagos", pagosRoutes);

app.get("/", (req, res) => {
  res.send("API Kurama Nails funcionando ✅");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});
