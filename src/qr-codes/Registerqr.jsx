function Scanner() {

  return (
    <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333' }}>QR Codeni Skaner Qiling!</h1>
      <img 
        src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://http://frontqr.vercel.app/login"
        alt="QR Code"
      />
    </div>
  );
}

export default Scanner;