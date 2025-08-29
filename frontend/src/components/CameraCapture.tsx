import { useEffect, useRef, useState } from "react";

interface CameraCaptureProps {
  onCapture: (imageBlob: Blob) => void;
}

interface CameraDevice {
  deviceId: string;
  label: string;
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  // Detectar si es móvil
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const initCamera = async () => {
    try {
      // Pedir permiso a la cámara
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
      tempStream.getTracks().forEach(track => track.stop());

      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = mediaDevices
        .filter(d => d.kind === "videoinput")
        .map(d => ({ deviceId: d.deviceId, label: d.label || `Camera ${d.deviceId}` }));

      setDevices(videoDevices);

      if (isMobile) {
        // Móvil: seleccionar automáticamente trasera
        const rearCamera = videoDevices.find(d => /back|rear|environment/i.test(d.label));
        setSelectedDevice(rearCamera?.deviceId || videoDevices[0]?.deviceId || null);
        // Iniciar cámara automáticamente
        setTimeout(() => startCamera(), 100);
      } else {
        // Desktop: seleccionar la primera disponible
        setSelectedDevice(videoDevices[0]?.deviceId || null);
      }
    } catch (err) {
      console.error("No se pudo acceder a la cámara:", err);
      alert("No se pudo acceder a la cámara del dispositivo.");
    }
  };

  useEffect(() => {
    initCamera();
  }, []);

  const startCamera = async () => {
    if (!selectedDevice) return alert("Selecciona una cámara primero");
    stopCamera();

    try {
      const constraints = isMobile
        ? { video: { facingMode: "environment" } } // móvil usa trasera
        : { video: { deviceId: { exact: selectedDevice } } }; // desktop usa selección

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
      console.error("Error al iniciar la cámara:", err);
      alert("No se pudo iniciar la cámara seleccionada.");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      if (!blob) return;
      setCapturedImage(URL.createObjectURL(blob));
      onCapture(blob);
    }, "image/jpeg");
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    setStream(null);
    setCameraReady(false);
  };

  useEffect(() => stopCamera, []);

  return (
    <div className="flex flex-col items-center gap-4">
      {!isMobile && devices.length > 0 && (
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
        <button
          onClick={startCamera}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Iniciar cámara
        </button>
        <button
          onClick={capturePhoto}
          disabled={!cameraReady}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Capturar
        </button>
        <button
          onClick={stopCamera}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Detener
        </button>
      </div>

      {capturedImage && (
        <div className="mt-4">
          <p className="text-center font-semibold">Captura realizada:</p>
          <img
            src={capturedImage}
            alt="Captura"
            className="border rounded w-full max-w-md"
          />
        </div>
      )}
    </div>
  );
}
