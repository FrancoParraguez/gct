import { useRef, useState } from "react";

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      // Intentar usar solo la cámara trasera
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: "environment" } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setStream(mediaStream);
    } catch (err) {
      console.error("No se pudo iniciar la cámara trasera:", err);
      alert("No se pudo acceder a la cámara trasera del dispositivo.");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg");
    onCapture(imageData);
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <video ref={videoRef} className="border rounded w-full max-w-md" />
      <div className="flex gap-2 mt-2">
        <button onClick={startCamera} className="bg-blue-500 text-white px-4 py-2 rounded">
          Iniciar cámara
        </button>
        <button onClick={capturePhoto} className="bg-green-500 text-white px-4 py-2 rounded">
          Capturar
        </button>
        <button onClick={stopCamera} className="bg-red-500 text-white px-4 py-2 rounded">
          Detener
        </button>
      </div>
    </div>
  );
}
