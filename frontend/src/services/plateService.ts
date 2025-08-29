const API_BASE = "https://gct-rjuc.onrender.com/api";

export interface PlateData {
  plate: string;
  owner: string;
  registered?: boolean; // opcional para Home
}

// Traer todas las patentes
export async function getPlates(): Promise<PlateData[]> {
  const res = await fetch(`${API_BASE}/plates`);
  if (!res.ok) throw new Error("Error cargando patentes");
  return res.json();
}

// Agregar patente
export async function addPlate(plateData: { plate: string; owner: string }) {
  const res = await fetch(`${API_BASE}/plates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(plateData),
  });
  if (!res.ok) throw new Error("Error agregando patente");
}

// Eliminar patente
export async function deletePlate(plate: string) {
  const res = await fetch(`${API_BASE}/plates/${plate}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error eliminando patente");
}

// Verificar patente (para Home)
export async function checkPlate(imageData: string): Promise<PlateData> {
  const res = await fetch(`${API_BASE}/check-plate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageData }),
  });
  if (!res.ok) throw new Error("Error verificando patente");
  return res.json();
}
