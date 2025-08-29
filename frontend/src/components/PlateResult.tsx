interface PlateResultProps {
  plateData: { plate: string; owner?: string; registered?: boolean } | null;
}

export default function PlateResult({ plateData }: PlateResultProps) {
  if (!plateData) return null;

  return (
    <div className="mt-4 p-4 border rounded bg-gray-50">
      <h2 className="text-xl font-bold">Resultado de patente</h2>
      <p><strong>Patente:</strong> {plateData.plate}</p>
      {plateData.owner && <p><strong>Propietario:</strong> {plateData.owner}</p>}
      {plateData.registered !== undefined && (
        <p><strong>Estado:</strong> {plateData.registered ? "Registrada" : "No registrada"}</p>
      )}
    </div>
  );
}
