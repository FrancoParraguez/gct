import { Router } from "express";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const router = Router();
const dbPath = join(process.cwd(), "db", "plates.json"); // ruta absoluta desde proyecto raíz

interface PlateData {
  plate: string;
  owner: string;
}

// Obtener todas las patentes
router.get("/", (req, res) => {
  const data: PlateData[] = JSON.parse(readFileSync(dbPath, "utf-8"));
  res.json(data);
});

// Agregar patente
router.post("/", (req, res) => {
  const newPlate: PlateData = req.body;
  const data: PlateData[] = JSON.parse(readFileSync(dbPath, "utf-8"));
  data.push(newPlate);
  writeFileSync(dbPath, JSON.stringify(data, null, 2));
  res.status(201).json(newPlate);
});

// Eliminar patente
router.delete("/:plate", (req, res) => {
  const plate = req.params.plate;
  let data: PlateData[] = JSON.parse(readFileSync(dbPath, "utf-8"));
  const index = data.findIndex((p) => p.plate === plate);
  if (index === -1) return res.status(404).json({ message: "No encontrada" });
  data.splice(index, 1);
  writeFileSync(dbPath, JSON.stringify(data, null, 2));
  res.json({ message: "Eliminada correctamente" });
});

export default router;
