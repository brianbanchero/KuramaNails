import express from "express";
import cors from "cors";
import turnosRoutes from "./routes/turnos.routes.js";
import pagosRoutes from "./routes/pagos.routes.js";

const app = express();

// 🆕 CORS configurado para producción
app.use(
  cors({
    origin: [
      "https://tu-usuario.github.io", // Tu GitHub Pages
      "http://localhost:5501", // Para desarrollo local
      "http://127.0.0.1:5501",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use("/turnos", turnosRoutes);
app.use("/pagos", pagosRoutes);

app.get("/", (req, res) => {
  res.send("API Kurama Nails funcionando");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});
