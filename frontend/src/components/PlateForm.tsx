import { useState } from "react";

interface PlateFormProps {
  onAddPlate: (plate: string, owner: string) => void;
}

export default function PlateForm({ onAddPlate }: PlateFormProps) {
  const [plate, setPlate] = useState("");
  const [owner, setOwner] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate || !owner) return;
    onAddPlate(plate.toUpperCase(), owner);
    setPlate("");
    setOwner("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-md">
      <input
        type="text"
        placeholder="Patente"
        value={plate}
        onChange={(e) => setPlate(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        type="text"
        placeholder="Propietario"
        value={owner}
        onChange={(e) => setOwner(e.target.value)}
        className="border p-2 rounded"
      />
      <button
        type="submit"
        className="bg-green-500 text-white px-4 py-2 rounded mt-2"
      >
        Agregar Patente
      </button>
    </form>
  );
}
