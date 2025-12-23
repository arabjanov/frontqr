import { useState } from "react";

function Hello(){
  const [formData, setFormData] = useState({
    organization: '',
    fullName: '',
    phone: '',
    verificationCode: '',
    agreedToTerms: false,
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captureMethod, setCaptureMethod] = useState(null); // 'camera' yoki 'gallery'

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Kameradan rasm olish
  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Modal yaratish
      const modal = document.createElement('div');
      modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;';
      
      video.style.cssText = 'max-width:90%;max-height:70%;border-radius:10px;';
      modal.appendChild(video);

      const captureBtn = document.createElement('button');
      captureBtn.textContent = '📸 Rasmga tushirish';
      captureBtn.style.cssText = 'margin-top:20px;padding:15px 30px;font-size:18px;background:#4CAF50;color:white;border:none;border-radius:10px;cursor:pointer;';
      
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = '❌ Bekor qilish';
      cancelBtn.style.cssText = 'margin-top:10px;padding:15px 30px;font-size:18px;background:#f44336;color:white;border:none;border-radius:10px;cursor:pointer;';

      modal.appendChild(captureBtn);
      modal.appendChild(cancelBtn);
      document.body.appendChild(modal);

      captureBtn.onclick = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg');
        setImagePreview(imageData);
        setFormData(prev => ({ ...prev, image: imageData }));
        
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(modal);
      };

      cancelBtn.onclick = () => {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(modal);
      };

    } catch (error) {
      alert('Kameraga ruxsat berilmadi yoki xatolik yuz berdi');
      console.error(error);
    }
  };

  // Galereyadan rasm tanlash
  const handleGalleryUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Rasm hajmi 5MB dan kichik bo\'lishi kerak' }));
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Device va browser ma'lumotlarini olish
  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    
    // Browser aniqlash
    let browser = 'Unknown';
    let browserVersion = 'Unknown';
    
    if (ua.includes('Chrome') && !ua.includes('Edg')) {
      browser = 'Chrome';
      browserVersion = ua.match(/Chrome\/([\d.]+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      browser = 'Safari';
      browserVersion = ua.match(/Version\/([\d.]+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Firefox')) {
      browser = 'Firefox';
      browserVersion = ua.match(/Firefox\/([\d.]+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Edg')) {
      browser = 'Edge';
      browserVersion = ua.match(/Edg\/([\d.]+)/)?.[1] || 'Unknown';
    }

    // OS aniqlash
    let os = 'Unknown';
    let osVersion = 'Unknown';
    
    if (ua.includes('Windows NT')) {
      os = 'Windows';
      const winVersion = ua.match(/Windows NT ([\d.]+)/)?.[1];
      const winMap = { '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7' };
      osVersion = winMap[winVersion] || winVersion || 'Unknown';
    } else if (ua.includes('Mac OS X')) {
      os = 'macOS';
      osVersion = ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, '.') || 'Unknown';
    } else if (ua.includes('Android')) {
      os = 'Android';
      osVersion = ua.match(/Android ([\d.]+)/)?.[1] || 'Unknown';
    } else if (ua.includes('iPhone') || ua.includes('iPad')) {
      os = 'iOS';
      osVersion = ua.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') || 'Unknown';
    } else if (ua.includes('Linux')) {
      os = 'Linux';
    }

    // Device type
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const device = isMobile ? 'Phone' : 'Desktop';

    // Platform bit architecture
    const platform = navigator.platform || 'Unknown';
    const is64bit = ua.includes('x64') || ua.includes('Win64') || ua.includes('x86_64') || ua.includes('aarch64') || platform.includes('64');
    const architecture = is64bit ? '64-bit' : '32-bit';

    return {
      browser,
      browserVersion,
      os,
      osVersion,
      device,
      architecture,
      platform
    };
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.organization.trim()) {
      newErrors.organization = 'Tashkilot nomini kiriting';
    }
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Ism va familiyani kiriting';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon raqamni kiriting';
    } else if (!/^[\d\s\+\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Telefon raqam noto\'g\'ri formatda';
    }
    
    if (!formData.verificationCode.trim()) {
      newErrors.verificationCode = 'Tasdiqlash kodini kiriting';
    } else if (formData.verificationCode.length < 4) {
      newErrors.verificationCode = 'Kod kamida 4 raqamdan iborat bo\'lishi kerak';
    }
    
    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms = 'Shartnomani tasdiqlashingiz kerak';
    }

    if (!formData.image) {
      newErrors.image = 'Rasm yuklash majburiy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date();
      const deviceInfo = getDeviceInfo();
      
      // Sekundlargacha aniq vaqt
      const registrationDateTime = {
        date: now.toLocaleDateString('uz-UZ'),
        time: now.toLocaleTimeString('uz-UZ', { hour12: false }),
        fullDateTime: now.toISOString(),
        timestamp: now.getTime(),
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
        hour: now.getHours(),
        minute: now.getMinutes(),
        second: now.getSeconds(),
        millisecond: now.getMilliseconds()
      };

      // Backendga yuboradigan to'liq ma'lumot
      const registrationData = {
        // Foydalanuvchi ma'lumotlari
        organization: formData.organization,
        fullName: formData.fullName,
        phone: formData.phone,
        image: formData.image,
        
        // Tasdiqlash
        verificationCode: formData.verificationCode,
        agreedToTerms: formData.agreedToTerms,
        
        // Registratsiya vaqti (sekundlargacha)
        registrationDateTime: registrationDateTime,
        
        // Browser ma'lumotlari
        browserInfo: {
          browser: deviceInfo.browser,
          browserVersion: deviceInfo.browserVersion,
          userAgent: navigator.userAgent
        },
        
        // OS ma'lumotlari
        osInfo: {
          os: deviceInfo.os,
          osVersion: deviceInfo.osVersion
        },
        
        // Device ma'lumotlari
        deviceInfo: {
          deviceType: deviceInfo.device,
          architecture: deviceInfo.architecture,
          platform: deviceInfo.platform,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          language: navigator.language
        },
        
        // Qo'shimcha
        id: now.getTime(),
        ipAddress: 'Backend tomonidan aniqlanadi'
      };

      // Storage'ga saqlash (vaqtinchalik)
      const userId = `user:${registrationData.id}`;
      await window.storage.set(userId, JSON.stringify(registrationData));

      // Faylga saqlash (download)
      const dataStr = JSON.stringify(registrationData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `registration_${registrationData.id}.json`;
      link.click();
      URL.revokeObjectURL(url);

      // Console'ga chiqarish (backend uchun misol)
      console.log('=== BACKEND GA YUBORILADI ===');
      console.log(registrationData);
      console.log('============================');

      alert('✅ Muvaffaqiyatli ro\'yxatdan o\'tdingiz!\n\nMa\'lumotlar JSON faylga saqlandi va console\'da ko\'rishingiz mumkin.');
      
      setTimeout(() => setCurrentPage('home'), 1500);
    } catch (error) {
      alert('❌ Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
      console.error('Xatolik:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

	return(
		<>
			<div style={{ 
	      maxWidth: '600px', 
	      margin: '0 auto', 
	      padding: '20px',
	      fontFamily: 'Arial, sans-serif'
	    	}}>
	      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
	        <h1 style={{ color: '#4CAF50', marginBottom: '10px' }}>🖐️ Salom!</h1>
	        <h2 style={{ color: '#333', marginBottom: '10px' }}>Ro'yxatdan O'tish</h2>
	        <p style={{ color: '#666' }}>Iltimos, barcha ma'lumotlarni to'ldiring</p>
	      </div>
	      
	      <div>
	        {/* Rasm yuklash - Kamera yoki Gallery */}
	        <div style={{ marginBottom: '25px', textAlign: 'center' }}>
	          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#333' }}>
	            📸 Rasmingizni yuklang *
	          </label>
	          <div style={{
	            width: '150px',
	            height: '150px',
	            margin: '0 auto',
	            border: '3px dashed #4CAF50',
	            borderRadius: '50%',
	            display: 'flex',
	            alignItems: 'center',
	            justifyContent: 'center',
	            overflow: 'hidden',
	            backgroundColor: '#f9f9f9'
	          }}>
	            {imagePreview ? (
	              <img 
	                src={imagePreview} 
	                alt="Preview" 
	                style={{ 
	                  width: '100%', 
	                  height: '100%', 
	                  objectFit: 'cover'
	                }} 
	              />
	            ) : (
	              <span style={{ fontSize: '40px' }}>👤</span>
	            )}
	          </div>
	          
	          <p style={{ margin: '15px 0', fontSize: '14px', color: '#666' }}>O'zingiz xohlagan usulni tanlang:</p>
	          
	          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '10px' }}>
	            <button
	              type="button"
	              onClick={handleCameraCapture}
	              style={{
	                padding: '12px 20px',
	                backgroundColor: '#2196F3',
	                color: 'white',
	                border: 'none',
	                borderRadius: '8px',
	                cursor: 'pointer',
	                fontSize: '14px',
	                fontWeight: 'bold'
	              }}
	            >
	              📷 Kameradan olish
	            </button>
	            
	            <label style={{
	              padding: '12px 20px',
	              backgroundColor: '#FF9800',
	              color: 'white',
	              border: 'none',
	              borderRadius: '8px',
	              cursor: 'pointer',
	              fontSize: '14px',
	              fontWeight: 'bold'
	            }}>
	              🖼️ Galereyadan tanlash
	              <input
	                type="file"
	                accept="image/*"
	                onChange={handleGalleryUpload}
	                style={{ display: 'none' }}
	              />
	            </label>
	          </div>
	          {errors.image && <p style={{ color: 'red', fontSize: '14px' }}>{errors.image}</p>}
	        </div>

	        {/* Tashkilot nomi */}
	        <div style={{ marginBottom: '20px' }}>
	          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
	            🏢 Tashkilot nomi *
	          </label>
	          <input
	            type="text"
	            name="organization"
	            value={formData.organization}
	            onChange={handleInputChange}
	            placeholder="Tashkilot nomini kiriting"
	            style={{
	              width: '100%',
	              padding: '12px',
	              borderRadius: '8px',
	              border: errors.organization ? '2px solid red' : '2px solid #ddd',
	              fontSize: '16px',
	              outline: 'none'
	            }}
	          />
	          {errors.organization && <p style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>{errors.organization}</p>}
	        </div>

	        {/* Ism va Familiya */}
	        <div style={{ marginBottom: '20px' }}>
	          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
	            👤 Ism va Familiya *
	          </label>
	          <input
	            type="text"
	            name="fullName"
	            value={formData.fullName}
	            onChange={handleInputChange}
	            placeholder="To'liq ismingizni kiriting"
	            style={{
	              width: '100%',
	              padding: '12px',
	              borderRadius: '8px',
	              border: errors.fullName ? '2px solid red' : '2px solid #ddd',
	              fontSize: '16px',
	              outline: 'none'
	            }}
	          />
	          {errors.fullName && <p style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>{errors.fullName}</p>}
	        </div>

	        {/* Telefon raqam */}
	        <div style={{ marginBottom: '20px' }}>
	          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
	            📱 Telefon raqam *
	          </label>
	          <input
	            type="tel"
	            name="phone"
	            value={formData.phone}
	            onChange={handleInputChange}
	            placeholder="+998 90 123 45 67"
	            style={{
	              width: '100%',
	              padding: '12px',
	              borderRadius: '8px',
	              border: errors.phone ? '2px solid red' : '2px solid #ddd',
	              fontSize: '16px',
	              outline: 'none'
	            }}
	          />
	          {errors.phone && <p style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>{errors.phone}</p>}
	        </div>

	        {/* Tasdiqlash kodi */}
	        <div style={{ marginBottom: '20px' }}>
	          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
	            🔐 Tasdiqlash kodi *
	          </label>
	          <input
	            type="text"
	            name="verificationCode"
	            value={formData.verificationCode}
	            onChange={handleInputChange}
	            placeholder="SMS orqali kelgan kodni kiriting"
	            maxLength="6"
	            style={{
	              width: '100%',
	              padding: '12px',
	              borderRadius: '8px',
	              border: errors.verificationCode ? '2px solid red' : '2px solid #ddd',
	              fontSize: '16px',
	              outline: 'none',
	              letterSpacing: '3px',
	              textAlign: 'center'
	            }}
	          />
	          {errors.verificationCode && <p style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>{errors.verificationCode}</p>}
	        </div>

	        {/* Shartnoma */}
	        <div style={{ 
	          marginBottom: '25px', 
	          padding: '20px', 
	          backgroundColor: '#f0f8ff', 
	          borderRadius: '10px',
	          border: '2px solid #4CAF50'
	        }}>
	          <p style={{ fontSize: '16px', marginBottom: '15px', fontWeight: 'bold', color: '#333' }}>
	            📄 Shartnoma va Shartlar
	          </p>
	          <p style={{ fontSize: '14px', color: '#555', marginBottom: '15px', lineHeight: '1.6' }}>
	            Men shaxsiy ma'lumotlarimni qayta ishlashga rozi bo'laman va xizmat shartlariga rozilik bildiraman. 
	            Barcha ma'lumotlar xavfsiz saqlanadi va uchinchi shaxslarga berilmaydi.
	          </p>
	          
	          <div style={{ marginBottom: '15px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
	            <a 
	              href="https://t.me/your_bot_username" 
	              target="_blank" 
	              rel="noopener noreferrer"
	              style={{ 
	                color: '#0088cc', 
	                textDecoration: 'none',
	                fontWeight: 'bold',
	                fontSize: '15px'
	              }}
	            >
	              📱 Telegram Bot
	            </a>
	            <a 
	              href="#" 
	              onClick={(e) => {
	                e.preventDefault();
	                alert('Shartnoma matni:\n\n1. Shaxsiy ma\'lumotlar himoyasi\n2. Foydalanish shartlari\n3. Ma\'lumotlar saqlanish muddati\n\n(To\'liq matnni backenddan yuklanadi)');
	              }}
	              style={{ 
	                color: '#0088cc', 
	                textDecoration: 'none',
	                fontWeight: 'bold',
	                fontSize: '15px'
	              }}
	            >
	              📋 Shartnomani o'qish
	            </a>
	          </div>

	          <label style={{ 
	            display: 'flex', 
	            alignItems: 'center', 
	            cursor: 'pointer',
	            padding: '10px',
	            backgroundColor: 'white',
	            borderRadius: '8px'
	          }}>
	            <input
	              type="checkbox"
	              name="agreedToTerms"
	              checked={formData.agreedToTerms}
	              onChange={handleInputChange}
	              style={{ 
	                marginRight: '10px', 
	                width: '20px', 
	                height: '20px',
	                cursor: 'pointer'
	              }}
	            />
	            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
	              ✅ Men shartnomani o'qidim va roziman *
	            </span>
	          </label>
	          {errors.agreedToTerms && <p style={{ color: 'red', fontSize: '14px', marginTop: '10px' }}>{errors.agreedToTerms}</p>}
	        </div>

	        {/* Submit button */}
	        <button
	          onClick={handleSubmit}
	          disabled={isSubmitting}
	          style={{
	            width: '100%',
	            padding: '15px',
	            backgroundColor: isSubmitting ? '#ccc' : '#4CAF50',
	            color: 'white',
	            border: 'none',
	            borderRadius: '10px',
	            fontSize: '18px',
	            fontWeight: 'bold',
	            cursor: isSubmitting ? 'not-allowed' : 'pointer',
	            marginBottom: '10px',
	            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
	          }}
	        >
	          {isSubmitting ? '⏳ Yuklanmoqda...' : '✅ Ro\'yxatdan O\'tish'}
	        </button>

	        {/* Sign In button */}
	        <button
	          onClick={() => alert('Sign In sahifasi keyinroq qo\'shiladi')}
	          style={{
	            width: '100%',
	            padding: '15px',
	            backgroundColor: 'transparent',
	            color: '#4CAF50',
	            border: '2px solid #4CAF50',
	            borderRadius: '10px',
	            fontSize: '18px',
	            fontWeight: 'bold',
	            cursor: 'pointer',
	            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
	          }}
	        >
	          🔑 Sign In
	        </button>
	      </div>

	      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#999' }}>
	        * - Majburiy maydonlar
	      </p>
	    </div>
		</>
	)
}

export default Hello;