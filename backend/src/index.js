import express from "express";
import cors from "cors";
import turnosRoutes from "./routes/turnos.routes.js";
import pagosRoutes from "./routes/pagos.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/turnos", turnosRoutes);
app.use("/pagos", pagosRoutes);

app.get("/", (req, res) => {
  res.send("API Kurama Nails funcionando");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
