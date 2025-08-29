import { useEffect, useState } from "react";
import PlateForm from "../components/PlateForm";
import { getPlates, addPlate, deletePlate } from "../services/plateService";
import type { PlateData } from "../services/plateService";

export default function Admin() {
  const [plates, setPlates] = useState<PlateData[]>([]);

  const loadPlates = async () => {
    try {
      const data = await getPlates();
      setPlates(data);
    } catch (error) {
      console.error("Error cargando patentes:", error);
    }
  };

  useEffect(() => {
    loadPlates();
  }, []);

  const handleAddPlate = async (plate: string, owner: string) => {
    try {
      await addPlate({ plate, owner });
      loadPlates();
    } catch (error) {
      console.error("Error agregando patente:", error);
    }
  };

  const handleDeletePlate = async (plate: string) => {
    try {
      await deletePlate(plate);
      loadPlates();
    } catch (error) {
      console.error("Error eliminando patente:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Panel de Administración</h1>
      <PlateForm onAddPlate={handleAddPlate} />

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Registros de Patentes</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Patente</th>
              <th className="border p-2">Propietario</th>
              <th className="border p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {plates.map((p) => (
              <tr key={p.plate} className="text-center">
                <td className="border p-2">{p.plate}</td>
                <td className="border p-2">{p.owner}</td>
                <td className="border p-2">
                  <button
                    onClick={() => handleDeletePlate(p.plate)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {plates.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center p-4">
                  No hay registros
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
