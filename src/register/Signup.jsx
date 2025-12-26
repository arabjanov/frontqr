import { useState, useRef } from 'react';
import { Camera, Upload, X, Check } from 'lucide-react';

export default function ImageUploadCamera() {
  const [image, setImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fayldan rasm yuklash
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  // Kamerani yoqish
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setStream(mediaStream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      alert('Kameraga ruxsat berilmadi yoki kamera mavjud emas');
      console.error('Kamera xatosi:', err);
    }
  };

  // Kamerani o'chirish
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  // Rasmga tushish
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg');
      setImage(imageData);
      stopCamera();
    }
  };

  // Rasmni o'chirish
  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Profil Rasmini Yuklash
        </h2>

        {/* Rasm ko'rsatish */}
        {image && (
          <div className="mb-6 relative">
            <img 
              src={image} 
              alt="Yuklangan rasm" 
              className="w-full h-64 object-cover rounded-xl shadow-lg"
            />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Kamera ko'rinishi */}
        {showCamera && (
          <div className="mb-6">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              className="w-full h-64 object-cover rounded-xl shadow-lg bg-black"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={capturePhoto}
                className="flex-1 bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2 font-semibold"
              >
                <Check size={20} />
                Rasmga Tush
              </button>
              <button
                onClick={stopCamera}
                className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition flex items-center justify-center gap-2 font-semibold"
              >
                <X size={20} />
                Bekor Qilish
              </button>
            </div>
          </div>
        )}

        {/* Tugmalar */}
        {!showCamera && (
          <div className="space-y-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2 font-semibold text-lg"
            >
              <Upload size={24} />
              Fayldan Yuklash
            </button>
            
            <button
              onClick={startCamera}
              className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg hover:bg-purple-600 transition flex items-center justify-center gap-2 font-semibold text-lg"
            >
              <Camera size={24} />
              Kamerani Yoqish
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {/* Canvas (yashirin) */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Ko'rsatma */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            Kompyuterdan rasm yuklang yoki kamera orqali rasmga tushing
          </p>
        </div>
      </div>
    </div>
  );
}