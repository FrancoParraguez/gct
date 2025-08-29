import { useState } from "react";
import CameraCapture from "../components/CameraCapture";
import PlateResult from "../components/PlateResult";
import { checkPlate } from "../services/plateService";
import type { PlateData } from "../services/plateService";

export default function Home() {
  const [plateData, setPlateData] = useState<PlateData | null>(null);

  const handleCapture = async (imageBlob: Blob) => {
    try {
      // Convertir a base64 para enviar al backend
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const result = await checkPlate(base64data);
        setPlateData(result);
      };
      reader.readAsDataURL(imageBlob);
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
