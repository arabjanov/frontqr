import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    agreeToTerms: false,
    profileImage: null
  });
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [step, setStep] = useState('form');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFaceAPIReady, setIsFaceAPIReady] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Face API yuklanmoqda...');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadFaceAPI = async () => {
      try {
        setLoadingMessage('Face API kutubxonasi yuklanmoqda...');
        
        // Face-api.js scriptni yuklash
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.min.js';
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = () => reject(new Error('Face-api.js yuklanmadi'));
          document.body.appendChild(script);
        });

        // Kutish
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (!window.faceapi) {
          throw new Error('Face-api.js obyekti topilmadi');
        }

        setLoadingMessage('AI modellari yuklanmoqda...');

        // Model fayllarini yuklash
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        
        await Promise.all([
          window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          window.faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          window.faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
        ]);

        setIsFaceAPIReady(true);
        setLoadingMessage('');
      } catch (error) {
        console.error('❌ Face-api.js yuklashda xatolik:', error);
        setErrorMessage(`Tizim yuklanmadi: ${error.message}. Internetni tekshiring va sahifani yangilang.`);
        setLoadingMessage('');
      }
    };

    loadFaceAPI();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrorMessage('');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profileImage: file }));
      const reader = new FileReader();
      reader.onload = (e) => setProfileImagePreview(e.target.result);
      reader.readAsDataURL(file);
      setErrorMessage('');
    }
  };

  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';

    if (ua.indexOf('Firefox') > -1) {
      browserName = 'Firefox';
      browserVersion = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) {
      browserName = 'Chrome';
      browserVersion = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
      browserName = 'Safari';
      browserVersion = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.indexOf('Edg') > -1) {
      browserName = 'Edge';
      browserVersion = ua.match(/Edg\/(\d+)/)?.[1] || 'Unknown';
    }

    return { browserName, browserVersion };
  };

  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let deviceType = 'Desktop';
    let os = 'Unknown';
    let osVersion = 'Unknown';
    
    if (/Android/i.test(ua)) {
      deviceType = 'Mobile';
      os = 'Android';
      osVersion = ua.match(/Android (\d+(\.\d+)?)/)?.[1] || 'Unknown';
    } else if (/iPhone|iPad|iPod/i.test(ua)) {
      deviceType = /iPad/i.test(ua) ? 'Tablet' : 'Mobile';
      os = 'iOS';
      osVersion = ua.match(/OS (\d+(_\d+)?)/)?.[1]?.replace('_', '.') || 'Unknown';
    } else if (/Windows/i.test(ua)) {
      os = 'Windows';
      osVersion = ua.match(/Windows NT (\d+\.\d+)/)?.[1] || 'Unknown';
    } else if (/Mac OS X/i.test(ua)) {
      os = 'macOS';
      osVersion = ua.match(/Mac OS X (\d+[._]\d+)/)?.[1]?.replace('_', '.') || 'Unknown';
    } else if (/Linux/i.test(ua)) {
      os = 'Linux';
    }

    const architecture = navigator.platform.includes('64') ? '64-bit' : '32-bit';

    return { deviceType, os, osVersion, architecture };
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setErrorMessage('Iltimos, ismingizni kiriting');
      return false;
    }
    if (!formData.lastName.trim()) {
      setErrorMessage('Iltimos, familiyangizni kiriting');
      return false;
    }
    if (!formData.phone.trim()) {
      setErrorMessage('Iltimos, telefon raqamingizni kiriting');
      return false;
    }
    if (!formData.agreeToTerms) {
      setErrorMessage('Iltimos, shartnoma shartlariga rozilik bering');
      return false;
    }
    if (!formData.profileImage) {
      setErrorMessage('Iltimos, profil rasmingizni yuklang');
      return false;
    }
    return true;
  };

  const detectFaceInImage = async (imageElement) => {
    if (!window.faceapi) {
      throw new Error('Face-api.js yuklanmagan');
    }
    
    // Rasm uchun SsdMobilenetv1 ishlatamiz (aniqroq)
    const detection = await window.faceapi
      .detectSingleFace(imageElement, new window.faceapi.SsdMobilenetv1Options())
      .withFaceLandmarks()
      .withFaceDescriptor();
    return detection;
  };

  const detectFaceInVideo = async (videoElement) => {
    if (!window.faceapi) {
      throw new Error('Face-api.js yuklanmagan');
    }
    
    // Video uchun TinyFaceDetector ishlatamiz (tezroq)
    const detection = await window.faceapi
      .detectSingleFace(videoElement, new window.faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
    return detection;
  };

  const startFaceVerification = async () => {
    if (!validateForm()) return;

    if (!isFaceAPIReady) {
      setErrorMessage('Yuz aniqlash tizimi hali yuklanmagan. Iltimos, bir oz kuting...');
      return;
    }

    setIsLoading(true);
    setStep('verifying');
    setErrorMessage('');

    try {
      // 1. Yuklangan rasmdan yuz aniqlash
      const img = new Image();
      img.src = profileImagePreview;
      await new Promise((resolve) => { img.onload = resolve; });
      
      const uploadedFaceDescriptor = await detectFaceInImage(img);
      
      if (!uploadedFaceDescriptor) {
        setErrorMessage('Yuklangan rasmda yuz aniqlanmadi. Iltimos, aniqroq yuz ko\'ringan rasm yuklang.');
        setStep('form');
        setIsLoading(false);
        return;
      }

      // 2. Kamerani yoqish
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      // 3. Kameraning tayyor bo'lishini kutish
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 4. Kameradan yuz aniqlash
      const liveDetection = await detectFaceInVideo(videoRef.current);

      if (!liveDetection) {
        setErrorMessage('Kamerada yuz aniqlanmadi. Iltimos, kameraga to\'g\'ri qarang va yorug\'lik yaxshi ekanligiga ishonch hosil qiling.');
        stopCamera();
        setStep('form');
        setIsLoading(false);
        return;
      }

      // 5. Yuzlarni solishtirish
      const distance = window.faceapi.euclideanDistance(
        uploadedFaceDescriptor.descriptor,
        liveDetection.descriptor
      );

      console.log('Yuzlar orasidagi masofa:', distance);

      // Distance 0.6 dan kichik bo'lsa, yuzlar bir xil
      if (distance < 0.6) {
        // Kameradan rasmni olish
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const verifiedFaceImage = canvas.toDataURL('image/jpeg');

        // Ma'lumotlarni yig'ish
        const browserInfo = getBrowserInfo();
        const deviceInfo = getDeviceInfo();
        const registrationData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          profileImage: profileImagePreview,
          verifiedFaceImage: verifiedFaceImage,
          registrationDate: new Date().toISOString(),
          browserName: browserInfo.browserName,
          browserVersion: browserInfo.browserVersion,
          deviceType: deviceInfo.deviceType,
          os: deviceInfo.os,
          osVersion: deviceInfo.osVersion,
          architecture: deviceInfo.architecture,
          faceMatchDistance: distance
        };

        // Backendga yuborish
        try {
          const response = await fetch('http://localhost:3001/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registrationData)
          });

          if (response.ok) {
            console.log('✅ Ma\'lumotlar muvaffaqiyatli yuborildi');
          } else {
            console.warn('⚠️ Backend javob bermadi, lekin ro\'yxatdan o\'tish davom etadi');
          }
        } catch (fetchError) {
          console.warn('⚠️ Backend bilan bog\'lanib bo\'lmadi:', fetchError.message);
        }

        setStep('success');
        stopCamera();
      } else {
        setErrorMessage(`Yuz mos kelmadi (o'xshashlik: ${(100 - distance * 100).toFixed(1)}%). Iltimos, yuklagan rasmingizda o'zingiz tasvirlanganligiga ishonch hosil qiling.`);
        stopCamera();
        setStep('form');
      }
    } catch (error) {
      console.error('Xatolik:', error);
      setErrorMessage('Xatolik yuz berdi: ' + error.message);
      stopCamera();
      setStep('form');
    }
    
    setIsLoading(false);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    card: {
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      width: '100%',
      maxWidth: '450px',
      padding: '40px',
      position: 'relative'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#1a202c',
      marginBottom: '30px'
    },
    imageUploadContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '30px'
    },
    imageUploadBox: {
      width: '130px',
      height: '130px',
      borderRadius: '50%',
      background: '#e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s',
      overflow: 'hidden'
    },
    uploadText: {
      fontSize: '14px',
      color: '#64748b',
      marginTop: '10px'
    },
    inputGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '8px'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '10px',
      fontSize: '16px',
      transition: 'all 0.3s',
      boxSizing: 'border-box'
    },
    checkboxContainer: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      marginBottom: '20px'
    },
    checkbox: {
      marginTop: '4px',
      width: '18px',
      height: '18px',
      cursor: 'pointer'
    },
    checkboxLabel: {
      fontSize: '14px',
      color: '#374151',
      lineHeight: '1.5'
    },
    link: {
      color: '#667eea',
      textDecoration: 'none',
      fontWeight: '500'
    },
    errorBox: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      padding: '12px',
      background: '#fee2e2',
      border: '1px solid #fecaca',
      borderRadius: '10px',
      marginBottom: '20px'
    },
    errorText: {
      fontSize: '14px',
      color: '#991b1b',
      lineHeight: '1.5'
    },
    button: {
      width: '100%',
      background: '#667eea',
      color: 'white',
      fontWeight: '600',
      fontSize: '16px',
      padding: '14px',
      borderRadius: '10px',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      transition: 'all 0.3s'
    },
    buttonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed'
    },
    video: {
      width: '100%',
      borderRadius: '10px',
      marginBottom: '20px',
      transform: 'scaleX(-1)'
    },
    successContainer: {
      textAlign: 'center'
    },
    successTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1a202c',
      margin: '20px 0 10px 0'
    },
    successText: {
      fontSize: '16px',
      color: '#64748b'
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255,255,255,0.95)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '20px',
      zIndex: 1000
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {!isFaceAPIReady && loadingMessage && (
          <div style={styles.loadingOverlay}>
            <Loader size={40} color="#667eea" style={{animation: 'spin 1s linear infinite', marginBottom: '15px'}} />
            <p style={{color: '#374151', fontWeight: '500'}}>{loadingMessage}</p>
          </div>
        )}

        <h1 style={styles.title}>Ro'yxatdan O'tish</h1>

        {step === 'form' && (
          <div>
            <div style={styles.imageUploadContainer}>
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={styles.imageUploadBox}
                onMouseEnter={(e) => e.currentTarget.style.background = '#cbd5e0'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#e2e8f0'}
              >
                {profileImagePreview ? (
                  <img src={profileImagePreview} alt="Profile" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                ) : (
                  <Upload size={48} color="#94a3b8" />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{display: 'none'}}
              />
              <p style={styles.uploadText}>Rasmni yuklash uchun bosing</p>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Ism</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="Ismingizni kiriting"
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Familiya</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="Familiyangizni kiriting"
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Telefon raqam</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="+998 90 123 45 67"
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={styles.checkboxContainer}>
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                style={styles.checkbox}
              />
              <label style={styles.checkboxLabel}>
                Men{' '}
                <a href="#" style={styles.link}>foydalanish shartlari</a>
                {' '}va{' '}
                <a href="#" style={styles.link}>maxfiylik siyosati</a>
                ga roziman
              </label>
            </div>

            {errorMessage && (
              <div style={styles.errorBox}>
                <AlertCircle size={20} color="#991b1b" style={{flexShrink: 0}} />
                <p style={styles.errorText}>{errorMessage}</p>
              </div>
            )}

            <button
              onClick={startFaceVerification}
              disabled={isLoading || !isFaceAPIReady}
              style={{...styles.button, ...(isLoading || !isFaceAPIReady ? styles.buttonDisabled : {})}}
              onMouseEnter={(e) => !isLoading && isFaceAPIReady && (e.currentTarget.style.background = '#5a67d8')}
              onMouseLeave={(e) => !isLoading && isFaceAPIReady && (e.currentTarget.style.background = '#667eea')}
            >
              {isLoading ? (
                <Loader size={20} style={{animation: 'spin 1s linear infinite'}} />
              ) : !isFaceAPIReady ? (
                <>
                  <Loader size={20} style={{animation: 'spin 1s linear infinite'}} />
                  <span>Tizim yuklanmoqda...</span>
                </>
              ) : (
                <>
                  <Camera size={20} />
                  <span>Ro'yxatdan O'tish</span>
                </>
              )}
            </button>
          </div>
        )}

        {step === 'verifying' && (
          <div style={{textAlign: 'center'}}>
            <video 
              ref={videoRef} 
              style={styles.video}
              autoPlay 
              playsInline 
              muted
            />
            <canvas ref={canvasRef} style={{display: 'none'}} />
            <p style={{color: '#374151', marginBottom: '20px', fontWeight: '500'}}>
              Yuzingizni tekshirilmoqda...
            </p>
            <Loader size={32} color="#667eea" style={{animation: 'spin 1s linear infinite', margin: '0 auto'}} />
          </div>
        )}

        {step === 'success' && (
          <div style={styles.successContainer}>
            <CheckCircle size={64} color="#10b981" style={{margin: '0 auto'}} />
            <h2 style={styles.successTitle}>Muvaffaqiyatli!</h2>
            <p style={styles.successText}>Siz muvaffaqiyatli ro'yxatdan o'tdingiz.</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RegistrationPage;