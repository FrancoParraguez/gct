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
  const [paused, setPaused] = useState(false);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Inicializar cámaras automáticamente
  const initCamera = async () => {
    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
      tempStream.getTracks().forEach(track => track.stop());

      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = mediaDevices
        .filter(d => d.kind === "videoinput")
        .map(d => ({ deviceId: d.deviceId, label: d.label || `Camera ${d.deviceId}` }));

      setDevices(videoDevices);

      if (isMobile) {
        setSelectedDevice(null);
        setTimeout(() => startCamera(true), 100); // cámara trasera
      } else {
        setSelectedDevice(videoDevices[0]?.deviceId || null);
        startCamera(); // iniciar cámara de escritorio automáticamente
      }
    } catch (err) {
      console.error("No se pudo acceder a la cámara:", err);
      alert("No se pudo acceder a la cámara del dispositivo.");
    }
  };

  useEffect(() => {
    initCamera();
  }, []);

  const startCamera = async (useRearCamera = false) => {
    stopCamera();

    try {
      const constraints = isMobile && useRearCamera
        ? { video: { facingMode: { ideal: "environment" } } }
        : selectedDevice
        ? { video: { deviceId: { exact: selectedDevice } } }
        : { video: true };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraReady(true);
        };
      }

      setStream(mediaStream);
      setPaused(false);
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

    // Convertir a escala de grises
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
      data[i] = data[i+1] = data[i+2] = gray;
    }
    ctx.putImageData(imageData, 0, 0);

    // Crear blob con calidad reducida para menor peso
    canvas.toBlob(blob => {
      if (!blob) return;
      setCapturedImage(URL.createObjectURL(blob));
      onCapture(blob);
    }, "image/jpeg", 0.6); // calidad reducida
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    setStream(null);
    setCameraReady(false);
    setPaused(false);
  };

  const togglePause = () => {
    if (!videoRef.current) return;

    if (!paused) {
      videoRef.current.pause();
      setPaused(true);
    } else {
      videoRef.current.play();
      setPaused(false);
    }
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
          onClick={capturePhoto}
          disabled={!cameraReady}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Capturar
        </button>
        <button
          onClick={togglePause}
          disabled={!cameraReady}
          className="bg-yellow-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {paused ? "Reanudar" : "Pausar"}
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
