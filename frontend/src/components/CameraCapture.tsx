import { useEffect, useRef, useState } from "react";

interface CameraCaptureProps {
  onCapture?: (imageBlob: Blob) => Promise<void>; // función async que recibe Blob
}

interface CameraDevice {
  deviceId: string;
  label: string;
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImageURL, setCapturedImageURL] = useState<string | null>(null);
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  // Listar cámaras y seleccionar automáticamente trasera si existe
  const listCameras = async () => {
    const mediaDevices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = mediaDevices
      .filter(d => d.kind === "videoinput")
      .map(d => ({ deviceId: d.deviceId, label: d.label || `Camera ${d.deviceId}` }));

    setDevices(videoDevices);

    const rearCamera = videoDevices.find(d => /back|rear|environment/i.test(d.label));
    setSelectedDevice(rearCamera?.deviceId || videoDevices[0]?.deviceId || null);
  };

  useEffect(() => {
    listCameras();
  }, []);

  // Iniciar cámara
  const startCamera = async () => {
    stopCamera();
    if (!selectedDevice) return alert("Selecciona una cámara primero");

    try {
      const constraints = { video: { deviceId: { exact: selectedDevice } } };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraReady(true);
        };
      }

      setStream(mediaStream);
    } catch (err) {
      console.error("Error al iniciar cámara:", err);
      alert("No se pudo acceder a la cámara seleccionada.");
    }
  };

  // Capturar foto
  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      alert("La cámara aún no está lista, intenta de nuevo.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir a Blob
    canvas.toBlob(async blob => {
      if (!blob) return;
      // Mostrar en pantalla
      const imageURL = URL.createObjectURL(blob);
      setCapturedImageURL(imageURL);

      // Enviar al backend
      if (onCapture) {
        try {
          await onCapture(blob);
        } catch (err) {
          console.error("Error enviando imagen al backend:", err);
        }
      }
    }, "image/jpeg", 0.9); // calidad 90%
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    setStream(null);
    setCameraReady(false);
  };

  useEffect(() => stopCamera, []);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Selector de cámara */}
      {devices.length > 0 && (
        <select
          value={selectedDevice || ""}
          onChange={e => setSelectedDevice(e.target.value)}
          className="border rounded px-2 py-1 mb-2"
        >
          {devices.map(d => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label}
            </option>
          ))}
        </select>
      )}

      <video ref={videoRef} className="border rounded w-full max-w-md" autoPlay />

      <div className="flex gap-2 mt-2">
        <button onClick={startCamera} className="bg-blue-500 text-white px-4 py-2 rounded">
          Iniciar cámara
        </button>
        <button
          onClick={capturePhoto}
          disabled={!cameraReady}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Capturar
        </button>
        <button onClick={stopCamera} className="bg-red-500 text-white px-4 py-2 rounded">
          Detener
        </button>
      </div>

      {capturedImageURL && (
        <div className="mt-4">
          <p className="text-center font-semibold">Captura realizada:</p>
          <img
            src={capturedImageURL}
            alt="Captura"
            className="border rounded w-full max-w-md"
          />
        </div>
      )}
    </div>
  );
}
