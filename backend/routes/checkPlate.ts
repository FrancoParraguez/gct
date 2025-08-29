import { Router } from "express";
import axios from "axios";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const router = Router();

interface PlateData {
  plate: string;
  owner?: string;
  registered?: boolean;
}

// Reemplaza con tu API Key de PlateRecognizer
const PLATE_RECOGNIZER_KEY = "18927bf97f81aa62d5d6f67b34848750969288d6";
const PLATE_RECOGNIZER_URL = "https://api.platerecognizer.com/v1/plate-reader/";

// Ruta absoluta al JSON de patentes
const dbPath = join(process.cwd(), "db", "plates.json");

router.post("/", async (req, res) => {
  const { image } = req.body;
  if (!image) return res.status(400).json({ message: "No se recibió imagen" });

  try {
    // Llamada a PlateRecognizer
    const response = await axios.post(
      PLATE_RECOGNIZER_URL,
      { upload: image },
      { headers: { Authorization: `Token ${PLATE_RECOGNIZER_KEY}` } }
    );

    const results = response.data.results;
    const plate = results[0]?.plate ?? "NO_DETECTADA";

    // Verificar si está registrada en nuestro DB
    const data: PlateData[] = JSON.parse(readFileSync(dbPath, "utf-8"));
    const registered = data.find((p) => p.plate === plate);

    res.json({
      plate,
      owner: registered?.owner,
      registered: !!registered
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error verificando la patente" });
  }
});

export default router;
