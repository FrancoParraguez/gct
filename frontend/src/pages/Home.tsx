import { useState } from "react";
import CameraCapture from "../components/CameraCapture";
import PlateResult from "../components/PlateResult";
import { checkPlate } from "../services/plateService";
import type { PlateData } from "../services/plateService";

export default function Home() {
  const [plateData, setPlateData] = useState<PlateData | null>(null);

  const handleCapture = async (imageData: string) => {
    try {
      const result = await checkPlate(imageData);
      setPlateData(result);
    } catch (error) {
      console.error("Error verificando patente:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Verificación de Patentes</h1>
      <CameraCapture onCapture={handleCapture} />
      <PlateResult plateData={plateData} />
    </div>
  );
}
