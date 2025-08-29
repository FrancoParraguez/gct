import express from "express";
import cors from "cors";
import platesRoutes from "./routes/plates";
import checkPlateRoutes from "./routes/checkPlate";


const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.use("/api/plates", platesRoutes);
app.use("/api/check-plate", checkPlateRoutes);

app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});
